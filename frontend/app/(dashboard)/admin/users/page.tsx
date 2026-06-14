"use client";

import { useState } from "react";
import { UserTable } from "@/components/admin/UserTable";
import { useUsersList, useUpdateUserRole, useUpdateUserStatus } from "@/hooks/useAdmin";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error, refetch } = useUsersList({
    search: searchQuery || undefined,
  });
  const { updateRole } = useUpdateUserRole();
  const { updateStatus } = useUpdateUserStatus();

  const handleRoleChange = async (userId: string, role: string) => {
    await updateRole(userId, role);
    refetch();
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    await updateStatus(userId, isActive);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>

      <UserTable
        users={data?.users || []}
        isLoading={isLoading}
        error={error}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
