"use client";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { UserMenu } from "@/components/shared/UserMenu";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="lg:hidden">
        <h1 className="text-lg font-bold">Финансы и Репетиторство</h1>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
