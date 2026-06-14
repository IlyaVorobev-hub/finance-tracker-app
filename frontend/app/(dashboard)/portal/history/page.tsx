"use client";

import { useState } from "react";
import { usePortalHistory } from "@/hooks/usePortal";
import { LessonCard } from "@/components/portal/LessonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export default function HistoryPage() {
  const { lessons, isLoading, error } = usePortalHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredLessons = lessons
    .filter((lesson) => {
      if (startDate && new Date(lesson.date) < new Date(startDate)) return false;
      if (endDate && new Date(lesson.date) > new Date(endDate)) return false;
      if (!searchQuery) return true;
      return (
        lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.tutor_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredLessons.length / perPage);
  const paginatedLessons = filteredLessons.slice(
    (page - 1) * perPage,
    page * perPage
  );

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
        <p>Failed to load history</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lesson History</h1>
        <p className="text-muted-foreground">View all your past lessons.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject or tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {paginatedLessons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No lessons found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLessons.map((lesson) => (
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
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
