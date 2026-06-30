"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { StatCardData } from "@/types/dashboard";

interface StatsCardProps {
  data: StatCardData;
  className?: string;
}

const iconBg: Record<string, string> = {
  DollarSign: "bg-emerald-500/10",
  TrendingUp: "bg-blue-500/10",
  TrendingDown: "bg-rose-500/10",
  Users: "bg-violet-500/10",
};

const iconColor: Record<string, string> = {
  DollarSign: "text-emerald-600",
  TrendingUp: "text-blue-600",
  TrendingDown: "text-rose-600",
  Users: "text-violet-600",
};

export function StatsCard({ data, className }: StatsCardProps) {
  const { label, value, trend, icon: Icon, format = "number" } = data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconName = (Icon as any).displayName || (Icon as any).name || "";

  const formattedValue =
    format === "currency"
      ? formatCurrency(Number(value))
      : format === "percent"
      ? `${Number(value).toFixed(1)}%`
      : formatNumber(Number(value));

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.isPositive ? (
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">к прошлому месяцу</span>
              </div>
            )}
          </div>
          <div className={cn("rounded-lg p-2.5", iconBg[iconName] || "bg-primary/10")}>
            <Icon className={cn("h-5 w-5", iconColor[iconName] || "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
