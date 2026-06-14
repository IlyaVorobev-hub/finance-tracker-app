"use client";

import { useState } from "react";
import { useTransactions, useCategories, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/useFinance";
import { TransactionList } from "@/components/finance/TransactionList";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { Transaction, TransactionFormData } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { transactions, total, isLoading, refetch } = useTransactions("expense", page);
  const { categories } = useCategories("expense");
  const { createTransaction, isLoading: isCreating } = useCreateTransaction();
  const { updateTransaction, isLoading: isUpdating } = useUpdateTransaction();
  const { deleteTransaction } = useDeleteTransaction();
  const { toast } = useToast();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    const success = await deleteTransaction(transaction.id);
    if (success) {
      toast({ title: "Expense deleted" });
      refetch();
    } else {
      toast({ title: "Error", description: "Failed to delete expense.", variant: "destructive" });
    }
  };

  const handleSubmit = async (formData: TransactionFormData) => {
    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, formData);
      if (result) {
        toast({ title: "Expense updated" });
        refetch();
      } else {
        toast({ title: "Error", description: "Failed to update expense.", variant: "destructive" });
      }
    } else {
      const result = await createTransaction({ ...formData, type: "expense" });
      if (result) {
        toast({ title: "Expense added" });
        refetch();
      } else {
        toast({ title: "Error", description: "Failed to add expense.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage your expenses.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <TransactionList
        transactions={transactions}
        total={total}
        page={page}
        perPage={20}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TransactionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        type="expense"
        categories={categories}
        transaction={editingTransaction}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
