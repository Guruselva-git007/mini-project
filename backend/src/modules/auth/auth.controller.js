import asyncHandler from "../../utils/async-handler.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);
  res.status(201).json({ success: true, ...payload });
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  res.status(200).json({ success: true, ...payload });
});

export const guest = asyncHandler(async (_req, res) => {
  const payload = await authService.loginGuest();
  res.status(200).json({ success: true, ...payload });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.status(200).json({ success: true, user });
});
