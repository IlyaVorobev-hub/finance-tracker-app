"use client";

import { CalendarView } from "@/components/calendar/CalendarView";
import { useCalendarLessons } from "@/hooks/useLessons";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";

export default function CalendarPage() {
  const now = new Date();
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(addMonths(now, 2)), "yyyy-MM-dd");

  const { data: lessons, isLoading, refetch } = useCalendarLessons(startDate, endDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Календарь</h1>
        <p className="text-muted-foreground">
          Просмотр и управление расписанием репетиторства
        </p>
      </div>

      <CalendarView
        lessons={lessons ?? []}
        isLoading={isLoading}
        onLessonSaved={refetch}
      />
    </div>
  );
}
