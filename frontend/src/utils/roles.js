export const ROLES = {
  CITIZEN: "Citizen",
  AUTHORITY: "Authority",
  ADMIN: "Admin"
};

export const roleHomePath = (role) => {
  if (role === ROLES.AUTHORITY) return "/authority";
  if (role === ROLES.ADMIN) return "/admin";
  return "/citizen";
};
