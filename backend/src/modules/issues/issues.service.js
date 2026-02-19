import pool, { query } from "../../db/pool.js";
import env from "../../config/env.js";
import HttpError from "../../utils/http-error.js";
import { ISSUE_STATUSES } from "../../utils/constants.js";
import { diceCoefficient } from "../../utils/string-similarity.js";
import { calculatePriorityScore, priorityLabel } from "../../services/priority.service.js";
import { uploadImage } from "../../services/storage.service.js";

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const distanceExpression = (latParam, lngParam) => `
  (6371000 * acos(
    LEAST(1, GREATEST(-1,
      cos(radians($${latParam})) * cos(radians(i.latitude)) *
      cos(radians(i.longitude) - radians($${lngParam})) +
      sin(radians($${latParam})) * sin(radians(i.latitude))
    ))
  ))
`;

const issueProjection = (distanceSql = "NULL::numeric AS distance_meters") => `
  SELECT
    i.id,
    i.title,
    i.description,
    i.category,
    i.status,
    i.severity,
    i.latitude,
    i.longitude,
    i.address,
    i.image_url,
    i.report_count,
    i.priority_score,
    i.reporter_id,
    i.department_id,
    i.created_at,
    i.updated_at,
    r.full_name AS reporter_name,
    d.name AS department_name,
    ${distanceSql}
  FROM issues i
  LEFT JOIN users r ON r.id = i.reporter_id
  LEFT JOIN departments d ON d.id = i.department_id
`;

