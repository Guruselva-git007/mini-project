import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import env from "../config/env.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "../..");
const uploadDirectory = path.resolve(projectRoot, env.LOCAL_UPLOAD_DIR);

const uploadLocal = async (file) => {
  if (!file) return null;

  await fs.mkdir(uploadDirectory, { recursive: true });

  const extension = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const absolutePath = path.join(uploadDirectory, filename);

  await fs.writeFile(absolutePath, file.buffer);
  return `/uploads/${filename}`;
};

export const uploadImage = async (file) => {
  if (!file) return null;

  if (env.STORAGE_PROVIDER === "local") {
    return uploadLocal(file);
  }

  // Placeholder for cloud providers (S3/GCS/etc).
  return uploadLocal(file);
};
