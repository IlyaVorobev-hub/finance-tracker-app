"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson, LessonStatus, PaymentStatus } from "@/types/lesson";
import { format, parseISO } from "date-fns";
import { Edit, Trash2, CreditCard, ArrowUpDown } from "lucide-react";

interface LessonListProps {
  lessons: Lesson[];
  onEdit?: (lesson: Lesson) => void;
  onCancel?: (lesson: Lesson) => void;
  onMarkPaid?: (lesson: Lesson) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

const statusStyles: Record<LessonStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  unpaid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

function getDuration(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function SortableHead({
  label,
  field,
  sortBy,
  sortDirection,
  onSort,
}: {
  label: string;
  field: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}) {
  const isActive = sortBy === field;
  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2"
        onClick={() => onSort?.(field)}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}
        />
      </Button>
    </TableHead>
  );
}

export function LessonList({
  lessons,
  onEdit,
  onCancel,
  onMarkPaid,
  sortBy,
  sortDirection,
  onSort,
}: LessonListProps) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Дата"
              field="date"
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHead
              label="Ученик"
              field="student_name"
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <TableHead>Время</TableHead>
            <TableHead>Длительность</TableHead>
            <SortableHead
              label="Цена"
              field="price"
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <SortableHead
              label="Статус"
              field="status"
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <TableHead>Платёж</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Уроки не найдены.
              </TableCell>
            </TableRow>
          ) : (
            lessons.map((lesson) => {
              const lessonDate = parseISO(lesson.date);
              return (
                <TableRow key={lesson.id}>
                  <TableCell>{format(lessonDate, "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{lesson.student_name || "Ученик"}</TableCell>
                  <TableCell>
                    {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    {getDuration(lesson.start_time, lesson.end_time)}
                  </TableCell>
                  <TableCell>${lesson.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusStyles[lesson.status])}>
                      {lesson.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(paymentStyles[lesson.payment_status])}>
                      {lesson.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {lesson.status === "scheduled" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit?.(lesson)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => onCancel?.(lesson)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {lesson.payment_status === "unpaid" &&
                        lesson.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => onMarkPaid?.(lesson)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
