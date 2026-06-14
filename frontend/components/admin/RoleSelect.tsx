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
  { value: "admin", label: "Admin" },
  { value: "tutor", label: "Tutor" },
  { value: "student", label: "Student" },
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
          <SelectValue placeholder="Select role" />
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
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this user's role to{" "}
              <span className="font-semibold">
                {ROLES.find((r) => r.value === pendingRole)?.label}
              </span>
              ? This action may affect the user's permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
