import http from "./http";
import { cleanParams } from "../utils/query";

export const fetchCitizenDashboard = async () => {
  const { data } = await http.get("/dashboard/citizen");
  return data;
};

export const fetchAuthorityDashboard = async (params = {}) => {
  const { data } = await http.get("/dashboard/authority", {
    params: cleanParams(params)
  });
  return data;
};

export const fetchAdminDashboard = async () => {
  const { data } = await http.get("/dashboard/admin");
  return data;
};
