"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { RegisterData } from "@/types/user";
import { getApiErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await login(email, password);
      router.push(ROUTES.DASHBOARD);
      return { success: true };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error) };
    }
  };

  const signUp = async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await register(data);
      router.push(ROUTES.DASHBOARD);
      return { success: true };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error) };
    }
  };

  const signOut = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}
