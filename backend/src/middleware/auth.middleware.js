import jwt from "jsonwebtoken";
import env from "../config/env.js";
import HttpError from "../utils/http-error.js";

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication token missing"));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new HttpError(401, "Unauthenticated request"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, "Insufficient permissions"));
  }

  return next();
};
