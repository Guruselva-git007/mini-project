import { query } from "../../db/pool.js";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const priorityLabel = (score) => {
  if (score >= 140) return "Critical";
  if (score >= 90) return "High";
  if (score >= 50) return "Medium";
  return "Low";
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

export const getCitizenDashboard = async (citizenId) => {
  const summaryResult = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
       COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved
     FROM issues
     WHERE reporter_id = $1`,
    [citizenId]
  );

  const recentResult = await query(
    `SELECT id, title, category, status, priority_score, created_at
     FROM issues
     WHERE reporter_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [citizenId]
  );

  return {
    summary: summaryResult.rows[0],
    recentIssues: recentResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      priorityScore: toNumber(row.priority_score),
      createdAt: row.created_at
    }))
  };
};

export const getAuthorityDashboard = async ({
  departmentId,
  latitude,
  longitude,
  radius,
  status,
  category
}) => {
  const values = [];
  const where = [];
  let index = 1;
  let distExpr = null;

  if (departmentId) {
    where.push(`i.department_id = $${index}`);
    values.push(departmentId);
    index += 1;
  }

  if (latitude !== undefined && longitude !== undefined) {
    const latIndex = index;
    const lngIndex = index + 1;
    values.push(latitude, longitude);
    index += 2;

    distExpr = distanceExpression(latIndex, lngIndex);

    if (radius) {
      where.push(`${distExpr} <= $${index}`);
      values.push(radius);
      index += 1;
    }
  }

  if (status) {
    where.push(`i.status = $${index}`);
    values.push(status);
    index += 1;
  }

  if (category) {
    where.push(`i.category = $${index}`);
    values.push(category);
    index += 1;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const baseSummary = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE i.status = 'Pending')::int AS pending,
       COUNT(*) FILTER (WHERE i.status = 'In Progress')::int AS in_progress,
       COUNT(*) FILTER (WHERE i.status = 'Resolved')::int AS resolved
     FROM issues i
     ${whereSql}`,
    values
  );

  const byCategory = await query(
    `SELECT i.category, COUNT(*)::int AS total
     FROM issues i
     ${whereSql}
     GROUP BY i.category
     ORDER BY total DESC`,
    values
  );

  const byStatus = await query(
    `SELECT i.status, COUNT(*)::int AS total
     FROM issues i
     ${whereSql}
     GROUP BY i.status
     ORDER BY total DESC`,
    values
  );

  const distanceSql = distExpr ? `${distExpr} AS distance_meters` : "NULL::numeric AS distance_meters";

  const recent = await query(
    `SELECT
       i.id,
       i.title,
       i.description,
       i.category,
       i.status,
       i.latitude,
       i.longitude,
       i.priority_score,
       i.report_count,
       i.created_at,
       ${distanceSql}
     FROM issues i
     ${whereSql}
     ORDER BY i.priority_score DESC, i.created_at DESC
     LIMIT 50`,
    values
  );

  return {
    summary: baseSummary.rows[0],
    byCategory: byCategory.rows,
    byStatus: byStatus.rows,
    issues: recent.rows.map((row) => {
      const score = toNumber(row.priority_score);
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        latitude: toNumber(row.latitude),
        longitude: toNumber(row.longitude),
        priorityScore: score,
        priorityLabel: priorityLabel(score),
        reportCount: Number(row.report_count),
        distanceMeters: row.distance_meters ? toNumber(row.distance_meters) : null,
        createdAt: row.created_at
      };
    })
  };
};

export const getAdminDashboard = async () => {
  const userStats = await query(
    `SELECT role, COUNT(*)::int AS total
     FROM users
     GROUP BY role
     ORDER BY role ASC`
  );

  const issueStats = await query(
    `SELECT status, COUNT(*)::int AS total
     FROM issues
     GROUP BY status
     ORDER BY status ASC`
  );

  const departments = await query(
    `SELECT
       d.id,
       d.name,
       d.area_code,
       COUNT(u.id) FILTER (WHERE u.role = 'Authority')::int AS authority_count,
       COUNT(i.id)::int AS issue_count
     FROM departments d
     LEFT JOIN users u ON u.department_id = d.id
     LEFT JOIN issues i ON i.department_id = d.id
     GROUP BY d.id
     ORDER BY d.name ASC`
  );

  return {
    usersByRole: userStats.rows,
    issuesByStatus: issueStats.rows,
    departments: departments.rows.map((row) => ({
      id: row.id,
      name: row.name,
      areaCode: row.area_code,
      authorityCount: Number(row.authority_count),
      issueCount: Number(row.issue_count)
    }))
  };
};
