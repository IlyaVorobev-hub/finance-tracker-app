"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Clock, User, DollarSign } from "lucide-react";

interface LessonCardProps {
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  tutorName: string;
  price: number;
  status: "scheduled" | "completed" | "cancelled";
  paymentStatus: "paid" | "unpaid";
}

const statusConfig = {
  scheduled: {
    label: "Запланировано",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  completed: {
    label: "Завершено",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  cancelled: {
    label: "Отменено",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

export function LessonCard({
  date,
  startTime,
  endTime,
  studentName,
  tutorName,
  price,
  status,
  paymentStatus,
}: LessonCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {startTime} - {endTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{tutorName}</span>
        </div>
        <p className="text-sm font-medium">{studentName}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant="outline" className={cn("border-0", statusInfo.className)}>
          {statusInfo.label}
        </Badge>
        <div className="flex items-center gap-1 text-sm font-medium">
          <DollarSign className="h-3 w-3" />
          {price}
        </div>
        <Badge
          variant={paymentStatus === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {paymentStatus === "paid" ? "Оплачено" : "Не оплачено"}
        </Badge>
      </div>
    </div>
  );
}
