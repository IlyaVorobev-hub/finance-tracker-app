"use client";

import { useState } from "react";
import { usePortalPayments } from "@/hooks/usePortal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

const statusConfig = {
  completed: {
    label: "Завершено",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  pending: {
    label: "Ожидает",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  failed: {
    label: "Ошибка",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

export default function PaymentsPage() {
  const { payments, isLoading, error } = usePortalPayments();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPayments = payments
    .filter((payment) => {
      if (startDate && new Date(payment.date) < new Date(startDate)) return false;
      if (endDate && new Date(payment.date) > new Date(endDate)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPaid = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Не удалось загрузить платежи</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Платежи</h1>
        <p className="text-muted-foreground">Просмотр истории платежей.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Всего оплачено</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Всего транзакций</p>
          <p className="text-2xl font-bold">{filteredPayments.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Завершено</p>
          <p className="text-2xl font-bold">
            {filteredPayments.filter((p) => p.status === "completed").length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="Дата начала"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="Дата окончания"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Платежи не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const statusInfo = statusConfig[payment.status];
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium">{formatDate(payment.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    Урок: {payment.lesson_date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Способ: {payment.method}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                  <Badge variant="outline" className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
