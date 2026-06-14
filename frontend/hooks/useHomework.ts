"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type {
  Homework,
  HomeworkFilter,
  HomeworkListResponse,
  CreateHomeworkData,
  UpdateHomeworkData,
} from "@/types/homework";

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

export function useHomeworkList(filters: HomeworkFilter = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all")
    params.append("status", filters.status);
  if (filters.student_id) params.append("student_id", filters.student_id);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.per_page) params.append("per_page", String(filters.per_page));

  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, isLoading, error, refetch } = useFetch<HomeworkListResponse>(
    () =>
      apiClient
        .get<HomeworkListResponse>(`/homework${query}`)
        .then((res) => res.data),
    [filters.status, filters.student_id, filters.page, filters.per_page]
  );

  return {
    homework: data?.homework ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useHomework(id: string | null) {
  return useFetch<Homework>(
    () =>
      apiClient.get<Homework>(`/homework/${id}`).then((res) => res.data),
    [id]
  );
}

export function useCreateHomework() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const create = useCallback(
    async (data: CreateHomeworkData): Promise<Homework | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.post<Homework>("/homework", data);
        toast({
          title: "Homework created",
          description: `"${data.title}" has been created.`,
        });
        return res.data;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast]
  );

  return { create, isSubmitting, error };
}

export function useUpdateHomework() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const update = useCallback(
    async (id: string, data: UpdateHomeworkData): Promise<Homework | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiClient.put<Homework>(`/homework/${id}`, data);
        toast({
          title: "Homework updated",
          description: "Homework has been updated.",
        });
        return res.data;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast]
  );

  return { update, isSubmitting, error };
}

export function useDeleteHomework() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/homework/${id}`);
      toast({ title: "Homework deleted", description: "Homework has been removed." });
      return true;
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  return { remove, isSubmitting, error };
}

export function useArchiveHomework() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const archive = useCallback(async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.patch(`/homework/${id}/archive`);
      toast({ title: "Homework archived", description: "Homework has been archived." });
      return true;
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  return { archive, isSubmitting, error };
}

export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const upload = useCallback(
    async (homeworkId: string, file: File): Promise<boolean> => {
      setIsUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await apiClient.post(`/homework/${homeworkId}/files`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "File uploaded", description: `"${file.name}" has been uploaded.` });
        return true;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  return { upload, isUploading, error };
}

export function useRemoveFile() {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const remove = useCallback(
    async (homeworkId: string, fileId: string): Promise<boolean> => {
      setIsRemoving(true);
      setError(null);
      try {
        await apiClient.delete(`/homework/${homeworkId}/files/${fileId}`);
        toast({ title: "File removed" });
        return true;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return false;
      } finally {
        setIsRemoving(false);
      }
    },
    [toast]
  );

  return { remove, isRemoving, error };
}
