"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import type {
  Lesson,
  LessonFilter,
  LessonListResponse,
  LessonFormData,
  RescheduleData,
  RecurringLessonData,
  Student,
  StudentsResponse,
} from "@/types/lesson";

interface UseLessonsState {
  lessons: Lesson[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[]
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
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
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useLessons(filters: LessonFilter = {}): UseLessonsState {
  const params = new URLSearchParams();
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.student_id) params.append("student_id", filters.student_id);
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.per_page) params.append("per_page", String(filters.per_page));

  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, isLoading, error, refetch } = useFetch<LessonListResponse>(
    () =>
      apiClient
        .get<LessonListResponse>(`/lessons${query}`)
        .then((res) => res.data),
    [filters.start_date, filters.end_date, filters.student_id, filters.status, filters.page, filters.per_page]
  );

  return {
    lessons: data?.lessons ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useLesson(id: string | null) {
  return useFetch<Lesson>(
    () =>
      apiClient.get<Lesson>(`/lessons/${id}`).then((res) => res.data),
    [id]
  );
}

export function useCreateLesson() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLesson = useCallback(
    async (data: LessonFormData): Promise<Lesson | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.post<Lesson>("/lessons", data);
        return res.data;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { createLesson, isSubmitting, error };
}

export function useUpdateLesson() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLesson = useCallback(
    async (id: string, data: Partial<LessonFormData>): Promise<Lesson | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.put<Lesson>(`/lessons/${id}`, data);
        return res.data;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { updateLesson, isSubmitting, error };
}

export function useDeleteLesson() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLesson = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/lessons/${id}`);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { deleteLesson, isSubmitting, error };
}

export function useRescheduleLesson() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reschedule = useCallback(
    async (id: string, data: RescheduleData): Promise<Lesson | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.patch<Lesson>(
          `/lessons/${id}/reschedule`,
          data
        );
        return res.data;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { reschedule, isSubmitting, error };
}

export function useUpdatePaymentStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePayment = useCallback(
    async (id: string, payment_status: "paid" | "unpaid"): Promise<Lesson | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.patch<Lesson>(`/lessons/${id}/payment`, {
          payment_status,
        });
        return res.data;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { updatePayment, isSubmitting, error };
}

export function useCreateRecurring() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecurring = useCallback(
    async (lessonId: string, data: RecurringLessonData): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiClient.post(`/lessons/${lessonId}/recurring`, data);
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { createRecurring, isSubmitting, error };
}

export function useCalendarLessons(startDate: string, endDate: string) {
  return useFetch<Lesson[]>(
    () =>
      apiClient
        .get<{ lessons: Lesson[] }>(`/lessons/calendar`, {
          params: { start_date: startDate, end_date: endDate },
        })
        .then((res) => res.data.lessons),
    [startDate, endDate]
  );
}

export function useStudents() {
  const { data, isLoading, error, refetch } = useFetch<StudentsResponse>(
    () =>
      apiClient.get<StudentsResponse>("/students").then((res) => res.data),
    []
  );

  return {
    students: data?.students ?? [],
    isLoading,
    error,
    refetch,
  };
}
