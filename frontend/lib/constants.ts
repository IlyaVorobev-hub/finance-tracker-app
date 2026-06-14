export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const APP_NAME = "Finance Tutor";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  FINANCE: "/finance",
  TUTORING: "/tutoring",
  HOMEWORK: "/homework",
  ADMIN: "/admin",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Finance", href: ROUTES.FINANCE, icon: "DollarSign" },
  { label: "Tutoring", href: ROUTES.TUTORING, icon: "GraduationCap" },
  { label: "Homework", href: ROUTES.HOMEWORK, icon: "BookOpen" },
  { label: "Admin", href: ROUTES.ADMIN, icon: "Settings", adminOnly: true },
] as const;

export const TOKEN_KEY = "ft_access_token";
export const REFRESH_TOKEN_KEY = "ft_refresh_token";
