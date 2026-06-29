"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { AuditLog } from "@/types/admin";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onActionFilter: (action: string | undefined) => void;
  currentAction: string | undefined;
}

const ACTION_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  login: "outline",
  logout: "outline",
};

export function AuditLogTable({
  logs,
  isLoading,
  error,
  total,
  page,
  perPage,
  onPageChange,
  onActionFilter,
  currentAction,
}: AuditLogTableProps) {
  const totalPages = Math.ceil(total / perPage);

  if (error) {
    return (
      <div className="rounded-md border p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Фильтр по действию:</span>
          <Select
            value={currentAction || "all"}
            onValueChange={(value) =>
              onActionFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Все действия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все действия</SelectItem>
              <SelectItem value="create">Создание</SelectItem>
              <SelectItem value="update">Обновление</SelectItem>
              <SelectItem value="delete">Удаление</SelectItem>
              <SelectItem value="login">Вход</SelectItem>
              <SelectItem value="logout">Выход</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Время</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Объект</TableHead>
              <TableHead>Детали</TableHead>
              <TableHead>IP-адрес</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Журнал аудита не найден.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>{log.user_email || log.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={ACTION_VARIANTS[log.action] || "outline"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {log.entity_type}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.ip_address || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Страница {page} из {totalPages || 1} (всего {total} записей)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Вперёд
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
