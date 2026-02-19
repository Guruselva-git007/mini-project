import asyncHandler from "../../utils/async-handler.js";
import * as adminService from "./admin.service.js";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await adminService.listUsers();
  res.status(200).json({ success: true, users });
});

export const patchUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.userId, req.body);
  res.status(200).json({ success: true, user });
});

export const getDepartments = asyncHandler(async (_req, res) => {
  const departments = await adminService.listDepartments();
  res.status(200).json({ success: true, departments });
});

export const addDepartment = asyncHandler(async (req, res) => {
  const department = await adminService.createDepartment(req.body);
  res.status(201).json({ success: true, department });
});
