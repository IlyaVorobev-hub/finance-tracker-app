"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "./CalendarEvent";
import type { Lesson } from "@/types/lesson";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";

interface WeekViewProps {
  date: Date;
  lessons: Lesson[];
  onLessonClick?: (lesson: Lesson) => void;
  onSlotClick?: (date: Date, time: string) => void;
}

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minutes}`;
});

export function WeekView({
  date,
  lessons,
  onLessonClick,
  onSlotClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [date]);

  const getLessonsForSlot = (day: Date, time: string) => {
    return lessons.filter((l) => {
      const lessonDate = parseISO(l.date);
      const start = l.start_time.slice(0, 5);
      return isSameDay(lessonDate, day) && start === time;
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-border">
        <div className="w-16 shrink-0 border-r border-border" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "flex-1 border-r border-border px-2 py-2 text-center text-sm font-medium",
              isToday(day) && "bg-primary/5 text-primary"
            )}
          >
            <div>{format(day, "EEE")}</div>
            <div
              className={cn(
                "mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs",
                isToday(day) && "bg-primary text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {TIME_SLOTS.map((time) => (
          <div key={time} className="flex" style={{ minHeight: "48px" }}>
            <div className="w-16 shrink-0 border-r border-border py-1 pr-2 text-right text-xs text-muted-foreground">
              {time}
            </div>
            {weekDays.map((day) => {
              const slotLessons = getLessonsForSlot(day, time);
              return (
                <div
                  key={`${day.toISOString()}-${time}`}
                  className="flex-1 border-r border-border p-0.5"
                  onClick={() => {
                    if (slotLessons.length === 0) {
                      onSlotClick?.(day, time);
                    }
                  }}
                >
                  {slotLessons.map((lesson) => (
                    <CalendarEvent
                      key={lesson.id}
                      lesson={lesson}
                      onClick={onLessonClick}
                      compact
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
