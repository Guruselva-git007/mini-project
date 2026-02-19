import { query } from "../../db/pool.js";
import HttpError from "../../utils/http-error.js";

export const listUsers = async () => {
  const result = await query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.role,
       u.department_id,
       d.name AS department_name,
       u.created_at
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     ORDER BY u.created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    department: row.department_id
      ? {
          id: row.department_id,
          name: row.department_name
        }
      : null,
    createdAt: row.created_at
  }));
};

export const updateUser = async (userId, payload) => {
  const existing = await query("SELECT id FROM users WHERE id = $1 LIMIT 1", [userId]);
  if (existing.rowCount === 0) {
    throw new HttpError(404, "User not found");
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (payload.role) {
    fields.push(`role = $${index}`);
    values.push(payload.role);
    index += 1;
  }

  if (payload.departmentId !== undefined) {
    fields.push(`department_id = $${index}`);
    values.push(payload.departmentId);
    index += 1;
  }

  if (!fields.length) {
    throw new HttpError(400, "No updates provided");
  }

  values.push(userId);

  const updated = await query(
    `UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${index}
     RETURNING id, full_name, email, role, department_id, created_at`,
    values
  );

  return updated.rows[0];
};

export const listDepartments = async () => {
  const result = await query(
    `SELECT id, name, area_code, created_at
     FROM departments
     ORDER BY name ASC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    areaCode: row.area_code,
    createdAt: row.created_at
  }));
};

export const createDepartment = async ({ name, areaCode }) => {
  const result = await query(
    `INSERT INTO departments (name, area_code)
     VALUES ($1, $2)
     RETURNING id, name, area_code, created_at`,
    [name, areaCode]
  );

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    areaCode: result.rows[0].area_code,
    createdAt: result.rows[0].created_at
  };
};
