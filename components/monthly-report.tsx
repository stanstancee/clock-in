"use client";

import type { EmployeeAttendance, ClockInRecord } from "@/app/page";
import { AttendanceTable } from "./attendance-table";
import { cn } from "@/lib/utils";

type MonthlyReportProps = {
  data: EmployeeAttendance[];
  selectedMonth: string;
  records: ClockInRecord[];
};

export function MonthlyReport({
  data,
  selectedMonth,
  records,
}: MonthlyReportProps) {
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getEmployeeHistory = (userId: number) => {
    const [year, monthNum] = selectedMonth.split("-").map(Number);

    const history = records
      .filter((record) => {
        const recordUserId = record.user_id || record.user_ref;
        const date = new Date(record.created_at);
        return (
          recordUserId === userId &&
          date.getFullYear() === year &&
          date.getMonth() + 1 === monthNum
        );
      })
      .map((record) => {
        const date = new Date(record.created_at);
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          timestamp: date.getTime(),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[v0] History for user ${userId}:`, history.length, "entries");
    return history;
  };

  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white">
      <div className="mb-8 border-b-2 border-slate-900 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Employee Attendance Report
        </h1>
        <div className="flex justify-between text-sm text-slate-600">
          <p>Period: {formatMonthDisplay(selectedMonth)}</p>
          <p>Generated: {currentDate}</p>
        </div>
      </div>

      {/* <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="border border-slate-300 p-4 rounded">
          <p className="text-sm text-slate-600 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-slate-900">{data.length}</p>
        </div>
        <div className="border border-slate-300 p-4 rounded">
          <p className="text-sm text-slate-600 mb-1">Total Clock-Ins</p>
          <p className="text-2xl font-bold text-slate-900">
            {data.reduce((sum, emp) => sum + emp.daysWorked, 0)}
          </p>
        </div>
        <div className="border border-slate-300 p-4 rounded">
          <p className="text-sm text-slate-600 mb-1">Avg Days Worked</p>
          <p className="text-2xl font-bold text-slate-900">
            {(
              data.reduce((sum, emp) => sum + emp.daysWorked, 0) / data.length
            ).toFixed(1)}
          </p>
        </div>
      </div> */}
      <AttendanceTable
        data={data}
        selectedMonth={selectedMonth}
        records={records}
      />

      <div className="space-y-8">
        {data.map((employee) => {
          const history = getEmployeeHistory(employee.userId);
          return (
            <div
              key={employee.userId}
              className="border border-slate-300 rounded-lg p-4 break-inside-avoid"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{employee.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Days</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {employee.daysWorked}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Attendance History:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm"
                    >
                      <span className="text-slate-700 font-medium">
                        {entry.date}
                      </span>
                      <span className={cn("text-slate-900 font-semibold")}>
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500">
        <p>
          This report was automatically generated Stanley's Clock-In Analysis
          System
        </p>
      </div>
    </div>
  );
}
