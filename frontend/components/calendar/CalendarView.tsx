"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { EventModal } from "./EventModal";
import type { Lesson, CalendarViewMode, LessonFormData } from "@/types/lesson";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
} from "date-fns";

interface CalendarViewProps {
  lessons: Lesson[];
  isLoading?: boolean;
  onLessonSaved?: () => void;
}

export function CalendarView({
  lessons,
  isLoading,
  onLessonSaved,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [initialTime, setInitialTime] = useState<string>();

  const handlePrevious = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => subDays(d, 1));
        break;
      case "week":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => subMonths(d, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate((d) => addDays(d, 1));
        break;
      case "week":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "month":
        setCurrentDate((d) => addMonths(d, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedLesson(null);
    setInitialDate(date);
    setInitialTime(time);
    setIsModalOpen(true);
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setInitialDate(undefined);
    setInitialTime(undefined);
    setIsModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setViewMode("day");
    setCurrentDate(date);
  };

  const headerLabel = useMemo(() => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = subDays(currentDate, currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  }, [viewMode, currentDate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{headerLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border">
            {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="rounded-none first:rounded-l-md last:rounded-r-md capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex h-[600px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <CalendarIcon className="h-8 w-8 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : viewMode === "day" ? (
          <DayView
            date={currentDate}
            lessons={lessons}
            onLessonClick={handleLessonClick}
            onSlotClick={handleSlotClick}
          />
        ) : viewMode === "week" ? (
          <WeekView
            date={currentDate}
            lessons={lessons}
            onLessonClick={handleLessonClick}
            onSlotClick={handleSlotClick}
          />
        ) : (
          <MonthView
            date={currentDate}
            lessons={lessons}
            onDayClick={handleDayClick}
            onLessonClick={handleLessonClick}
          />
        )}
      </div>

      <EventModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        lesson={selectedLesson}
        initialDate={initialDate}
        initialTime={initialTime}
        onSaved={onLessonSaved}
      />
    </div>
  );
}
