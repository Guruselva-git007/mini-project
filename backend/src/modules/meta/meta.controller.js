import asyncHandler from "../../utils/async-handler.js";
import * as metaService from "./meta.service.js";

export const getDepartments = asyncHandler(async (_req, res) => {
  const departments = await metaService.listDepartments();
  res.status(200).json({ success: true, departments });
});
