import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppUserRole } from "./authRoles";

export interface AuthUser {
  id?: string | number;
  first_name: string;
  last_name: string;
  role?: AppUserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

function loadFromStorage(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user: AuthUser | null = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    updateUser(state, action: PayloadAction<Partial<Pick<AuthUser, "first_name" | "last_name">>>) {
      if (!state.user) return;
      const user = { ...state.user, ...action.payload };
      state.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
