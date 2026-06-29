import { create } from "zustand";
import { User, RegisterData } from "@/types/user";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants";
import apiClient, { getApiErrorMessage } from "@/lib/api";

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<boolean>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>("/auth/login", { email, password });
    const data = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      setCookie("ft_token", data.access_token, 7);
    }

    apiClient.defaults.headers.common.Authorization =
      `Bearer ${data.access_token}`;

    set({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
    });

    const meResponse = await apiClient.get<User>("/auth/me");
    set({ user: meResponse.data, isLoading: false });
  },

  register: async (registerData: RegisterData) => {
    await apiClient.post("/auth/register", registerData);
    await get().login(registerData.email, registerData.password);
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore — backend may be unreachable
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      removeCookie("ft_token");
    }
    delete apiClient.defaults.headers.common.Authorization;
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user: User) => set({ user }),

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post<{
        access_token: string;
        refresh_token: string;
      }>("/auth/refresh", { refresh_token: refreshToken });
      const { access_token, refresh_token } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
        setCookie("ft_token", access_token, 7);
      }

      apiClient.defaults.headers.common.Authorization =
        `Bearer ${access_token}`;

      set({
        accessToken: access_token,
        refreshToken: refresh_token,
      });
      return true;
    } catch {
      await get().logout();
      return false;
    }
  },

  initializeAuth: () => {
    if (typeof window === "undefined") return;

    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      apiClient.defaults.headers.common.Authorization =
        `Bearer ${accessToken}`;

      set({
        accessToken,
        refreshToken,
        isLoading: true,
      });

      apiClient
        .get<User>("/auth/me")
        .then(async (response) => {
          const user = response.data;
          try {
            const profileRes = await apiClient.get<{ first_name: string; last_name: string; phone?: string; avatar_url?: string }>("/auth/me/profile");
            user.first_name = profileRes.data.first_name;
            user.last_name = profileRes.data.last_name;
            user.avatar_url = profileRes.data.avatar_url;
            user.full_name = `${profileRes.data.first_name} ${profileRes.data.last_name}`;
          } catch {
            // profile may not exist yet
          }
          set({ user, isAuthenticated: true, isLoading: false });
        })
        .catch(async () => {
          set({ isLoading: false });
        });
    } else {
      set({ isLoading: false });
    }
  },
}));
