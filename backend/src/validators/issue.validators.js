import { z } from "zod";
import { ISSUE_STATUSES } from "../utils/constants.js";

export const createIssueSchema = z.object({
  title: z.string().min(5).max(160),
  description: z.string().min(10).max(4000),
  category: z.string().min(2).max(80),
  severity: z.coerce.number().int().min(1).max(5).default(3),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().max(255).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable()
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    ISSUE_STATUSES.PENDING,
    ISSUE_STATUSES.IN_PROGRESS,
    ISSUE_STATUSES.RESOLVED
  ]),
  note: z.string().max(500).optional().nullable()
});

export const issueFilterSchema = z.object({
  status: z
    .enum([
      ISSUE_STATUSES.PENDING,
      ISSUE_STATUSES.IN_PROGRESS,
      ISSUE_STATUSES.RESOLVED
    ])
    .optional(),
  category: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().int().min(50).max(10000).optional(),
  search: z.string().max(160).optional(),
  departmentId: z.string().uuid().optional(),
  reporterId: z.string().uuid().optional()
});
