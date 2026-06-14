"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Student } from "@/types/student";

const statusVariant: Record<Student["status"], "default" | "secondary" | "destructive"> = {
  active: "default",
  paused: "secondary",
  finished: "destructive",
};

const statusColor: Record<Student["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  finished: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();

  return (
    <Link href={`/tutoring/students/${student.id}`}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate">
                  {student.first_name} {student.last_name}
                </h3>
                <Badge className={statusColor[student.status]}>
                  {student.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{student.subject}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{student.email}</span>
                <span>{formatCurrency(student.lesson_price)}/hr</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
