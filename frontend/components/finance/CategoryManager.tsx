"use client";

import { useState } from "react";
import { Category, CategoryFormData } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CategoryManagerProps {
  categories: Category[];
  isLoading?: boolean;
  onCreateCategory: (data: CategoryFormData) => Promise<Category | null>;
  onDeleteCategory: (id: string) => Promise<boolean>;
}

export function CategoryManager({
  categories,
  isLoading,
  onCreateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const systemCategories = filteredCategories.filter((c) => c.is_system);
  const userCategories = filteredCategories.filter((c) => !c.is_system);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    const result = await onCreateCategory({ name: newCategoryName.trim(), type: activeTab });
    if (result) {
      setNewCategoryName("");
      toast({ title: "Категория создана", description: `"${result.name}" добавлена.` });
    } else {
      toast({ title: "Ошибка", description: "Не удалось создать категорию.", variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleDelete = async (category: Category) => {
    setDeletingId(category.id);
    const success = await onDeleteCategory(category.id);
    if (success) {
      toast({ title: "Категория удалена", description: `"${category.name}" удалена.` });
    } else {
      toast({ title: "Ошибка", description: "Не удалось удалить категорию.", variant: "destructive" });
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Категории</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Категории</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expense")}>
          <TabsList className="mb-4">
            <TabsTrigger value="income">Доход</TabsTrigger>
            <TabsTrigger value="expense">Расход</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={`Новая категория ${activeTab === "income" ? "дохода" : "расхода"}`}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newCategoryName.trim() || isCreating}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {systemCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Системные категории</p>
                {systemCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                        <Lock className="mr-1 h-3 w-3" />
                        Системная
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {userCategories.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Ваши категории</p>
                {userCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {filteredCategories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Категорий {activeTab === "income" ? "дохода" : "расхода"} пока нет.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
