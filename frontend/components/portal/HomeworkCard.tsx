"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeworkCardProps {
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade: string | null;
  files: { name?: string; file_name?: string; url?: string; file_url?: string }[];
}

const statusConfig = {
  pending: {
    label: "Ожидает",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  submitted: {
    label: "Отправлено",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  graded: {
    label: "Оценено",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
};

export function HomeworkCard({
  title,
  dueDate,
  status,
  grade,
  files,
}: HomeworkCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="space-y-2">
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Срок: {dueDate}</span>
        </div>
        {grade && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Оценка: {grade}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant="outline" className={cn("border-0", statusInfo.className)}>
          {statusInfo.label}
        </Badge>
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{files.length} файл(ов)</span>
          </div>
        )}
        {files.length > 0 && (
          <Button variant="ghost" size="sm" className="h-8">
            <Download className="mr-1 h-3 w-3" />
            Скачать
          </Button>
        )}
      </div>
    </div>
  );
}
