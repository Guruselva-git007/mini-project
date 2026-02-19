import asyncHandler from "../../utils/async-handler.js";
import * as commentService from "./comments.service.js";
import { emitCommentAdded } from "../../socket/socket.js";

export const listComments = asyncHandler(async (req, res) => {
  const comments = await commentService.listCommentsByIssue(req.params.issueId);
  res.status(200).json({ success: true, comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment({
    issueId: req.params.issueId,
    userId: req.user.id,
    message: req.body.message
  });

  emitCommentAdded(comment);

  res.status(201).json({ success: true, comment });
});
