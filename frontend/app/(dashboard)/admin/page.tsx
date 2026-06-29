"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemStats } from "@/components/admin/SystemStats";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { useSystemStats, useAuditLogs } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useSystemStats();
  const { data: logsData, isLoading: logsLoading, error: logsError } = useAuditLogs({ page: 1, per_page: 5 });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="rounded-md border p-4 text-center text-destructive">
        {statsError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
        <p className="text-muted-foreground">
          Обзор и управление системой
        </p>
      </div>

      {stats && <SystemStats stats={stats} />}

      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogTable
            logs={logsData?.logs || []}
            isLoading={logsLoading}
            error={logsError}
            total={logsData?.total || 0}
            page={1}
            perPage={5}
            onPageChange={() => {}}
            onActionFilter={() => {}}
            currentAction={undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
