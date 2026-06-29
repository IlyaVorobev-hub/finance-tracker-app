"use client";

import { useDashboard } from "@/hooks/useFinance";
import { BalanceCard } from "@/components/finance/BalanceCard";
import { MonthlySummary } from "@/components/finance/MonthlySummary";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinanceChart } from "@/components/finance/FinanceChart";
import { useState } from "react";
import { Transaction, TransactionFormData } from "@/types/finance";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { useCategories, useUpdateTransaction, useDeleteTransaction } from "@/hooks/useFinance";
import { useToast } from "@/components/ui/use-toast";

export default function FinanceDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();
  const { updateTransaction, isLoading: isUpdating } = useUpdateTransaction();
  const { deleteTransaction, isLoading: isDeleting } = useDeleteTransaction();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    const success = await deleteTransaction(transaction.id);
    if (success) {
      toast({ title: "Транзакция удалена" });
      refetch();
    } else {
      toast({ title: "Ошибка", description: "Не удалось удалить транзакцию.", variant: "destructive" });
    }
  };

  const handleSubmit = async (formData: TransactionFormData) => {
    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, formData);
      if (result) {
        toast({ title: "Транзакция обновлена" });
        refetch();
      } else {
        toast({ title: "Ошибка", description: "Не удалось обновить транзакцию.", variant: "destructive" });
      }
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard
          balance={data?.current_balance ?? 0}
          monthlyIncome={data?.month_income ?? 0}
          monthlyExpenses={data?.month_expenses ?? 0}
          isLoading={isLoading}
        />
        <MonthlySummary
          income={data?.month_income ?? 0}
          expenses={data?.month_expenses ?? 0}
          isLoading={isLoading}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionList
          transactions={data?.recent_transactions ?? []}
          total={data?.recent_transactions?.length ?? 0}
          page={1}
          perPage={10}
          isLoading={isLoading}
          onPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <FinanceChart
          data={data?.monthly_trend ?? []}
          isLoading={isLoading}
        />
      </div>
      <TransactionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        type={editingTransaction?.type ?? "expense"}
        categories={[]}
        transaction={editingTransaction}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}
