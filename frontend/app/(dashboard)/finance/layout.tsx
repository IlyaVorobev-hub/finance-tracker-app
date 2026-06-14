"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, FolderOpen, BarChart3 } from "lucide-react";

const financeTabs = [
  { value: "dashboard", label: "Dashboard", href: "/finance", icon: LayoutDashboard },
  { value: "income", label: "Income", href: "/finance/income", icon: ArrowDownCircle },
  { value: "expenses", label: "Expenses", href: "/finance/expenses", icon: ArrowUpCircle },
  { value: "categories", label: "Categories", href: "/finance/categories", icon: FolderOpen },
  { value: "analytics", label: "Analytics", href: "/finance/analytics", icon: BarChart3 },
];

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentValue =
    pathname === "/finance"
      ? "dashboard"
      : pathname.split("/finance/")[1] || "dashboard";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground">
          Manage your income, expenses, and financial overview.
        </p>
      </div>
      <Tabs value={currentValue}>
        <TabsList>
          {financeTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={tab.href} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
