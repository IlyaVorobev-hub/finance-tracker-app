"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeworkCard } from "@/components/homework/HomeworkCard";
import { HomeworkList } from "@/components/homework/HomeworkList";
import { useHomeworkList } from "@/hooks/useHomework";
import apiClient from "@/lib/api";
import {
  Loader2,
  Plus,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { HomeworkFilter } from "@/types/homework";

interface StudentOption {
  id: string;
  name: string;
}

export default function HomeworkPage() {
  const [filters, setFilters] = useState<HomeworkFilter>({
    page: 1,
    per_page: 12,
    status: "all",
  });
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [students, setStudents] = useState<StudentOption[]>([]);

  const { homework, total, isLoading, error } = useHomeworkList(filters);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await apiClient.get<{ students: Array<{ id: string; first_name: string; last_name: string }> }>("/students");
      setStudents(
        res.data.students.map((s) => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
        }))
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / (filters.per_page ?? 12));

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as HomeworkFilter["status"],
      page: 1,
    }));
  };

  const handleStudentChange = (studentId: string) => {
    setFilters((prev) => ({
      ...prev,
      student_id: studentId === "all" ? undefined : studentId,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Домашние задания</h2>
          <p className="text-sm text-muted-foreground">
            Управление домашними заданиями для ваших учеников
          </p>
        </div>
        <Link href="/homework/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Создать домашнее задание
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.status ?? "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">Ожидает</SelectItem>
              <SelectItem value="submitted">Отправлено</SelectItem>
              <SelectItem value="graded">Оценено</SelectItem>
              <SelectItem value="archived">В архиве</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.student_id ?? "all"}
            onValueChange={handleStudentChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все ученики" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ученики</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="link" onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      ) : homework.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Домашние задания не найдены.
            </p>
            <Link href="/homework/create">
              <Button variant="link" className="mt-2">
                Создайте первое задание
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homework.map((hw) => (
            <HomeworkCard key={hw.id} homework={hw} />
          ))}
        </div>
      ) : (
        <HomeworkList homework={homework} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => handlePageChange((filters.page ?? 1) - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {filters.page ?? 1} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => handlePageChange((filters.page ?? 1) + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
