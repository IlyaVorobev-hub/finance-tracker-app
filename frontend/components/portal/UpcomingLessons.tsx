"use client";

import { usePortalSchedule } from "@/hooks/usePortal";
import { LessonCard } from "./LessonCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function UpcomingLessons() {
  const { lessons, isLoading, error } = usePortalSchedule();

  const upcomingLessons = lessons
    .filter((l) => l.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Не удалось загрузить предстоящие уроки</p>
      </div>
    );
  }

  if (upcomingLessons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Нет запланированных уроков</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {upcomingLessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            date={lesson.date}
            startTime={lesson.start_time}
            endTime={lesson.end_time}
            subject={lesson.subject}
            tutorName={lesson.tutor_name}
            price={lesson.price}
            status={lesson.status}
            paymentStatus={lesson.payment_status}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portal/schedule">Все уроки</Link>
        </Button>
      </div>
    </div>
  );
}
