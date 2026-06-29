"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import {
  Transaction,
  TransactionListResponse,
  Category,
  CategoryListResponse,
  DashboardData,
  TransactionFormData,
  CategoryFormData,
  AnalyticsData,
} from "@/types/finance";

export function useTransactions(type?: "income" | "expense", page = 1, perPage = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (type) params.append("type", type);
      const response = await apiClient.get<TransactionListResponse>(
        `/finance/transactions?${params.toString()}`
      );
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [type, page, perPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, total, isLoading, error, refetch: fetchTransactions };
}

export function useCategories(type?: "income" | "expense") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = type ? `?type=${type}` : "";
      const response = await apiClient.get<CategoryListResponse>(
        `/finance/categories${params}`
      );
      setCategories(response.data.categories);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<DashboardData>("/finance/dashboard");
      setData(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}

export function useAnalytics(startDate?: string, endDate?: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      const response = await apiClient.get<AnalyticsData>(
        `/finance/analytics/summary?${params.toString()}`
      );
      setData(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, isLoading, error, refetch: fetchAnalytics };
}

export function useCreateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = async (data: TransactionFormData): Promise<Transaction | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Transaction>("/finance/transactions", data);
      return response.data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createTransaction, isLoading, error };
}

export function useUpdateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTransaction = async (id: string, data: Partial<TransactionFormData>): Promise<Transaction | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<Transaction>(`/finance/transactions/${id}`, data);
      return response.data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateTransaction, isLoading, error };
}

export function useDeleteTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTransaction = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/finance/transactions/${id}`);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteTransaction, isLoading, error };
}

export function useCreateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (data: CategoryFormData): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Category>("/finance/categories", data);
      return response.data;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCategory, isLoading, error };
}

export function useDeleteCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCategory = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/finance/categories/${id}`);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteCategory, isLoading, error };
}
