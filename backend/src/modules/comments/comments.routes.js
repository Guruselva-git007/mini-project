import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createCommentSchema } from "../../validators/comment.validators.js";
import * as commentsController from "./comments.controller.js";

const router = Router();

router.use(authenticate);

router.get("/:issueId/comments", commentsController.listComments);
router.post(
  "/:issueId/comments",
  validate(createCommentSchema),
  commentsController.createComment
);

export default router;
