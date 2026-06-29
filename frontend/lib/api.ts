import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from "./constants";
import { TokenRefreshResponse } from "@/types/user";

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const response = await axios.post<TokenRefreshResponse>(
              `${API_URL}/auth/refresh`,
              { refresh_token: refreshToken }
            );
            const { access_token, refresh_token } = response.data;
            localStorage.setItem(TOKEN_KEY, access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
            apiClient.defaults.headers.common.Authorization =
              `Bearer ${access_token}`;
            processQueue(null, access_token);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return apiClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          processQueue(new Error("No refresh token"), null);
          isRefreshing = false;
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (error.response?.status === 401) return "Неверный email или пароль";
    if (error.response?.status === 422) return "Некорректные данные";
    if (error.response?.status === 500) return "Ошибка сервера. Попробуйте позже.";
    if (error.code === "ECONNABORTED") return "Превышено время ожидания. Попробуйте снова.";
    if (!error.response) return "Ошибка сети. Проверьте подключение к интернету.";
  }
  if (error instanceof Error) return error.message;
  return "Произошла непредвиденная ошибка";
}

export default apiClient;
