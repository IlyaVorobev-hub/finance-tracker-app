import { create } from "zustand";
import { User, AuthResponse, RegisterData } from "@/types/user";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants";
import apiClient, { getApiErrorMessage } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
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
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const data = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    set({
      user: data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (registerData: RegisterData) => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      registerData
    );
    const data = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    set({
      user: data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
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
      }

      set({
        accessToken: access_token,
        refreshToken: refresh_token,
      });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  initializeAuth: () => {
    if (typeof window === "undefined") return;

    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      apiClient
        .get<User>("/auth/me")
        .then((response) => {
          set({ user: response.data });
        })
        .catch(async () => {
          const refreshed = await get().refreshAccessToken();
          if (refreshed) {
            try {
              const response = await apiClient.get<User>("/auth/me");
              set({ user: response.data });
            } catch {
              get().logout();
            }
          }
        });
    } else {
      set({ isLoading: false });
    }
  },
}));
