import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { ROLES } from "../../utils/constants.js";
import {
  createDepartmentSchema,
  updateUserSchema
} from "../../validators/admin.validators.js";
import * as adminController from "./admin.controller.js";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get("/users", adminController.getUsers);
router.patch("/users/:userId", validate(updateUserSchema), adminController.patchUser);

router.get("/departments", adminController.getDepartments);
router.post(
  "/departments",
  validate(createDepartmentSchema),
  adminController.addDepartment
);

export default router;
