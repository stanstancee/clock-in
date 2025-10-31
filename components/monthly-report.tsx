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

  const getTimeColor = (userId: number, timeString: string): string => {
    // Parse time string (e.g., "09:30 AM")
    const [time, period] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    const totalMinutes =
      (hours % 12) * 60 +
      minutes +
      (period === "PM" && hours !== 12 ? 12 * 60 : 0);

    const specialUserIds = [1, 2, 6, 12];

    if (specialUserIds.includes(userId)) {
      // Special rule: <=9am green, >9am yellow, >9:30am red
      const nineAM = 9 * 60; // 540 minutes
      const nineThirtyAM = 9.5 * 60; // 570 minutes

      if (totalMinutes <= nineAM) return "text-green-600";
      if (totalMinutes <= nineThirtyAM) return "text-yellow-600";
      return "text-red-600";
    } else {
      // Other rule: AM times and PM times
      if (period === "AM" || (period === "PM" && hours === 12)) {
        // AM times: <=8am green, >8am yellow, >8:30am red
        const eightAM = 8 * 60; // 480 minutes
        const eightThirtyAM = 8.5 * 60; // 510 minutes

        if (totalMinutes <= eightAM) return "text-green-600";
        if (totalMinutes <= eightThirtyAM) return "text-yellow-600";
        return "text-red-600";
      } else {
        // PM times: <=6pm green, >6pm yellow, >6:30pm red
        const sixPM = 18 * 60; // 1080 minutes
        const sixThirtyPM = 18.5 * 60; // 1110 minutes

        if (totalMinutes <= sixPM) return "text-green-600";
        if (totalMinutes <= sixThirtyPM) return "text-yellow-600";
        return "text-red-600";
      }
    }
  };

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
                      <span
                        className={cn(
                          getTimeColor(employee.userId, entry.time),
                          "font-semibold"
                        )}
                      >
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
          <span className="font-semibold">Note:</span> This report is generated
          automatically and is intended for internal use only.
        </p>
      </div>
    </div>
  );
}
