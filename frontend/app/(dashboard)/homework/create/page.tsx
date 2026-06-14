"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { HomeworkForm } from "@/components/homework/HomeworkForm";
import { useCreateHomework } from "@/hooks/useHomework";
import apiClient from "@/lib/api";
import type { CreateHomeworkData } from "@/types/homework";

export default function CreateHomeworkPage() {
  const router = useRouter();
  const { create, isSubmitting } = useCreateHomework();

  const handleSubmit = async (data: CreateHomeworkData) => {
    const result = await create(data);
    if (result) {
      router.push(`/homework/${result.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Create Homework</h2>
          <p className="text-sm text-muted-foreground">
            Assign new homework to a student
          </p>
        </div>
      </div>

      <HomeworkForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
