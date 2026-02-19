import { query } from "../../db/pool.js";
import HttpError from "../../utils/http-error.js";

const mapComment = (row) => ({
  id: row.id,
  issueId: row.issue_id,
  userId: row.user_id,
  fullName: row.full_name,
  message: row.message,
  createdAt: row.created_at
});

export const listCommentsByIssue = async (issueId) => {
  const result = await query(
    `SELECT c.id, c.issue_id, c.user_id, c.message, c.created_at, u.full_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.issue_id = $1
     ORDER BY c.created_at ASC`,
    [issueId]
  );

  return result.rows.map(mapComment);
};

export const addComment = async ({ issueId, userId, message }) => {
  const issueExists = await query("SELECT id FROM issues WHERE id = $1 LIMIT 1", [
    issueId
  ]);

  if (issueExists.rowCount === 0) {
    throw new HttpError(404, "Issue not found");
  }

  const inserted = await query(
    `INSERT INTO comments (issue_id, user_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, issue_id, user_id, message, created_at`,
    [issueId, userId, message]
  );

  const withName = await query(
    `SELECT c.id, c.issue_id, c.user_id, c.message, c.created_at, u.full_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [inserted.rows[0].id]
  );

  return mapComment(withName.rows[0]);
};
