"use client";

import { useState } from "react";
import { Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { MonthlyReport } from "@/components/monthly-report";
import { StatsOverview } from "@/components/stats-overview";
import { AttendanceTable } from "@/components/attendance-table";

export type ClockInRecord = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  latitude: number;
  longitude: number;
};

export type EmployeeAttendance = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  daysWorked: number;
  clockInTimes: string[];
  averageClockInTime: string;
};

export default function Home() {
  const [records, setRecords] = useState<ClockInRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [processedData, setProcessedData] = useState<EmployeeAttendance[]>([]);

  const handleFileUpload = (data: ClockInRecord[]) => {
    console.log("[v0] handleFileUpload called with", data.length, "records");
    setRecords(data);

    // Get the most recent month from the data
    if (data.length > 0) {
      const dates = data.map((r) => new Date(r.created_at));
      console.log(" Sample dates:", dates.slice(0, 3));
      const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));
      console.log("Latest date:", latestDate);
      const monthKey = `${latestDate.getFullYear()}-${String(
        latestDate.getMonth() + 1
      ).padStart(2, "0")}`;
      console.log("Selected month:", monthKey);
      setSelectedMonth(monthKey);
      processMonthlyData(data, monthKey);
    }
  };

  const processMonthlyData = (data: ClockInRecord[], month: string) => {
    console.log(" processMonthlyData called for month:", month);
    const [year, monthNum] = month.split("-").map(Number);

    // Filter records for selected month
    const monthRecords = data.filter((record) => {
      const date = new Date(record.created_at);
      return date.getFullYear() === year && date.getMonth() + 1 === monthNum;
    });

    console.log("[v0] Filtered records for month:", monthRecords.length);

    // Group by user
    const userMap = new Map<number, EmployeeAttendance>();

    monthRecords.forEach((record) => {
      const userId = record.id
      const clockInTime = new Date(record.created_at).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      );

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          firstName: record.first_name,
          lastName: record.last_name,
          email: record.email,
          daysWorked: 0,
          clockInTimes: [],
          averageClockInTime: "",
        });
      }

      const user = userMap.get(userId)!;
      user.clockInTimes.push(clockInTime);
    });

    console.log("Unique users found:", userMap.size);

    // Calculate days worked and average clock-in time
    const processed = Array.from(userMap.values()).map((user) => {
      user.daysWorked = user.clockInTimes.length;

      // Calculate average clock-in time
      const times = user.clockInTimes.map((time) => {
        const [timeStr, period] = time.split(" ");
        const [hours, minutes] = timeStr.split(":").map(Number);
        let totalMinutes = hours * 60 + minutes;
        if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
        if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
        return totalMinutes;
      });

      const avgMinutes = Math.round(
        times.reduce((a, b) => a + b, 0) / times.length
      );
      const avgHours = Math.floor(avgMinutes / 60);
      const avgMins = avgMinutes % 60;
      const period = avgHours >= 12 ? "PM" : "AM";
      const displayHours =
        avgHours > 12 ? avgHours - 12 : avgHours === 0 ? 12 : avgHours;
      user.averageClockInTime = `${displayHours}:${String(avgMins).padStart(
        2,
        "0"
      )} ${period}`;

      return user;
    });

    // Sort by days worked (descending)
    processed.sort((a, b) => b.daysWorked - a.daysWorked);

    console.log(" Processed data:", processed.length, "employees");
    setProcessedData(processed);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    processMonthlyData(records, month);
  };

  const handlePrint = () => {
    window.print();
  };

  // Get available months from records
  const availableMonths = Array.from(
    new Set(
      records.map((r) => {
        const date = new Date(r.created_at);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      })
    )
  )
    .sort()
    .reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="print:hidden">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Employee Clock-In Analysis
                  </h1>
                  <p className="text-sm text-slate-600">
                    Monthly attendance tracking and reporting
                  </p>
                </div>
              </div>
              {processedData.length > 0 && (
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Printer className="h-4 w-4" />
                  Print Report
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {records.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <UploadZone onUpload={handleFileUpload} />
            </div>
          ) : (
            <div className="space-y-6">
              <StatsOverview
                data={processedData}
                selectedMonth={selectedMonth}
                availableMonths={availableMonths}
                onMonthChange={handleMonthChange}
              />

              <AttendanceTable
                data={processedData}
                selectedMonth={selectedMonth}
                records={records}
              />
            </div>
          )}
        </main>
      </div>

      {/* Print-only view */}
      <div className="hidden print:block">
        <MonthlyReport
          data={processedData}
          selectedMonth={selectedMonth}
          records={records}
        />
      </div>
    </div>
  );
}
