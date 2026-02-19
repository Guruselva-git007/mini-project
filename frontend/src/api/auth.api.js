import http from "./http";

export const registerUser = async (payload) => {
  const { data } = await http.post("/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await http.post("/auth/login", payload);
  return data;
};

export const loginGuest = async () => {
  const { data } = await http.post("/auth/guest");
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await http.get("/auth/me");
  return data;
};
