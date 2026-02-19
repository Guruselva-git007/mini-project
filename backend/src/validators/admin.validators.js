import { z } from "zod";
import { ROLES } from "../utils/constants.js";

export const updateUserSchema = z.object({
  role: z
    .enum([ROLES.CITIZEN, ROLES.AUTHORITY, ROLES.ADMIN])
    .optional(),
  departmentId: z.string().uuid().nullable().optional()
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(120),
  areaCode: z.string().min(2).max(32)
});
