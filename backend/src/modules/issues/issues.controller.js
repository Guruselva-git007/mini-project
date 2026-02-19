import asyncHandler from "../../utils/async-handler.js";
import HttpError from "../../utils/http-error.js";
import { issueFilterSchema } from "../../validators/issue.validators.js";
import * as issueService from "./issues.service.js";
import {
  emitIssueCreated,
  emitIssueUpdated,
  emitIssueMerged
} from "../../socket/socket.js";

export const createIssue = asyncHandler(async (req, res) => {
  const result = await issueService.createIssue({
    payload: req.body,
    file: req.file,
    reporterId: req.user.id
  });

  if (result.isDuplicate && !result.alreadyReported) {
    emitIssueMerged(result.issue, {
      similarity: result.similarity
    });
  } else if (!result.isDuplicate) {
    emitIssueCreated(result.issue);
  }

  res.status(result.isDuplicate ? 200 : 201).json({
    success: true,
    ...result
  });
});

export const listIssues = asyncHandler(async (req, res) => {
  const parsed = issueFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid query filters", parsed.error.flatten());
  }

  const issues = await issueService.listIssues(parsed.data);
  res.status(200).json({ success: true, issues });
});

export const listMyIssues = asyncHandler(async (req, res) => {
  const issues = await issueService.listMyIssues(req.user.id);
  res.status(200).json({ success: true, issues });
});

export const getIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.getIssueById(req.params.issueId);
  res.status(200).json({ success: true, issue });
});

export const updateIssueStatus = asyncHandler(async (req, res) => {
  const issue = await issueService.updateIssueStatus({
    issueId: req.params.issueId,
    status: req.body.status,
    note: req.body.note,
    actorId: req.user.id
  });

  emitIssueUpdated(issue);

  res.status(200).json({ success: true, issue });
});
