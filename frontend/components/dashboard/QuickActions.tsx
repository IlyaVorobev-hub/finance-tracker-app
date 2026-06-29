"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Calendar, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/types/dashboard";

const defaultActions: QuickAction[] = [
  {
    label: "Добавить доход",
    icon: Plus,
    href: "/finance?modal=income",
    color: "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    label: "Добавить расход",
    icon: Minus,
    href: "/finance?modal=expense",
    color: "text-red-500 bg-red-500/10 hover:bg-red-500/20",
  },
  {
    label: "Записать урок",
    icon: Calendar,
    href: "/tutoring?modal=schedule",
    color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    label: "Календарь",
    icon: CreditCard,
    href: "/tutoring/calendar",
    color: "text-violet-500 bg-violet-500/10 hover:bg-violet-500/20",
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href || "#"}>
                <Button
                  variant="outline"
                  className={cn(
                    "flex h-auto w-full flex-col items-center gap-2 py-4 transition-all",
                    action.color
                  )}
                  onClick={action.onClick}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
