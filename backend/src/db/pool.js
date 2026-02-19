import pg from "pg";
import env from "../config/env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false
        }
      : false
});

export const query = (text, params = []) => pool.query(text, params);

export default pool;
