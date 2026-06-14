"use client";

import { useMemo } from "react";
import { CalendarEvent } from "./CalendarEvent";
import type { Lesson } from "@/types/lesson";
import { parseISO, isSameDay } from "date-fns";

interface DayViewProps {
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

export function DayView({
  date,
  lessons,
  onLessonClick,
  onSlotClick,
}: DayViewProps) {
  const dayLessons = useMemo(() => {
    return lessons.filter((l) => isSameDay(parseISO(l.date), date));
  }, [lessons, date]);

  const getLessonsForSlot = (time: string) => {
    return dayLessons.filter((l) => {
      const start = l.start_time.slice(0, 5);
      return start === time;
    });
  };

  return (
    <div className="flex flex-col">
      {TIME_SLOTS.map((time) => {
        const slotLessons = getLessonsForSlot(time);
        return (
          <div
            key={time}
            className="flex border-b border-border"
            style={{ minHeight: "48px" }}
          >
            <div className="w-16 shrink-0 border-r border-border py-1 pr-2 text-right text-xs text-muted-foreground">
              {time}
            </div>
            <div
              className="flex-1 p-1"
              onClick={() => {
                if (slotLessons.length === 0) {
                  onSlotClick?.(date, time);
                }
              }}
            >
              {slotLessons.map((lesson) => (
                <CalendarEvent
                  key={lesson.id}
                  lesson={lesson}
                  onClick={onLessonClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
