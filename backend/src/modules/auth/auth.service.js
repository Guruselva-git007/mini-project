import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { query } from "../../db/pool.js";
import env from "../../config/env.js";
import HttpError from "../../utils/http-error.js";
import { ROLES } from "../../utils/constants.js";

const buildToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      departmentId: user.department_id
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  departmentId: user.department_id,
  createdAt: user.created_at
});

export const register = async ({ fullName, email, password }) => {
  const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
  if (existing.rowCount > 0) {
    throw new HttpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const inserted = await query(
    `INSERT INTO users (full_name, email, password_hash, role, department_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, department_id, created_at`,
    [fullName, email, passwordHash, ROLES.CITIZEN, null]
  );

  const user = inserted.rows[0];

  return {
    user: sanitizeUser(user),
    token: buildToken(user)
  };
};

export const login = async ({ email, password }) => {
  const result = await query(
    `SELECT id, full_name, email, role, department_id, password_hash, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  if (result.rowCount === 0) {
    throw new HttpError(401, "Invalid credentials");
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, "Invalid credentials");
  }

  return {
    user: sanitizeUser(user),
    token: buildToken(user)
  };
};

export const getProfile = async (userId) => {
  const result = await query(
    `SELECT id, full_name, email, role, department_id, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "User not found");
  }

  return sanitizeUser(result.rows[0]);
};

export const loginGuest = async () => {
  if (!env.GUEST_MODE_ENABLED) {
    throw new HttpError(403, "Guest mode is disabled");
  }

  const result = await query(
    `SELECT id, full_name, email, role, department_id, created_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [env.GUEST_EMAIL]
  );

  let user = result.rows[0];

  if (!user) {
    const passwordHash = await bcrypt.hash(randomUUID(), 12);
    const inserted = await query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, department_id, created_at`,
      [env.GUEST_NAME, env.GUEST_EMAIL, passwordHash, ROLES.CITIZEN, null]
    );

    user = inserted.rows[0];
  }

  if (user.role !== ROLES.CITIZEN) {
    throw new HttpError(
      500,
      "Guest account role must be Citizen. Update GUEST_EMAIL configuration."
    );
  }

  return {
    user: sanitizeUser(user),
    token: buildToken(user)
  };
};
