"use client";

import { usePortalPayments } from "@/hooks/usePortal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function PaymentSummary() {
  const { payments, isLoading, error } = usePortalPayments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Не удалось загрузить платежи</p>
      </div>
    );
  }

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const lastPayment = completedPayments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Всего оплачено</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Последний платёж</p>
          <p className="text-lg font-semibold">
            {lastPayment ? formatDate(lastPayment.date) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
