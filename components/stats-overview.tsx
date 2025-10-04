"use client"

import { Users, Calendar, Clock, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EmployeeAttendance } from "@/app/page"

type StatsOverviewProps = {
  data: EmployeeAttendance[]
  selectedMonth: string
  availableMonths: string[]
  onMonthChange: (month: string) => void
}

export function StatsOverview({ data, selectedMonth, availableMonths, onMonthChange }: StatsOverviewProps) {
  const totalEmployees = data.length
  const totalClockIns = data.reduce((sum, emp) => sum + emp.daysWorked, 0)
  const avgDaysWorked = totalEmployees > 0 ? (totalClockIns / totalEmployees).toFixed(1) : "0"
  const perfectAttendance = data.filter((emp) => emp.daysWorked >= 20).length

  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Monthly Overview</h2>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthDisplay(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900">{totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Clock-Ins</p>
              <p className="text-2xl font-bold text-slate-900">{totalClockIns}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Days Worked</p>
              <p className="text-2xl font-bold text-slate-900">{avgDaysWorked}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Perfect Attendance</p>
              <p className="text-2xl font-bold text-slate-900">{perfectAttendance}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
