"use client";

import { usePortalHomework } from "@/hooks/usePortal";
import { HomeworkCard } from "./HomeworkCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PendingHomework() {
  const { homework, isLoading, error } = usePortalHomework();

  const pendingHomework = homework
    .filter((h) => h.status === "pending")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Не удалось загрузить домашние задания</p>
      </div>
    );
  }

  if (pendingHomework.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Нет ожидающих заданий</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {pendingHomework.length} ожидающих
        </span>
      </div>
      <div className="space-y-3">
        {pendingHomework.map((hw) => (
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
      <div className="flex justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portal/homework">Все задания</Link>
        </Button>
      </div>
    </div>
  );
}
