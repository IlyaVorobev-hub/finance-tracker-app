"use client";

import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/lesson";
import { format, parseISO } from "date-fns";

interface CalendarEventProps {
  lesson: Lesson;
  onClick?: (lesson: Lesson) => void;
  className?: string;
  compact?: boolean;
}

const STUDENT_COLORS: Record<string, string> = {
  default: "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300",
  green: "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300",
  purple: "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300",
  orange: "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300",
  pink: "bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300",
  teal: "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300",
};

function getStudentColor(studentId: string): string {
  const colors = Object.values(STUDENT_COLORS);
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    hash = studentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function CalendarEvent({
  lesson,
  onClick,
  className,
  compact = false,
}: CalendarEventProps) {
  const colorClass = getStudentColor(lesson.student_id);

  const startTime = lesson.start_time.slice(0, 5);
  const endTime = lesson.end_time.slice(0, 5);

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(lesson)}
        className={cn(
          "w-full rounded border-l-2 px-2 py-1 text-left text-xs transition-colors hover:bg-accent",
          colorClass,
          lesson.status === "cancelled" && "opacity-50 line-through",
          className
        )}
      >
        <span className="font-medium">{startTime}</span>
        <span className="ml-1 truncate text-muted-foreground">
          {lesson.student_name}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(lesson)}
      className={cn(
        "w-full rounded-md border-l-4 p-2 text-left transition-colors hover:bg-accent",
        colorClass,
        lesson.status === "cancelled" && "opacity-50 line-through",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{lesson.student_name}</span>
        {lesson.payment_status === "paid" && (
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Paid
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {startTime} - {endTime}
      </p>
      {lesson.comment && !compact && (
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {lesson.comment}
        </p>
      )}
    </button>
  );
}
