"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/homework/FileUpload";
import { useUploadFile } from "@/hooks/useHomework";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { HomeworkType, CreateHomeworkData, UpdateHomeworkData } from "@/types/homework";

interface StudentOption {
  id: string;
  name: string;
}

interface HomeworkFormProps {
  mode?: "create" | "edit";
  initialData?: {
    title: string;
    description: string;
    type: HomeworkType;
    due_date: string;
    student_id: string;
  };
  onSubmit: (data: CreateHomeworkData | UpdateHomeworkData) => Promise<unknown>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function HomeworkForm({
  mode = "create",
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: HomeworkFormProps) {
  const router = useRouter();
  const { upload, isUploading } = useUploadFile();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [type, setType] = useState<HomeworkType>(initialData?.type ?? "text");
  const [dueDate, setDueDate] = useState(initialData?.due_date ?? "");
  const [studentId, setStudentId] = useState(initialData?.student_id ?? "");

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchStudents = useCallback(async () => {
    try {
      const res = await apiClient.get<{ students: Array<{ id: string; first_name: string; last_name: string }> }>("/students");
      setStudents(
        res.data.students.map((s) => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
        }))
      );
    } catch {
      // students failed to load
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!studentId) errs.student_id = "Student is required.";
    if (!dueDate) errs.due_date = "Due date is required.";
    if (description.length > 2000) errs.description = "Description is too long.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateHomeworkData | UpdateHomeworkData = {
      title: title.trim(),
      description: description.trim(),
      type,
      due_date: dueDate,
    };
    if (mode === "create") {
      (data as CreateHomeworkData).student_id = studentId;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create Homework" : "Edit Homework"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
                disabled={isLoadingStudents}
              >
                <SelectTrigger id="student">
                  <SelectValue
                    placeholder={
                      isLoadingStudents ? "Loading students..." : "Select student"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student_id && (
                <p className="text-sm text-destructive">{errors.student_id}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Homework title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the homework assignment..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as HomeworkType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive">{errors.due_date}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {(isSubmitting || isUploading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {mode === "create" ? "Create Homework" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
