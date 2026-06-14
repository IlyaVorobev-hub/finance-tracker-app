"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentCard } from "@/components/tutor/StudentCard";
import { useStudents } from "@/hooks/useStudents";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Users, UserCheck, Calendar, DollarSign, Plus, ArrowRight } from "lucide-react";

export default function TutoringPage() {
  const { students, total, isLoading, error } = useStudents({ per_page: 5 });

  const activeCount = students.filter((s) => s.status === "active").length;

  const stats = [
    {
      label: "Total Students",
      value: total,
      icon: Users,
    },
    {
      label: "Active Students",
      value: activeCount,
      icon: UserCheck,
    },
    {
      label: "Upcoming Lessons",
      value: "--",
      icon: Calendar,
    },
    {
      label: "Avg. Rate",
      value: students.length > 0
        ? formatCurrency(students.reduce((sum, s) => sum + s.lesson_price, 0) / students.length)
        : "$0",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">Manage your tutoring business</p>
        </div>
        <Link href="/tutoring/students">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Students</CardTitle>
          <Link
            href="/tutoring/students"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-8 text-center">{error}</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No students yet. Add your first student to get started.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
