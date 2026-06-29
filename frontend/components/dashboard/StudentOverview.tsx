"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Student } from "@/types/dashboard";

interface StudentOverviewProps {
  students?: Student[];
  isLoading?: boolean;
}

export function StudentOverview({ students = [], isLoading }: StudentOverviewProps) {
  const stats = useMemo(() => {
    const active = students.filter((s) => s.status === "active").length;
    const paused = students.filter((s) => s.status === "paused").length;
    const finished = students.filter((s) => s.status === "finished").length;
    const total = students.length;
    return { active, paused, finished, total };
  }, [students]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Обзор учеников</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(stats.active, stats.paused, stats.finished, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Обзор учеников</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Всего учеников</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Активные</span>
              <span className="font-medium">{stats.active}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(stats.active / maxCount) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Приостановлены</span>
              <span className="font-medium">{stats.paused}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-yellow-500 transition-all"
                style={{ width: `${(stats.paused / maxCount) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Завершены</span>
              <span className="font-medium">{stats.finished}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${(stats.finished / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
