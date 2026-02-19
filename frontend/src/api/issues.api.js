import http from "./http";
import { cleanParams } from "../utils/query";

export const createIssue = async (formData) => {
  const { data } = await http.post("/issues", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const fetchIssues = async (params = {}) => {
  const { data } = await http.get("/issues", { params: cleanParams(params) });
  return data;
};

export const fetchMyIssues = async () => {
  const { data } = await http.get("/issues/me");
  return data;
};

export const fetchIssue = async (issueId) => {
  const { data } = await http.get(`/issues/${issueId}`);
  return data;
};

export const updateIssueStatus = async (issueId, payload) => {
  const { data } = await http.patch(`/issues/${issueId}/status`, payload);
  return data;
};

export const fetchComments = async (issueId) => {
  const { data } = await http.get(`/issues/${issueId}/comments`);
  return data;
};

export const createComment = async (issueId, payload) => {
  const { data } = await http.post(`/issues/${issueId}/comments`, payload);
  return data;
};
