import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as metaController from "./meta.controller.js";

const router = Router();

router.use(authenticate);

router.get("/departments", metaController.getDepartments);

export default router;
