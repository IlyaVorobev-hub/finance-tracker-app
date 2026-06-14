"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface WelcomeCardProps {
  balance?: number;
  monthIncome?: number;
}

export function WelcomeCard({ balance, monthIncome }: WelcomeCardProps) {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.full_name?.split(" ")[0] || "there";

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
      <CardContent className="relative p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {firstName}
            </h2>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:text-right">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold">
              {balance !== undefined
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(balance)
                : "--"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
