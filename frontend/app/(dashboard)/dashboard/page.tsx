"use client";

import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import {
  useDashboardData,
  useMonthlyAnalytics,
  useUpcomingLessons,
  useStudentStats,
} from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardData();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyAnalytics(6);
  const { data: lessons, isLoading: lessonsLoading } = useUpcomingLessons();
  const { data: students, isLoading: studentsLoading } = useStudentStats();

  return (
    <div className="space-y-6">
      <WelcomeCard
        balance={dashboardData?.current_balance}
        monthIncome={dashboardData?.month_income}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          data={{
            label: "Текущий баланс",
            value: dashboardData?.current_balance ?? 0,
            icon: DollarSign,
            format: "currency",
          }}
        />
        <StatsCard
          data={{
            label: "Доход за месяц",
            value: dashboardData?.month_income ?? 0,
            icon: TrendingUp,
            format: "currency",
          }}
        />
        <StatsCard
          data={{
            label: "Расходы за месяц",
            value: dashboardData?.month_expenses ?? 0,
            icon: TrendingDown,
            format: "currency",
          }}
        />
        <StatsCard
          data={{
            label: "Активные ученики",
            value: students?.filter((s) => s.status === "active").length ?? 0,
            icon: Users,
            format: "number",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <IncomeExpenseChart data={monthlyData ?? []} isLoading={monthlyLoading} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions
            transactions={dashboardData?.recent_transactions ?? []}
            isLoading={dashboardLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <StudentOverview students={students ?? []} isLoading={studentsLoading} />
        </div>
      </div>

      <UpcomingLessons lessons={lessons ?? []} isLoading={lessonsLoading} />
    </div>
  );
}
