"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки системы</h1>
        <p className="text-muted-foreground">
          Настройка параметров системы
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Общие настройки
          </CardTitle>
          <CardDescription>
            Управление системными категориями, стандартными ставками и другими параметрами.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Настройки системы скоро будут доступны здесь.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Скоро: Управление категориями, стандартные ставки, системные предпочтения
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
