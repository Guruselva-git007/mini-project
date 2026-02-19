import { query } from "../../db/pool.js";

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
