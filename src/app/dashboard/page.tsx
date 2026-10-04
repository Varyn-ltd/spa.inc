"use client"

import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Receipt,
} from "lucide-react"
import { SummaryCard } from "@/components/shared/summary-card"
import { RevenueExpensesChart } from "@/components/charts/revenue-expenses-chart"
import { TopEarnersChart } from "@/components/charts/top-earners-chart"
import { WeeklyVisitsChart } from "@/components/charts/weekly-visits-chart"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import {
  getTodaysRevenue,
  getMonthlyRevenue,
  getActiveClientCount,
  getTodaysAppointments,
  getDailyCosts,
  getTodaysRevenueChange,
  getMonthlyRevenueChange,
  getDailyCostsChange,
} from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

const todaysRevenue = getTodaysRevenue()
const monthlyRevenue = getMonthlyRevenue()
const activeClients = getActiveClientCount()
const todaysAppointments = getTodaysAppointments()
const dailyCosts = getDailyCosts()
const todaysRevenueChange = getTodaysRevenueChange()
const monthlyRevenueChange = getMonthlyRevenueChange()
const dailyCostsChange = getDailyCostsChange()

/** Formats a percentage delta for display, or undefined when there is no baseline. */
function formatChange(change: number | null): string | undefined {
  if (change === null) return undefined
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
}

/**
 * For revenue, growth is good. For costs, a decrease is good — pass
 * `lowerIsBetter` so a falling cost line is still rendered in green.
 */
function changeTone(
  change: number | null,
  lowerIsBetter = false
): "positive" | "negative" | "neutral" {
  if (change === null || change === 0) return "neutral"
  const good = lowerIsBetter ? change < 0 : change > 0
  return good ? "positive" : "negative"
}

export default function DashboardPage() {
  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          title="Today's Revenue"
          value={formatCurrency(todaysRevenue)}
          change={formatChange(todaysRevenueChange)}
          changeType={changeTone(todaysRevenueChange)}
          icon={DollarSign}
          description="vs last week"
        />
        <SummaryCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          change={formatChange(monthlyRevenueChange)}
          changeType={changeTone(monthlyRevenueChange)}
          icon={TrendingUp}
          description="vs last month"
        />
        <SummaryCard
          title="Active Clients"
          value={activeClients.toString()}
          icon={Users}
          description="total registered"
        />
        <SummaryCard
          title="Appointments Today"
          value={todaysAppointments.length.toString()}
          icon={Calendar}
          description="scheduled"
        />
        <SummaryCard
          title="Daily Costs"
          value={formatCurrency(dailyCosts)}
          change={formatChange(dailyCostsChange)}
          changeType={changeTone(dailyCostsChange, true)}
          icon={Receipt}
          description="vs last week"
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueExpensesChart />
        <TopEarnersChart />
        <WeeklyVisitsChart />
        <UpcomingAppointments />
      </div>
    </div>
  )
}
