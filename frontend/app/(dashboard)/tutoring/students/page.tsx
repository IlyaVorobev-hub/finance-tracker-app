"use client";

import { useState } from "react";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { StudentForm } from "@/components/tutor/StudentForm";
import { StudentList } from "@/components/tutor/StudentList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Student, CreateStudentData } from "@/types/student";

const statusFilters = [
  { value: "", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "paused", label: "Приостановлены" },
  { value: "finished", label: "Завершены" },
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const { students, total, per_page, isLoading, refetch } = useStudents({
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    per_page: 20,
  });

  const { create, isLoading: isCreating } = useCreateStudent();
  const { update, isLoading: isUpdating } = useUpdateStudent();
  const { remove, isLoading: isDeleting } = useDeleteStudent();

  const totalPages = Math.ceil(total / per_page);

  const handleCreate = async (data: CreateStudentData) => {
    await create(data);
    refetch();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleUpdate = async (data: CreateStudentData) => {
    if (!editingStudent) return;
    await update(editingStudent.id, data);
    setEditingStudent(null);
    refetch();
  };

  const handleDelete = (student: Student) => {
    setDeletingStudent(student);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingStudent) return;
    const success = await remove(deletingStudent.id);
    if (success) {
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
      refetch();
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ученики</h2>
          <p className="text-sm text-muted-foreground">{total} всего учеников</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить ученика
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск учеников..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <StudentList
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <StudentForm
        open={formOpen}
        onOpenChange={handleFormClose}
        student={editingStudent}
        onSubmit={editingStudent ? handleUpdate : handleCreate}
        isLoading={isCreating || isUpdating}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить ученика</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить {deletingStudent?.first_name}{" "}
              {deletingStudent?.last_name}? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
