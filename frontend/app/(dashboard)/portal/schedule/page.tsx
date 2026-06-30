"use client";

import { useState } from "react";
import { usePortalSchedule } from "@/hooks/usePortal";
import { LessonCard } from "@/components/portal/LessonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export default function SchedulePage() {
  const { lessons, isLoading, error } = usePortalSchedule();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = lessons
    .filter((lesson) => {
      if (!searchQuery) return true;
      return (
        (lesson.comment || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Не удалось загрузить расписание</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Расписание</h1>
        <p className="text-muted-foreground">Просмотр всех ваших предстоящих и прошедших уроков.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по предмету или преподавателю..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Уроки не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              date={lesson.date}
              startTime={lesson.start_time}
              endTime={lesson.end_time}
              studentName={""}
              tutorName={""}
              price={lesson.price}
              status={lesson.status}
              paymentStatus={lesson.payment_status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
