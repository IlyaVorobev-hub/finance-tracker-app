"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HomeworkStatus } from "@/components/homework/HomeworkStatus";
import { FilePreview } from "@/components/homework/FilePreview";
import { FileUpload } from "@/components/homework/FileUpload";
import {
  useHomework,
  useUpdateHomework,
  useDeleteHomework,
  useArchiveHomework,
  useUploadFile,
  useRemoveFile,
} from "@/hooks/useHomework";
import { formatDate } from "@/lib/utils";
import apiClient from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  User,
  Edit,
  Archive,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";

export default function HomeworkDetailClient({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const { data: homework, isLoading, error, refetch } = useHomework(id);
  const { update, isSubmitting: isUpdating } = useUpdateHomework();
  const { remove, isSubmitting: isDeleting } = useDeleteHomework();
  const { archive, isSubmitting: isArchiving } = useArchiveHomework();
  const { upload, isUploading } = useUploadFile();
  const { remove: removeFile, isRemoving } = useRemoveFile();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"text" | "file" | "mixed">("text");
  const [editDueDate, setEditDueDate] = useState("");
  const [editGrade, setEditGrade] = useState("");

  const openEditDialog = useCallback(() => {
    if (!homework) return;
    setEditTitle(homework.title);
    setEditDescription(homework.description);
    setEditType(homework.type);
    setEditDueDate(homework.due_date);
    setEditGrade(homework.grade !== null ? String(homework.grade) : "");
    setShowEditDialog(true);
  }, [homework]);

  const handleSaveEdit = async () => {
    if (!homework) return;
    await update(homework.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      type: editType,
      due_date: editDueDate,
      grade: editGrade ? Number(editGrade) : null,
    });
    setShowEditDialog(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!homework) return;
    const success = await remove(homework.id);
    if (success) router.push("/homework");
  };

  const handleArchive = async () => {
    if (!homework) return;
    await archive(homework.id);
    refetch();
  };

  const handleFileUpload = async (files: File[]) => {
    if (!homework) return;
    for (const file of files) {
      await upload(homework.id, file);
    }
    setShowUploadDialog(false);
    refetch();
  };

  const handleRemoveFile = async (fileId: string) => {
    if (!homework) return;
    await removeFile(homework.id, fileId);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !homework) {
    return (
      <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error || "Домашнее задание не найдено."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{homework.title}</h2>
            <p className="text-sm text-muted-foreground">
              Детали домашнего задания
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDialog}>
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          {homework.status !== "archived" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={isArchiving}
            >
              <Archive className="mr-2 h-4 w-4" />
              В архив
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Детали задания</CardTitle>
                <HomeworkStatus
                  status={homework.status}
                  dueDate={homework.due_date}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Описание
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {homework.description || "Описание не указано."}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Тип
                  </h4>
                  <p className="mt-1 text-sm capitalize">{homework.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Срок сдачи
                  </h4>
                  <p className="mt-1 flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(homework.due_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Файлы ({homework.files.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Загрузить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {homework.files.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Файлы ещё не загружены.
                </p>
              ) : (
                <div className="space-y-2">
                  {homework.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <FilePreview file={file} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => handleRemoveFile(file.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ученик</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{homework.student_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID ученика: {homework.student_id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Оценка</CardTitle>
            </CardHeader>
            <CardContent>
              {homework.grade !== null ? (
                <div className="text-center">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {homework.grade}
                  </span>
                  <span className="text-sm text-muted-foreground"> / 100</span>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Ещё не оценено
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать домашнее задание</DialogTitle>
            <DialogDescription>Обновите данные домашнего задания.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Заголовок</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Описание</Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Тип</Label>
                <Select
                  value={editType}
                  onValueChange={(v) =>
                    setEditType(v as "text" | "file" | "mixed")
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Текст</SelectItem>
                    <SelectItem value="file">Файл</SelectItem>
                    <SelectItem value="mixed">Смешанный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due">Срок сдачи</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Оценка (0-100)</Label>
              <Input
                id="edit-grade"
                type="number"
                min="0"
                max="100"
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                placeholder="Оставьте пустым для неоценённого"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить домашнее задание</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить &quot;{homework.title}&quot;? Это
              действие не может быть отменено.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Загрузить файлы</DialogTitle>
            <DialogDescription>
              Добавить файлы к этому заданию.
            </DialogDescription>
          </DialogHeader>
          <FileUpload
            onFilesSelected={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
