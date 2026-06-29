"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

interface WelcomeCardProps {
  balance?: number;
  monthIncome?: number;
}

export function WelcomeCard({ balance, monthIncome }: WelcomeCardProps) {
  const { user } = useAuth();
  const firstName = user?.first_name || "there";

  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-blue-500/5" />
      <CardContent className="relative p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {firstName}
            </h2>
            <p className="text-muted-foreground">
              {format(new Date(), "d MMMM yyyy, EEEE", { locale: ru })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:text-right">
            <p className="text-sm text-muted-foreground">Общий баланс</p>
            <p className="text-2xl font-bold text-primary">
              {balance !== undefined
                ? new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  }).format(balance)
                : "--"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
