"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Lesson } from "@/types/dashboard";

interface UpcomingLessonsProps {
  lessons?: Lesson[];
  isLoading?: boolean;
}

export function UpcomingLessons({ lessons = [], isLoading }: UpcomingLessonsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ближайшие уроки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Ближайшие уроки</CardTitle>
        <Link href="/tutoring">
          <Button variant="ghost" size="sm">
            Календарь
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Нет запланированных уроков
          </p>
        ) : (
          <div className="space-y-3">
            {lessons.slice(0, 5).map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.student_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lesson.start_time} - {lesson.end_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {format(new Date(lesson.date), "d MMM", { locale: ru })}
                  </p>
                  <p className="text-xs text-muted-foreground">{lesson.start_time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
