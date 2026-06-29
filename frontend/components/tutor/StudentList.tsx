"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { Student } from "@/types/student";

const statusColor: Record<Student["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  finished: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Ученики не найдены.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Предмет</TableHead>
              <TableHead>Ставка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Link
                    href={`/tutoring/students/${student.id}`}
                    className="font-medium hover:underline"
                  >
                    {student.first_name} {student.last_name}
                  </Link>
                </TableCell>
                <TableCell>{student.subject}</TableCell>
                <TableCell>{formatCurrency(student.lesson_price)}/hr</TableCell>
                <TableCell>
                  <Badge className={statusColor[student.status]}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(student);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(student);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {students.map((student) => (
          <Link key={student.id} href={`/tutoring/students/${student.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{student.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(student.lesson_price)}/hr
                  </p>
                </div>
                <Badge className={statusColor[student.status]}>
                  {student.status}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
