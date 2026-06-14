"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Calendar, BookOpen } from "lucide-react";

const tabs = [
  { value: "students", label: "Students", href: "/tutoring/students", icon: GraduationCap },
  { value: "calendar", label: "Calendar", href: "/tutoring/calendar", icon: Calendar, disabled: true },
  { value: "homework", label: "Homework", href: "/homework", icon: BookOpen, disabled: true },
];

export default function TutoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentTab = tabs.find((t) => pathname.startsWith(t.href))?.value || "students";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tutoring</h1>
      </div>
      <Tabs value={currentTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              asChild={!tab.disabled}
            >
              {tab.disabled ? (
                <span className="flex items-center gap-2 opacity-50">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </span>
              ) : (
                <Link href={tab.href} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div>{children}</div>
    </div>
  );
}
