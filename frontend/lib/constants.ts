export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const APP_NAME = "Финансы и Репетиторство";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  FINANCE: "/finance",
  TUTORING: "/tutoring",
  HOMEWORK: "/homework",
  ADMIN: "/admin",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD] as const;

export const NAV_ITEMS = [
  { label: "Главная", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Финансы", href: ROUTES.FINANCE, icon: "DollarSign" },
  { label: "Репетиторство", href: ROUTES.TUTORING, icon: "GraduationCap" },
  { label: "Домашние задания", href: ROUTES.HOMEWORK, icon: "BookOpen" },
  { label: "Админ", href: ROUTES.ADMIN, icon: "Settings", adminOnly: true },
] as const;

export const TOKEN_KEY = "ft_access_token";
export const REFRESH_TOKEN_KEY = "ft_refresh_token";