const mapIssue = (row) => {
  const priorityScore = toNumber(row.priority_score) ?? 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    severity: Number(row.severity),
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    address: row.address,
    imageUrl: row.image_url,
    reportCount: Number(row.report_count),
    priorityScore,
    priorityLabel: priorityLabel(priorityScore),
    distanceMeters: toNumber(row.distance_meters),
    reporter: {
      id: row.reporter_id,
      fullName: row.reporter_name
    },
    department: row.department_id
      ? {
          id: row.department_id,
          name: row.department_name
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const recalculatePriority = async (client, issueId) => {
  const issueResult = await client.query(
    `SELECT id, report_count, severity, created_at, status
     FROM issues
     WHERE id = $1
     LIMIT 1`,
    [issueId]
  );

  if (issueResult.rowCount === 0) {
    throw new HttpError(404, "Issue not found");
  }

  const issue = issueResult.rows[0];
  const score = calculatePriorityScore({
    reportCount: Number(issue.report_count),
    severity: Number(issue.severity),
    createdAt: issue.created_at,
    status: issue.status
  });

  await client.query("UPDATE issues SET priority_score = $2 WHERE id = $1", [
    issueId,
    score
  ]);

  return score;
};

const findNearbyCandidates = async (client, latitude, longitude, radiusMeters) => {
  const distExpr = distanceExpression(1, 2);

  const result = await client.query(
    `${issueProjection(`${distExpr} AS distance_meters`)}
     WHERE i.status <> $4
       AND ${distExpr} <= $3
     ORDER BY distance_meters ASC
     LIMIT 25`,
    [latitude, longitude, radiusMeters, ISSUE_STATUSES.RESOLVED]
  );

  return result.rows;
};

const chooseDuplicate = (title, candidates) => {
  let best = null;

  for (const candidate of candidates) {
    const similarity = diceCoefficient(title, candidate.title);
    if (similarity < env.TITLE_SIMILARITY_THRESHOLD) {
      continue;
    }

    if (!best || similarity > best.similarity) {
      best = {
        candidate,
        similarity
      };
    }
  }

  return best;
};

export const getIssueById = async (issueId, db = { query }) => {
  const result = await db.query(
    `${issueProjection()}
     WHERE i.id = $1
     LIMIT 1`,
    [issueId]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Issue not found");
  }

  return mapIssue(result.rows[0]);
};

export const createIssue = async ({ payload, file, reporterId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const candidates = await findNearbyCandidates(
      client,
      payload.latitude,
      payload.longitude,
      env.DUPLICATE_RADIUS_METERS
    );

    const duplicate = chooseDuplicate(payload.title, candidates);

    if (duplicate) {
      const duplicateIssueId = duplicate.candidate.id;

      const alreadyReported = await client.query(
        `SELECT id
         FROM issue_reports
         WHERE issue_id = $1 AND reporter_id = $2
         LIMIT 1`,
        [duplicateIssueId, reporterId]
      );

      if (alreadyReported.rowCount > 0) {
        await client.query("COMMIT");

        return {
          issue: mapIssue(duplicate.candidate),
          isDuplicate: true,
          alreadyReported: true,
          similarity: Number(duplicate.similarity.toFixed(3))
        };
      }

      await client.query(
        `INSERT INTO issue_reports (issue_id, reporter_id, severity, note)
         VALUES ($1, $2, $3, $4)`,
        [duplicateIssueId, reporterId, payload.severity, payload.description]
      );

      await client.query(
        `UPDATE issues
         SET report_count = report_count + 1,
             severity = ROUND(((severity * report_count) + $2)::numeric / (report_count + 1))::int,
             updated_at = NOW()
         WHERE id = $1`,
        [duplicateIssueId, payload.severity]
      );

      await recalculatePriority(client, duplicateIssueId);

      await client.query(
        `INSERT INTO status_logs (issue_id, changed_by, old_status, new_status, note)
         VALUES ($1, $2, $3, $3, $4)`,
        [
          duplicateIssueId,
          reporterId,
          duplicate.candidate.status,
          "Duplicate report merged"
        ]
      );

      await client.query("COMMIT");

      const mergedIssue = await getIssueById(duplicateIssueId);

      return {
        issue: mergedIssue,
        isDuplicate: true,
        alreadyReported: false,
        similarity: Number(duplicate.similarity.toFixed(3))
      };
    }

    const imageUrl = await uploadImage(file);

    const inserted = await client.query(
      `INSERT INTO issues (
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address,
        image_url,
        status,
        reporter_id,
        department_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        payload.title,
        payload.description,
        payload.category,
        payload.severity,
        payload.latitude,
        payload.longitude,
        payload.address ?? null,
        imageUrl,
        ISSUE_STATUSES.PENDING,
        reporterId,
        payload.departmentId ?? null
      ]
    );

    const issueId = inserted.rows[0].id;

    await client.query(
      `INSERT INTO issue_reports (issue_id, reporter_id, severity, note)
       VALUES ($1, $2, $3, $4)`,
      [issueId, reporterId, payload.severity, payload.description]
    );

    await recalculatePriority(client, issueId);

    await client.query(
      `INSERT INTO status_logs (issue_id, changed_by, old_status, new_status, note)
       VALUES ($1, $2, NULL, $3, $4)`,
      [issueId, reporterId, ISSUE_STATUSES.PENDING, "Issue created"]
    );

    await client.query("COMMIT");

    const issue = await getIssueById(issueId);

    return {
      issue,
      isDuplicate: false,
      alreadyReported: false,
      similarity: null
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const listIssues = async (filters = {}) => {
  const values = [];
  const where = [];
  let paramIndex = 1;

  let distExpr = null;
  let distanceSql = "NULL::numeric AS distance_meters";

  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    const latParam = paramIndex;
    const lngParam = paramIndex + 1;
    values.push(filters.latitude, filters.longitude);
    paramIndex += 2;

    distExpr = distanceExpression(latParam, lngParam);
    distanceSql = `${distExpr} AS distance_meters`;

    if (filters.radius) {
      where.push(`${distExpr} <= $${paramIndex}`);
      values.push(filters.radius);
      paramIndex += 1;
    }
  }

  if (filters.status) {
    where.push(`i.status = $${paramIndex}`);
    values.push(filters.status);
    paramIndex += 1;
  }

  if (filters.category) {
    where.push(`i.category = $${paramIndex}`);
    values.push(filters.category);
    paramIndex += 1;
  }

  if (filters.departmentId) {
    where.push(`i.department_id = $${paramIndex}`);
    values.push(filters.departmentId);
    paramIndex += 1;
  }

  if (filters.reporterId) {
    where.push(`i.reporter_id = $${paramIndex}`);
    values.push(filters.reporterId);
    paramIndex += 1;
  }

  if (filters.search) {
    where.push(`(i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`);
    values.push(`%${filters.search}%`);
    paramIndex += 1;
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = distExpr
    ? "ORDER BY distance_meters ASC, i.priority_score DESC, i.created_at DESC"
    : "ORDER BY i.priority_score DESC, i.created_at DESC";

  const result = await query(
    `${issueProjection(distanceSql)}
     ${whereSql}
     ${orderSql}
     LIMIT 500`,
    values
  );

  return result.rows.map(mapIssue);
};

export const listMyIssues = async (reporterId) =>
  listIssues({ reporterId, status: undefined });

export const updateIssueStatus = async ({ issueId, status, note, actorId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, status
       FROM issues
       WHERE id = $1
       LIMIT 1`,
      [issueId]
    );

    if (existing.rowCount === 0) {
      throw new HttpError(404, "Issue not found");
    }

    const oldStatus = existing.rows[0].status;

    await client.query(
      `UPDATE issues
       SET status = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [issueId, status]
    );

    await recalculatePriority(client, issueId);

    await client.query(
      `INSERT INTO status_logs (issue_id, changed_by, old_status, new_status, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [issueId, actorId, oldStatus, status, note ?? null]
    );

    await client.query("COMMIT");

    return getIssueById(issueId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
