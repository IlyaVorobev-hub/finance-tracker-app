"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LessonList } from "@/components/tutor/LessonList";
import { LessonForm } from "@/components/tutor/LessonForm";
import { EventModal } from "@/components/calendar/EventModal";
import { useToast } from "@/components/ui/use-toast";
import { useLessons, useDeleteLesson, useUpdatePaymentStatus } from "@/hooks/useLessons";
import type { Lesson, LessonStatus, LessonFilter } from "@/types/lesson";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function LessonsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { deleteLesson } = useDeleteLesson();
  const { updatePayment } = useUpdatePaymentStatus();

  const filters: LessonFilter = useMemo(() => {
    const f: LessonFilter = {};
    if (statusFilter !== "all") f.status = statusFilter as LessonStatus;
    if (startDate) f.start_date = startDate;
    if (endDate) f.end_date = endDate;
    return f;
  }, [statusFilter, startDate, endDate]);

  const { lessons, isLoading, refetch } = useLessons(filters);

  const sortedLessons = useMemo(() => {
    const sorted = [...lessons].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "student_name":
          comparison = a.student_name.localeCompare(b.student_name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [lessons, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCancel = async (lesson: Lesson) => {
    const success = await deleteLesson(lesson.id);
    if (success) {
      toast({ title: "Lesson cancelled" });
      refetch();
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel lesson.",
        variant: "destructive",
      });
    }
  };

  const handleMarkPaid = async (lesson: Lesson) => {
    const result = await updatePayment(lesson.id, "paid");
    if (result) {
      toast({ title: "Payment updated" });
      refetch();
    } else {
      toast({
        title: "Error",
        description: "Failed to update payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground">
            Manage your tutoring lessons
          </p>
        </div>
        <Button onClick={() => { setEditingLesson(null); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Lesson
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingLesson ? "Edit Lesson" : "New Lesson"}
          </h2>
          <LessonForm
            lesson={editingLesson}
            onSaved={() => {
              refetch();
              setShowForm(false);
              setEditingLesson(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingLesson(null);
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setStatusFilter("all");
          }}
        >
          Clear Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <CalendarIcon className="h-8 w-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading lessons...</p>
          </div>
        </div>
      ) : (
        <LessonList
          lessons={sortedLessons}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onMarkPaid={handleMarkPaid}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      <EventModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        lesson={editingLesson}
        onSaved={() => {
          refetch();
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
      />
    </div>
  );
}
