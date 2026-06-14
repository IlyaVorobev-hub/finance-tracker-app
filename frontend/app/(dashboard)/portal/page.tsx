"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingLessons } from "@/components/portal/UpcomingLessons";
import { PendingHomework } from "@/components/portal/PendingHomework";
import { PaymentSummary } from "@/components/portal/PaymentSummary";
import { Calendar, BookOpen, CreditCard, Clock } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { label: "View Schedule", href: "/portal/schedule", icon: Calendar },
  { label: "View Homework", href: "/portal/homework", icon: BookOpen },
  { label: "View Payments", href: "/portal/payments", icon: CreditCard },
  { label: "View History", href: "/portal/history", icon: Clock },
];

export default function PortalPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your learning journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingLessons />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Pending Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingHomework />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentSummary />
        </CardContent>
      </Card>
    </div>
  );
}
