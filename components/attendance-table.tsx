"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"
import type { EmployeeAttendance, ClockInRecord } from "@/app/page"

type AttendanceTableProps = {
  data: EmployeeAttendance[]
  selectedMonth: string
  records: ClockInRecord[]
}

export function AttendanceTable({ data, selectedMonth, records }: AttendanceTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAttendance | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getAttendanceBadge = (days: number) => {
    if (days >= 20) return <span className="bg-green-100 text-green-700 hover:bg-green-100">Excellent</span>
    if (days >= 15) return <span className="bg-blue-100 text-blue-700 hover:bg-blue-100">Good</span>
    if (days >= 10) return <span className="bg-amber-100 text-amber-700 hover:bg-amber-100">Fair</span>
    return <span className="bg-red-100 text-red-700 hover:bg-red-100">Poor</span>
  }

  const getEmployeeHistory = (userId: number) => {
    const [year, monthNum] = selectedMonth.split("-").map(Number)

    return records
      .filter((record) => {
        const recordUserId = record.user_id || record.user_ref
        const date = new Date(record.created_at)
        return recordUserId === userId && date.getFullYear() === year && date.getMonth() + 1 === monthNum
      })
      .map((record) => {
        const date = new Date(record.created_at)
        return {
          date: date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
          timestamp: date.getTime(),
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  const handleRowClick = (employee: EmployeeAttendance) => {
    setSelectedEmployee(employee)
    setIsDialogOpen(true)
  }

  const employeeHistory = selectedEmployee ? getEmployeeHistory(selectedEmployee.userId) : []

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Employee Attendance Details</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Days Worked</th>
              </tr>
            </thead>
            <tbody>
              {data.map((employee) => (
                <tr
                  key={employee.userId}
                  onClick={() => handleRowClick(employee)}
                  className="border-b border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {employee.firstName[0]}
                        {employee.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-slate-500">ID: {employee.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{employee.email}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-lg font-semibold text-slate-900">{employee.daysWorked}</span>
                    <span className="text-sm text-slate-500 ml-1">days</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12 text-slate-500">No attendance data available for the selected month</div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {selectedEmployee?.firstName[0]}
                {selectedEmployee?.lastName[0]}
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">
                  {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                </div>
                <div className="text-sm font-normal text-slate-500">{selectedEmployee?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Days</div>
                <div className="text-2xl font-bold text-blue-900">{selectedEmployee?.daysWorked}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium mb-1">Avg Clock-In</div>
                <div className="text-2xl font-bold text-purple-900">{selectedEmployee?.averageClockInTime}</div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Clock-In History
            </h4>

            <div className="space-y-2">
              {employeeHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{entry.date}</div>
                      <div className="text-sm text-slate-500">Day {employeeHistory.length - index}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold text-slate-900">{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {employeeHistory.length === 0 && (
              <div className="text-center py-8 text-slate-500">No clock-in records found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
