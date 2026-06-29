"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentStatusProps {
  status: "paid" | "unpaid";
  onToggle?: () => void;
  isLoading?: boolean;
  interactive?: boolean;
}

export function PaymentStatus({
  status,
  onToggle,
  isLoading = false,
  interactive = true,
}: PaymentStatusProps) {
  const isPaid = status === "paid";

  if (!interactive || !onToggle) {
    return (
      <Badge
        className={
          isPaid
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }
      >
        {isPaid ? "Оплачен" : "Не оплачен"}
      </Badge>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0"
      onClick={onToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Badge
          className={`cursor-pointer transition-colors ${
            isPaid
              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
              : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          }`}
        >
          {isPaid ? "Оплачен" : "Не оплачен"}
        </Badge>
      )}
    </Button>
  );
}
