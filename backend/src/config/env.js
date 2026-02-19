import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const env = {
  PORT: toNumber(process.env.PORT, 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  GUEST_MODE_ENABLED: toBoolean(process.env.GUEST_MODE_ENABLED, true),
  GUEST_EMAIL: process.env.GUEST_EMAIL ?? "guest@civic.local",
  GUEST_NAME: process.env.GUEST_NAME ?? "Guest User",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER ?? "local",
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR ?? "uploads",
  DUPLICATE_RADIUS_METERS: toNumber(process.env.DUPLICATE_RADIUS_METERS, 250),
  TITLE_SIMILARITY_THRESHOLD: toNumber(process.env.TITLE_SIMILARITY_THRESHOLD, 0.6)
};

const missing = ["DATABASE_URL", "JWT_SECRET"].filter((key) => !env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export default env;
