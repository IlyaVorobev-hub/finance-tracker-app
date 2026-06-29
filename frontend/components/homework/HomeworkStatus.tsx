import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HomeworkStatus as Status, Homework } from "@/types/homework";

interface HomeworkStatusProps {
  status: Status;
  dueDate?: string;
  className?: string;
}

function isOverdue(dueDate: string, status: Status): boolean {
  if (status !== "pending" && status !== "submitted") return false;
  return new Date(dueDate) < new Date();
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Ожидает",
    className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  submitted: {
    label: "Отправлено",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  graded: {
    label: "Оценено",
    className: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  },
  archived: {
    label: "В архиве",
    className: "border-muted bg-muted text-muted-foreground",
  },
};

export function HomeworkStatus({ status, dueDate, className }: HomeworkStatusProps) {
  const config = statusConfig[status];
  const overdue = dueDate ? isOverdue(dueDate, status) : false;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        overdue &&
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        className
      )}
    >
      {overdue ? "Просрочено" : config.label}
    </Badge>
  );
}
