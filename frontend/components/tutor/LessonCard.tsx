"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson, LessonStatus, PaymentStatus } from "@/types/lesson";
import { format, parseISO } from "date-fns";
import { Clock, DollarSign, Edit, Trash2, CreditCard } from "lucide-react";

interface LessonCardProps {
  lesson: Lesson;
  onEdit?: (lesson: Lesson) => void;
  onCancel?: (lesson: Lesson) => void;
  onMarkPaid?: (lesson: Lesson) => void;
}

const statusStyles: Record<LessonStatus, string> = {
  scheduled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled:
    "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  unpaid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

export function LessonCard({
  lesson,
  onEdit,
  onCancel,
  onMarkPaid,
}: LessonCardProps) {
  const lessonDate = parseISO(lesson.date);
  const startTime = lesson.start_time.slice(0, 5);
  const endTime = lesson.end_time.slice(0, 5);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">{lesson.student_name || "Ученик"}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(lessonDate, "MMM d, yyyy")} · {startTime} - {endTime}
              </span>
            </div>
            {lesson.comment && (
              <p className="text-sm text-muted-foreground">{lesson.comment}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={cn(statusStyles[lesson.status])}>
              {lesson.status}
            </Badge>
            <Badge variant="outline" className={cn(paymentStyles[lesson.payment_status])}>
              {lesson.payment_status}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            {lesson.price.toFixed(2)}
          </div>
          <div className="flex items-center gap-1">
            {lesson.status === "scheduled" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(lesson)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onCancel?.(lesson)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {lesson.payment_status === "unpaid" && lesson.status !== "cancelled" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={() => onMarkPaid?.(lesson)}
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
