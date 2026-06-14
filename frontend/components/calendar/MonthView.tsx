"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/lesson";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from "date-fns";

interface MonthViewProps {
  date: Date;
  lessons: Lesson[];
  onDayClick?: (date: Date) => void;
  onLessonClick?: (lesson: Lesson) => void;
}

export function MonthView({
  date,
  lessons,
  onDayClick,
  onLessonClick,
}: MonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [date]);

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const key = lesson.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(lesson);
    });
    return map;
  }, [lessons]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayLessons = lessonsByDay.get(dayKey) ?? [];
          const isCurrentMonth = isSameMonth(day, date);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-border p-1 text-left transition-colors hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isToday(day) && "bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayLessons.slice(0, 3).map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick?.(lesson);
                    }}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                      lesson.status === "scheduled" &&
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                      lesson.status === "completed" &&
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                      lesson.status === "cancelled" &&
                        "bg-gray-100 text-gray-800 line-through dark:bg-gray-800/30 dark:text-gray-400"
                    )}
                  >
                    {lesson.start_time.slice(0, 5)} {lesson.student_name}
                  </div>
                ))}
                {dayLessons.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayLessons.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
