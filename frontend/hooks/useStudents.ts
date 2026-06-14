"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import type {
  Student,
  StudentFilter,
  StudentListResponse,
  CreateStudentData,
  UpdateStudentData,
} from "@/types/student";
import { useToast } from "@/components/ui/use-toast";

interface UseStudentsState {
  students: Student[];
  total: number;
  page: number;
  per_page: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudents(filters: StudentFilter = {}): UseStudentsState {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.per_page) params.append("per_page", filters.per_page.toString());
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get<StudentListResponse>(`/students${query}`);
      setStudents(res.data.students);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPerPage(res.data.per_page);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.search, filters.page, filters.per_page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, total, page, per_page, isLoading, error, refetch: fetchStudents };
}

export function useStudent(id: string | null) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<Student>(`/students/${id}`);
      setStudent(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return { student, isLoading, error, refetch: fetchStudent };
}

export function useCreateStudent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const create = useCallback(
    async (data: CreateStudentData): Promise<Student | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.post<Student>("/students", data);
        toast({ title: "Student created", description: `${data.first_name} ${data.last_name} has been added.` });
        return res.data;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { create, isLoading, error };
}

export function useUpdateStudent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const update = useCallback(
    async (id: string, data: UpdateStudentData): Promise<Student | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.put<Student>(`/students/${id}`, data);
        toast({ title: "Student updated", description: "Student information has been updated." });
        return res.data;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { update, isLoading, error };
}

export function useDeleteStudent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/students/${id}`);
        toast({ title: "Student deleted", description: "Student has been removed." });
        return true;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { remove, isLoading, error };
}

export function useUpdateStudentStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateStatus = useCallback(
    async (id: string, status: Student["status"]): Promise<Student | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.patch<Student>(`/students/${id}/status`, { status });
        toast({ title: "Status updated", description: `Student status changed to ${status}.` });
        return res.data;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { updateStatus, isLoading, error };
}

export function useStudentLessons(studentId: string | null) {
  const [lessons, setLessons] = useState<import("@/types/student").Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<import("@/types/student").Lesson[]>(`/students/${studentId}/lessons`);
      setLessons(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, isLoading, error, refetch: fetchLessons };
}

export function useStudentPayments(studentId: string | null) {
  const [payments, setPayments] = useState<import("@/types/student").Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<import("@/types/student").Payment[]>(`/students/${studentId}/payments`);
      setPayments(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, isLoading, error, refetch: fetchPayments };
}
