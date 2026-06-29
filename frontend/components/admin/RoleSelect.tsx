"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ROLES = [
  { value: "admin", label: "Администратор" },
  { value: "tutor", label: "Репетитор" },
  { value: "student", label: "Ученик" },
] as const;

interface RoleSelectProps {
  currentRole: string;
  userId: string;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
  disabled?: boolean;
}

export function RoleSelect({
  currentRole,
  userId,
  onRoleChange,
  disabled = false,
}: RoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const handleValueChange = (value: string) => {
    if (value !== currentRole) {
      setPendingRole(value);
      setIsOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (pendingRole) {
      await onRoleChange(userId, pendingRole);
      setSelectedRole(pendingRole);
      setPendingRole(null);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setPendingRole(null);
    setIsOpen(false);
  };

  return (
    <>
      <Select
        value={selectedRole}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Выберите роль" />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить смену роли</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите изменить роль пользователя на{" "}
              <span className="font-semibold">
                {ROLES.find((r) => r.value === pendingRole)?.label}
              </span>
              ? Это действие может повлиять на разрешения пользователя.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button onClick={handleConfirm}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
