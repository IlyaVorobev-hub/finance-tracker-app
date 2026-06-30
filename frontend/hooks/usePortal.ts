"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";

interface PortalLesson {
  id: string;
  student_id: string;
  tutor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  comment: string | null;
  status: "scheduled" | "completed" | "cancelled";
  payment_status: "paid" | "unpaid";
  created_at: string;
}

interface PortalHomework {
  id: string;
  student_id: string;
  tutor_id?: string;
  title: string;
  description?: string;
  due_date: string;
  status: "pending" | "submitted" | "graded";
  grade?: string | null;
  files: { id?: string; file_name: string; file_url: string; file_type?: string; file_size?: number }[];
  created_at: string;
}

interface PortalPayment {
  id: string;
  student_id: string;
  amount: number;
  date: string;
  method: string;
  lesson_date: string;
  status: "completed" | "pending" | "failed";
  notes: string;
}

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]): UseFetchState<T> {
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

export function usePortalSchedule() {
  const { data, isLoading, error, refetch } = useFetch<{ lessons: PortalLesson[] }>(
    () => apiClient.get<{ lessons: PortalLesson[] }>("/portal/schedule").then((res) => res.data),
    []
  );

  return {
    lessons: data?.lessons ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function usePortalHomework() {
  const { data, isLoading, error, refetch } = useFetch<PortalHomework[]>(
    () => apiClient.get<PortalHomework[]>("/portal/homework").then((res) => {
      const hw = res.data;
      return Array.isArray(hw) ? hw : (hw as unknown as { homework: PortalHomework[] }).homework ?? [];
    }),
    []
  );

  return {
    homework: data ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function usePortalHistory() {
  const { data, isLoading, error, refetch } = useFetch<{ lessons: PortalLesson[] }>(
    () => apiClient.get<{ lessons: PortalLesson[] }>("/portal/history").then((res) => res.data),
    []
  );

  return {
    lessons: data?.lessons ?? [],
    isLoading,
    error,
    refetch,
  };
}

export function usePortalPayments() {
  const { data, isLoading, error, refetch } = useFetch<{ payments: PortalPayment[] }>(
    () => apiClient.get<{ payments: PortalPayment[] }>("/portal/payments").then((res) => res.data),
    []
  );

  return {
    payments: data?.payments ?? [],
    isLoading,
    error,
    refetch,
  };
}

export type { PortalLesson, PortalHomework, PortalPayment };
