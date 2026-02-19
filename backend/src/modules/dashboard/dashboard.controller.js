import asyncHandler from "../../utils/async-handler.js";
import HttpError from "../../utils/http-error.js";
import { authorityDashboardFilterSchema } from "../../validators/dashboard.validators.js";
import * as dashboardService from "./dashboard.service.js";

export const citizenDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCitizenDashboard(req.user.id);
  res.status(200).json({ success: true, ...data });
});

export const authorityDashboard = asyncHandler(async (req, res) => {
  const parsed = authorityDashboardFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid dashboard filter", parsed.error.flatten());
  }

  const data = await dashboardService.getAuthorityDashboard({
    departmentId: req.user.departmentId ?? null,
    ...parsed.data
  });

  res.status(200).json({ success: true, ...data });
});

export const adminDashboard = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getAdminDashboard();
  res.status(200).json({ success: true, ...data });
});
