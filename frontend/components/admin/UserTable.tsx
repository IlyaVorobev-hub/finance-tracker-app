"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RoleSelect } from "./RoleSelect";
import { formatDate } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onRoleChange: (userId: string, role: string) => Promise<void>;
  onStatusChange: (userId: string, isActive: boolean) => Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function UserTable({
  users,
  isLoading,
  error,
  onRoleChange,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: UserTableProps) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    setUpdatingStatus(userId);
    try {
      await onStatusChange(userId, isActive);
      toast({
        title: "Статус обновлён",
        description: `Пользователь ${isActive ? "активирован" : "деактивирован"}.`,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус пользователя.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await onRoleChange(userId, role);
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно обновлена.",
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "tutor":
        return "secondary";
      case "student":
        return "outline";
      default:
        return "outline";
    }
  };

  if (error) {
    return (
      <div className="rounded-md border p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Пользователи не найдены.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name || user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleSelect
                      currentRole={user.role}
                      userId={user.id}
                      onRoleChange={handleRoleChange}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Активен" : "Неактивен"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(checked) =>
                        handleStatusToggle(user.id, checked)
                      }
                      disabled={updatingStatus === user.id}
                    />
                    {updatingStatus === user.id && (
                      <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
