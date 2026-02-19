import { z } from "zod";

export const authorityDashboardFilterSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().int().min(50).max(10000).optional(),
  category: z.string().optional(),
  status: z.string().optional()
});
