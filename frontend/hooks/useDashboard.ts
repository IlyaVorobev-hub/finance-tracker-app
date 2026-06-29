"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import {
  DashboardData,
  AnalyticsSummary,
  MonthlyData,
  Lesson,
  Student,
} from "@/types/dashboard";

interface UseDashboardState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseDashboardState<T> {
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

  useEffect(() => {
    const handleFocus = () => fetchData();
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useDashboardData() {
  return useFetch<DashboardData>(() =>
    apiClient.get<DashboardData>("/finance/dashboard").then((res) => res.data)
  );
}

export function useAnalyticsSummary(startDate?: string, endDate?: string) {
  const fetcher = useCallback(async () => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient.get<AnalyticsSummary>(`/finance/analytics/summary${query}`);
    return res.data;
  }, [startDate, endDate]);

  return useFetch<AnalyticsSummary>(fetcher, [startDate, endDate]);
}

export function useMonthlyAnalytics(months: number = 6) {
  return useFetch<MonthlyData[]>(async () => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const start = startDate.toISOString().split("T")[0];

    const res = await apiClient.get<{ data?: MonthlyData[]; total_income?: number }>(
      `/finance/analytics/summary?start_date=${start}&end_date=${endDate}`
    );
    return res.data.data ?? [];
  }, [months]);
}

export function useUpcomingLessons() {
  return useFetch<Lesson[]>(() =>
    apiClient.get<{ lessons: Lesson[] }>("/lessons").then((res) => {
      const lessons = res.data.lessons ?? [];
      if (Array.isArray(lessons)) {
        return lessons
          .filter((l) => new Date(l.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
      }
      return [];
    })
  );
}

export function useStudentStats() {
  return useFetch<Student[]>(() =>
    apiClient.get<{ students: Student[]; data?: Student[] }>("/students").then((res) => {
      return res.data.students ?? res.data.data ?? (Array.isArray(res.data) ? res.data : []);
    })
  );
}
