import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import issuesRoutes from "./modules/issues/issues.routes.js";
import commentsRoutes from "./modules/comments/comments.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import metaRoutes from "./modules/meta/meta.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "..");
const uploadsPath = path.resolve(backendRoot, env.LOCAL_UPLOAD_DIR);

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.use("/uploads", express.static(uploadsPath));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "civic-issue-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/issues", commentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", metaRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

export default app;
