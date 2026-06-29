"use client";

import { useState } from "react";
import { usePortalHomework } from "@/hooks/usePortal";
import { HomeworkCard } from "@/components/portal/HomeworkCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

type FilterStatus = "all" | "pending" | "submitted" | "graded";

const statusFilters: { label: string; value: FilterStatus }[] = [
  { label: "Все", value: "all" },
  { label: "Ожидает", value: "pending" },
  { label: "Отправлено", value: "submitted" },
  { label: "Оценено", value: "graded" },
];

export default function HomeworkPage() {
  const { homework, isLoading, error } = usePortalHomework();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const filteredHomework = homework
    .filter((hw) => {
      if (statusFilter !== "all" && hw.status !== statusFilter) return false;
      if (!searchQuery) return true;
      return hw.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Не удалось загрузить домашние задания</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Домашние задания</h1>
        <p className="text-muted-foreground">Просмотр и управление вашими домашними заданиями.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск заданий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredHomework.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Домашние задания не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHomework.map((hw) => (
            <HomeworkCard
              key={hw.id}
              title={hw.title}
              dueDate={hw.due_date}
              status={hw.status}
              grade={hw.grade ?? null}
              files={hw.files}
            />
          ))}
        </div>
      )}
    </div>
  );
}
