import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { singleIssueImage } from "../../middleware/upload.middleware.js";
import { ROLES } from "../../utils/constants.js";
import {
  createIssueSchema,
  updateIssueStatusSchema
} from "../../validators/issue.validators.js";
import * as issueController from "./issues.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.CITIZEN, ROLES.AUTHORITY, ROLES.ADMIN),
  singleIssueImage,
  validate(createIssueSchema),
  issueController.createIssue
);

router.get("/", issueController.listIssues);
router.get("/me", issueController.listMyIssues);
router.get("/:issueId", issueController.getIssue);

router.patch(
  "/:issueId/status",
  authorize(ROLES.AUTHORITY, ROLES.ADMIN),
  validate(updateIssueStatusSchema),
  issueController.updateIssueStatus
);

export default router;
