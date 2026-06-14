"use client";

import { useState } from "react";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { useAuditLogs } from "@/hooks/useAdmin";

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const perPage = 20;

  const { data, isLoading, error } = useAuditLogs({
    page,
    per_page: perPage,
    action: actionFilter,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          System activity and security logs
        </p>
      </div>

      <AuditLogTable
        logs={data?.logs || []}
        isLoading={isLoading}
        error={error}
        total={data?.total || 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onActionFilter={(action) => {
          setActionFilter(action);
          setPage(1);
        }}
        currentAction={actionFilter}
      />
    </div>
  );
}
