"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse } from "date-fns";
import { mockIbkrDailyPnl } from "@/mock-data/daily-pnl";

// Define DayContentProps for react-day-picker v9.6.7
interface DayContentProps {
  date: Date;
  displayMonth: Date;
  activeModifiers: Record<string, boolean>;
}

// Updated trade data structure based on mockIbkrDailyPnl
interface TradeDay {
  date: Date;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  hasTrades: number; // 1 if totalPnl != 0, else 0
}

interface WeekSummary {
  totalPnl: number;
  days: number;
}


export function TradeCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 0, 1)); // January 2025

  // Aggregate trade data from mockIbkrDailyPnl across accounts
  const [tradeData] = React.useState<TradeDay[]>(() => {
    const dateMap = new Map<string, TradeDay>();
    
    mockIbkrDailyPnl.forEach(({ dailyPnl }) => {
      dailyPnl.forEach(({ date, totalPnl, realizedPnl, unrealizedPnl }) => {
        const dateStr = date;
        const existing = dateMap.get(dateStr) || {
          date: parse(date, "yyyy-MM-dd", new Date()),
          totalPnl: 0,
          realizedPnl: 0,
          unrealizedPnl: 0,
          hasTrades: 0,
        };
        existing.totalPnl += totalPnl;
        existing.realizedPnl += realizedPnl;
        existing.unrealizedPnl += unrealizedPnl;
        existing.hasTrades = existing.totalPnl !== 0 ? 1 : 0;
        dateMap.set(dateStr, existing);
      });
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  // Precompute trade data map for faster lookup
  const tradeDataMap = React.useMemo(() => {
    const map = new Map<string, TradeDay>();
    tradeData.forEach((trade) => {
      map.set(format(trade.date, "yyyy-MM-dd"), trade);
    });
    return map;
  }, [tradeData]);

  const getWeekSummary = (weekStart: Date, weekEnd: Date): WeekSummary => {
    const weekTrades = tradeData.filter(
      (trade) => trade.date >= weekStart && trade.date <= weekEnd
    );
    const totalPnl = weekTrades.reduce((sum, trade) => sum + trade.totalPnl, 0);
    const days = weekTrades.reduce((sum, trade) => sum + trade.hasTrades, 0);
    return { totalPnl, days };
  };

  // Calculate week summaries for the current month
  const { weekSummaries, numWeeks } = React.useMemo(() => {
    const weeks: WeekSummary[] = [];
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startOfFirstWeek = new Date(firstDayOfMonth);
    startOfFirstWeek.setDate(firstDayOfMonth.getDate() - firstDayOfWeek);

    const totalDaysInGrid = lastDayOfMonth.getDate() + firstDayOfWeek;
    const numWeeks = Math.ceil(totalDaysInGrid / 7);

    for (
      let d = new Date(startOfFirstWeek);
      weeks.length < numWeeks;
      d.setDate(d.getDate() + 7)
    ) {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const summary = getWeekSummary(weekStart, weekEnd);
      weeks.push(summary);
    }

    return { weekSummaries: weeks, numWeeks };
  }, [currentMonth]);

  const modifiers = {
    profitable: tradeData
      .filter((trade) => trade.totalPnl >= 0)
      .map((trade) => trade.date),
    loss: tradeData
      .filter((trade) => trade.totalPnl < 0)
      .map((trade) => trade.date),
  };

  const modifiersClassNames = {
    profitable: "bg-green-100 text-green-800",
    loss: "bg-red-100 text-red-800",
  };

  // Calculate positions for weekly summaries (copied from June 01, 2025, 03:49 AM PST)
  const renderWeekSummaries = () => {
    const rowHeight = 96 + 10; // h-24 + mt-1 + m-[2px]
    const dayHeaderHeight = 41; // Height of day headers (Sun, Mon, etc.), based on py-2 and text-[0.9rem]
    const calendarTopPadding = 16; // Calendar's pt-4 = 16px

    // Summary header, aligned with day headers
    const summaryHeader = (
      <div
        key="summary-header"
        className="text-muted-foreground font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50 rounded-md"
        style={{
          position: "absolute",
          top: `${calendarTopPadding}px`, // Align with day headers (pt-4)
          left: "4px", // Align with first column (2px margin + 2px for symmetry)
          width: "96px", // w-24, matches day cells
        }}
      >
        Weekly
      </div>
    );

    // Weekly summary cells, sized like day cells
    const summaryCards = weekSummaries.map((summary, index) => {
      const topPosition =
        calendarTopPadding +
        dayHeaderHeight +
        index * rowHeight +
        6; // Adjust for mt-1 and centering

      return (
        <div
          key={`week-${index}`}
          className="text-sm absolute border border-gray-200 rounded-md m-[2px] w-24 h-24 flex flex-col items-center justify-center bg-gray-50"
          style={{
            top: `${topPosition}px`,
            left: "4px", // Align with first column (2px margin + 2px for symmetry)
            width: "96px", // w-24, matches day cells
            height: "96px", // h-24, matches day cells
          }}
        >
          <p className="font-semibold">Week {index + 1}</p>
          <p className={summary.totalPnl >= 0 ? "text-green-600" : "text-red-600"}>
            ${summary.totalPnl.toFixed(2)}
          </p>
          <p>{summary.days} days</p>
        </div>
      );
    });

    return [summaryHeader, ...summaryCards];
  };

  return (
    <div className="flex items-center justify-center min-w-[48rem] pb-4 pt-0">
      <Card className="max-w-3xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Daily Calendar Return</CardTitle>
          <CardDescription>
            Displays daily trade performance and weekly summaries for the selected month.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold">
              {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full relative">
            <div className="flex-1">
              <Calendar
                mode="single"
                month={currentMonth}
                onMonthChange={(newMonth) => {
                  setCurrentMonth(newMonth);
                }}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                components={{
                  DayContent: (props: DayContentProps) => {
                    const dateKey = format(props.date, "yyyy-MM-dd");
                    const trade = tradeDataMap.get(dateKey);

                    return (
                      <div className="text-center h-full p-1 flex flex-col justify-start">
                        <div className="text-xs font-medium">{props.date.getDate()}</div>
                        {trade ? (
                          <div className="text-[9px] space-y-0.5 mt-0.5 flex-1 overflow-hidden">
                            <div
                              className={trade.totalPnl >= 0 ? "text-green-600" : "text-red-600"}
                            >
                              ${trade.totalPnl.toFixed(2)}
                            </div>
                            <div className="truncate">
                              Real: ${trade.realizedPnl.toFixed(2)}
                            </div>
                            <div className="truncate">
                              Unr: ${trade.unrealizedPnl.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[9px] text-gray-400 mt-0.5 flex-1">
                            No trades
                          </div>
                        )}
                      </div>
                    );
                  },
                  Head: () => (
                    <thead>
                      <tr className="flex w-full">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <th
                            key={day}
                            className="text-muted-foreground font-medium text-[0.9rem] py-2 text-center border border-gray-200 bg-gray-50 m-[2px] flex-1 rounded-md"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  ),
                }}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "hidden",
                  nav: "hidden",
                  head_row: "flex w-full mb-2",
                  head_cell:
                    "text-muted-foreground font-medium text-[0.9rem] py-2 text-center flex-1",
                  row: "flex w-full mt-1",
                  cell:
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 aspect-square border border-gray-200 m-[2px] rounded-md",
                  day: cn(
                    "h-24 w-full p-0 font-normal aria-selected:opacity-100 rounded-md",
                    "flex items-center justify-center"
                  ),
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                }}
                className="pt-4 pb-0 pr-0 pl-0"
              />
            </div>
            <div className="w-[104px] relative">{renderWeekSummaries()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}