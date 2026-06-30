"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { HomeworkStatus } from "@/components/homework/HomeworkStatus";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { FileText, Calendar } from "lucide-react";
import type { Homework } from "@/types/homework";

interface HomeworkCardProps {
  homework: Homework;
  className?: string;
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status !== "pending" && status !== "submitted") return false;
  return new Date(dueDate) < new Date();
}

export function HomeworkCard({ homework, className }: HomeworkCardProps) {
  const overdue = isOverdue(homework.due_date, homework.status);

  return (
    <Link href={`/homework/${homework.id}`}>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md cursor-pointer",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{homework.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {homework.student_name || ""}
              </p>
            </div>
            <HomeworkStatus
              status={homework.status}
              dueDate={homework.due_date}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={cn(overdue && "font-medium text-red-500")}>
                {formatDate(homework.due_date)}
              </span>
            </span>
            {homework.files.length > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {homework.files.length} {homework.files.length === 1 ? "файл" : "файлов"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
