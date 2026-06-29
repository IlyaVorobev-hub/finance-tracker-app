"use client";

import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useFinance";
import { CategoryManager } from "@/components/finance/CategoryManager";

export default function CategoriesPage() {
  const { categories, isLoading, refetch } = useCategories();
  const { createCategory } = useCreateCategory();
  const { deleteCategory } = useDeleteCategory();

  const handleCreate = async (data: { name: string; type: "income" | "expense" }) => {
    const result = await createCategory(data);
    if (result) {
      refetch();
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      refetch();
    }
    return success;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Категории</h2>
        <p className="text-muted-foreground">
          Организуйте транзакции с помощью пользовательских категорий.
        </p>
      </div>
      <CategoryManager
        categories={categories}
        isLoading={isLoading}
        onCreateCategory={handleCreate}
        onDeleteCategory={handleDelete}
      />
    </div>
  );
}
