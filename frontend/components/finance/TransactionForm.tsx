"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction, TransactionFormData, Category } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
  amount: z.number().positive("Сумма должна быть положительной"),
  date: z.string().min(1, "Дата обязательна"),
  category_id: z.string().min(1, "Категория обязательна"),
  description: z.string().default(""),
  type: z.enum(["income", "expense"]),
});

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  categories: Category[];
  transaction?: Transaction | null;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TransactionForm({
  open,
  onOpenChange,
  type,
  categories,
  transaction,
  onSubmit,
  isLoading,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      description: "",
      type,
    },
  });

  const selectedCategoryId = watch("category_id");

  useEffect(() => {
    if (transaction) {
      setValue("amount", transaction.amount);
      setValue("date", transaction.date.split("T")[0]);
      setValue("category_id", transaction.category_id);
      setValue("description", transaction.description || "");
      setValue("type", transaction.type);
    } else {
      reset({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        category_id: "",
        description: "",
        type,
      });
    }
  }, [transaction, type, setValue, reset]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit({ ...data, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Редактировать" : "Добавить"} {type === "income" ? "доход" : "расход"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Обновите данные транзакции ниже."
              : "Введите данные для новой транзакции."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Дата</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setValue("category_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              placeholder="Необязательное описание"
              {...register("description")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? "Обновить" : "Добавить"} {type === "income" ? "доход" : "расход"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
