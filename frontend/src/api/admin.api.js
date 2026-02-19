import http from "./http";

export const fetchUsers = async () => {
  const { data } = await http.get("/admin/users");
  return data;
};

export const updateUser = async (userId, payload) => {
  const { data } = await http.patch(`/admin/users/${userId}`, payload);
  return data;
};

export const fetchDepartments = async () => {
  const { data } = await http.get("/admin/departments");
  return data;
};

export const fetchSharedDepartments = async () => {
  const { data } = await http.get("/meta/departments");
  return data;
};

export const createDepartment = async (payload) => {
  const { data } = await http.post("/admin/departments", payload);
  return data;
};
