"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudent, useUpdateStudent, useDeleteStudent, useStudentLessons, useStudentPayments } from "@/hooks/useStudents";
import { StudentForm } from "@/components/tutor/StudentForm";
import { PaymentStatus } from "@/components/tutor/PaymentStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Student, CreateStudentData } from "@/types/student";

const statusColor: Record<Student["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  finished: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const lessonStatusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { student, isLoading, error, refetch } = useStudent(studentId);
  const { lessons, isLoading: lessonsLoading } = useStudentLessons(studentId);
  const { payments, isLoading: paymentsLoading } = useStudentPayments(studentId);
  const { update, isLoading: isUpdating } = useUpdateStudent();
  const { remove, isLoading: isDeleting } = useDeleteStudent();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUpdate = async (data: CreateStudentData) => {
    await update(studentId, data);
    refetch();
  };

  const handleDelete = async () => {
    const success = await remove(studentId);
    if (success) {
      router.push("/tutoring/students");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !student) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive">{error || "Ученик не найден"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Назад
        </Button>
      </div>
    );
  }

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();

  const upcomingLessons = lessons.filter((l) => l.status === "scheduled");
  const pastLessons = lessons.filter((l) => l.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-sm text-muted-foreground">{student.subject}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            Удалить
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {initials}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">
                    {student.first_name} {student.last_name}
                  </h3>
                  <Badge className={statusColor[student.status]}>
                    {student.status}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(student.lesson_price)}/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(student.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Краткая информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Предмет</p>
              <p className="text-sm font-medium">{student.subject}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Стоимость урока</p>
              <p className="text-sm font-medium">{formatCurrency(student.lesson_price)}/hr</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Статус</p>
              <Badge className={statusColor[student.status]}>{student.status}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons" className="gap-2">
            <Calendar className="h-4 w-4" />
            Уроки
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Платежи
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Заметки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          {lessonsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Пока нет записей об уроках.
              </CardContent>
            </Card>
          ) : (
            <>
              {upcomingLessons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Ближайшие</h4>
                  <div className="space-y-2">
                    {upcomingLessons.map((lesson) => (
                      <Card key={lesson.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm font-medium">{lesson.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(lesson.date)} at {lesson.time}
                            </p>
                          </div>
                          <Badge className={lessonStatusColor[lesson.status]}>
                            {lesson.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {pastLessons.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Прошедшие</h4>
                  <div className="space-y-2">
                    {pastLessons.map((lesson) => (
                      <Card key={lesson.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="text-sm font-medium">{lesson.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(lesson.date)} at {lesson.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={lessonStatusColor[lesson.status]}>
                              {lesson.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Пока нет истории платежей.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.date)} via {payment.method}
                        </p>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground">{payment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="py-8">
              {student.notes ? (
                <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Нет заметок для этого ученика.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        student={student}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить ученика</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить {student.first_name} {student.last_name}? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
