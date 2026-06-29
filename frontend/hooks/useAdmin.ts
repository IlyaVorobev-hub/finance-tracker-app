"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import {
  SystemStats,
  AuditLogsResponse,
  UsersResponse,
  AuditLogFilters,
  UserFilters,
} from "@/types/admin";

interface UseAdminState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseAdminState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useSystemStats() {
  return useFetch<SystemStats>(() =>
    apiClient.get<SystemStats>("/admin/stats").then((res) => res.data)
  );
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const { page = 1, per_page = 20, user_id, action } = filters;

  const fetcher = useCallback(async () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", per_page.toString());
    if (user_id) params.append("user_id", user_id);
    if (action) params.append("action", action);

    const res = await apiClient.get<AuditLogsResponse>(
      `/admin/audit-logs?${params.toString()}`
    );
    return res.data;
  }, [page, per_page, user_id, action]);

  return useFetch<AuditLogsResponse>(fetcher, [page, per_page, user_id, action]);
}

export function useUsersList(filters: UserFilters = {}) {
  const { page = 1, per_page = 20, search, role, is_active } = filters;

  const fetcher = useCallback(async () => {
    const params = new URLSearchParams();
    const skip = (page - 1) * per_page;
    params.append("skip", skip.toString());
    params.append("limit", per_page.toString());
    if (search) params.append("search", search);
    if (role) params.append("role", role);
    if (is_active !== undefined) params.append("is_active", is_active.toString());

    const res = await apiClient.get<UsersResponse>(
      `/users?${params.toString()}`
    );
    return res.data;
  }, [page, per_page, search, role, is_active]);

  return useFetch<UsersResponse>(fetcher, [page, per_page, search, role, is_active]);
}

export function useUpdateUserRole() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRole = async (
    userId: string,
    role: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.put(`/users/${userId}/role`, { role });
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateRole, isLoading, error };
}

export function useUpdateUserStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    userId: string,
    isActive: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.put(`/users/${userId}/status`, { is_active: isActive });
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading, error };
}
