"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useStudents,
} from "@/hooks/useLessons";
import type { Lesson, LessonFormData } from "@/types/lesson";
import { format } from "date-fns";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: Lesson | null;
  initialDate?: Date;
  initialTime?: string;
  onSaved?: () => void;
}

export function EventModal({
  open,
  onOpenChange,
  lesson,
  initialDate,
  initialTime,
  onSaved,
}: EventModalProps) {
  const { toast } = useToast();
  const { students } = useStudents();
  const { createLesson, isSubmitting: isCreating } = useCreateLesson();
  const { updateLesson, isSubmitting: isUpdating } = useUpdateLesson();
  const { deleteLesson, isSubmitting: isDeleting } = useDeleteLesson();

  const isEditing = !!lesson;
  const isSubmitting = isCreating || isUpdating || isDeleting;

  const [formData, setFormData] = useState<LessonFormData>({
    student_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    start_time: "09:00",
    end_time: "10:00",
    price: 0,
    comment: "",
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        student_id: lesson.student_id,
        date: lesson.date,
        start_time: lesson.start_time.slice(0, 5),
        end_time: lesson.end_time.slice(0, 5),
        price: lesson.price,
        comment: lesson.comment || "",
      });
    } else {
      setFormData({
        student_id: "",
        date: initialDate
          ? format(initialDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        start_time: initialTime || "09:00",
        end_time: initialTime
          ? `${String(parseInt(initialTime.split(":")[0]) + 1).padStart(2, "0")}:${initialTime.split(":")[1]}`
          : "10:00",
        price: 0,
        comment: "",
      });
    }
  }, [lesson, initialDate, initialTime, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id) {
      toast({ title: "Error", description: "Please select a student.", variant: "destructive" });
      return;
    }

    let result: Lesson | null = null;

    if (isEditing && lesson) {
      result = await updateLesson(lesson.id, formData);
    } else {
      result = await createLesson(formData);
    }

    if (result) {
      toast({
        title: isEditing ? "Lesson updated" : "Lesson created",
        description: `Lesson with ${result.student_name} has been ${isEditing ? "updated" : "scheduled"}.`,
      });
      onOpenChange(false);
      onSaved?.();
    } else {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} lesson.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!lesson) return;

    const success = await deleteLesson(lesson.id);
    if (success) {
      toast({ title: "Lesson cancelled", description: "The lesson has been cancelled." });
      onOpenChange(false);
      onSaved?.();
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel lesson.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "Schedule Lesson"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => setFormData((f) => ({ ...f, student_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData((f) => ({ ...f, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData((f) => ({ ...f, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Optional notes..."
              value={formData.comment}
              onChange={(e) => setFormData((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Cancel Lesson
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
