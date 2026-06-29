"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MonthlySummaryProps {
  income: number;
  expenses: number;
  isLoading?: boolean;
}

export function MonthlySummary({ income, expenses, isLoading }: MonthlySummaryProps) {
  const net = income - expenses;
  const maxAmount = Math.max(income, expenses, 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Месячный итог</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Месячный итог</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Доход</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(income)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-400"
              style={{ width: `${(income / maxAmount) * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Расходы</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-red-600 dark:bg-red-400"
              style={{ width: `${(expenses / maxAmount) * 100}%` }}
            />
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Чистая прибыль</span>
            <span
              className={cn(
                "text-lg font-bold",
                net >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatCurrency(net)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
