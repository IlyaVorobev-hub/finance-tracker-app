"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import { SystemStats as SystemStatsType } from "@/types/admin";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface SystemStatsProps {
  stats: SystemStatsType;
}

export function SystemStats({ stats }: SystemStatsProps) {
  const cards = [
    {
      title: "Total Users",
      value: formatNumber(stats.total_users),
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Tutors",
      value: formatNumber(stats.total_tutors),
      icon: GraduationCap,
      description: "Active tutors",
    },
    {
      title: "Students",
      value: formatNumber(stats.total_students),
      icon: Users,
      description: "Active students",
    },
    {
      title: "Lessons",
      value: formatNumber(stats.total_lessons),
      icon: BookOpen,
      description: "Total lessons conducted",
    },
    {
      title: "Income",
      value: formatCurrency(stats.total_income),
      icon: TrendingUp,
      description: "Total revenue",
    },
    {
      title: "Expenses",
      value: formatCurrency(stats.total_expenses),
      icon: TrendingDown,
      description: "Total expenses",
    },
    {
      title: "Active Today",
      value: formatNumber(stats.active_lessons_today),
      icon: Calendar,
      description: "Lessons scheduled today",
    },
    {
      title: "Pending Homework",
      value: formatNumber(stats.pending_homework),
      icon: Clock,
      description: "Awaiting review",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
