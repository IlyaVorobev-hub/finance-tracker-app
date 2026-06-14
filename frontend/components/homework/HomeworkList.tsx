"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HomeworkStatus } from "@/components/homework/HomeworkStatus";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { FileText, Calendar } from "lucide-react";
import Link from "next/link";
import type { Homework } from "@/types/homework";

interface HomeworkListProps {
  homework: Homework[];
  className?: string;
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status !== "pending" && status !== "submitted") return false;
  return new Date(dueDate) < new Date();
}

export function HomeworkList({ homework, className }: HomeworkListProps) {
  if (homework.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">No homework found.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homework.map((hw) => {
            const overdue = isOverdue(hw.due_date, hw.status);
            return (
              <TableRow key={hw.id}>
                <TableCell>
                  <Link
                    href={`/homework/${hw.id}`}
                    className="font-medium hover:underline"
                  >
                    {hw.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {hw.student_name}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-sm",
                      overdue && "font-medium text-red-500"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDate(hw.due_date)}
                  </span>
                </TableCell>
                <TableCell>
                  {hw.files.length > 0 && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {hw.files.length}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <HomeworkStatus
                    status={hw.status}
                    dueDate={hw.due_date}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
