export const AUTH_STORAGE_KEY = "civic_auth";

export const loadAuthState = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null
    };
  } catch {
    return { token: null, user: null };
  }
};

export const saveAuthState = (state) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

export const clearAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
