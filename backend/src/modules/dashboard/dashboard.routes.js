import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { ROLES } from "../../utils/constants.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/citizen",
  authorize(ROLES.CITIZEN, ROLES.ADMIN),
  dashboardController.citizenDashboard
);

router.get(
  "/authority",
  authorize(ROLES.AUTHORITY, ROLES.ADMIN),
  dashboardController.authorityDashboard
);

router.get("/admin", authorize(ROLES.ADMIN), dashboardController.adminDashboard);

export default router;
