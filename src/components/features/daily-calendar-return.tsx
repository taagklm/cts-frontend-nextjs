"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Define DayContentProps for react-day-picker v9.6.7
interface DayContentProps {
  date: Date;
  displayMonth: Date;
  activeModifiers: Record<string, boolean>;
}

// Sample trade data structure
interface TradeDay {
  date: Date;
  profit: number;
  trades: number;
  rMultiple: number;
  percentage: number;
}

interface WeekSummary {
  profit: number;
  days: number;
}

export function TradeCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 4, 1)); // May 2025

  // Sample trade data for May 2025
  const [tradeData] = React.useState<TradeDay[]>([
    { date: new Date(2025, 4, 5), profit: 600, trades: 1, rMultiple: 2.0, percentage: 100 },
    { date: new Date(2025, 4, 13), profit: -638, trades: 2, rMultiple: -3.08, percentage: 0 },
    { date: new Date(2025, 4, 10), profit: 100, trades: 1, rMultiple: 0.0, percentage: 100 },
    { date: new Date(2025, 4, 15), profit: 225, trades: 3, rMultiple: 1.14, percentage: 33.33 },
    { date: new Date(2025, 4, 16), profit: -37.5, trades: 2, rMultiple: -0.83, percentage: 50 },
  ]);

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
    const profit = weekTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const days = weekTrades.length;
    return { profit, days };
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

      if (weekEnd >= firstDayOfMonth && weekStart <= lastDayOfMonth) {
        const summary = getWeekSummary(weekStart, weekEnd);
        weeks.push(summary);
      }
    }

    return { weekSummaries: weeks, numWeeks };
  }, [currentMonth]);

  const modifiers = {
    profitable: tradeData
      .filter((trade) => trade.profit >= 0)
      .map((trade) => trade.date),
    loss: tradeData
      .filter((trade) => trade.profit < 0)
      .map((trade) => trade.date),
  };

  const modifiersClassNames = {
    profitable: "bg-green-100 text-green-800",
    loss: "bg-red-100 text-red-800",
  };

  // Calculate positions for weekly summaries
  const renderWeekSummaries = () => {
    const rowHeight = 96 + 9; // h-24 + mt-1 + m-[2px]
    const dayHeaderHeight = 38; // Height of day headers (Sun, Mon, etc.), based on py-2 and text-[0.9rem]
    const summaryHeaderHeight = 38; // Match day header height
    const summaryHeight = 68; // Match day cell height (h-24)
    const calendarTopPadding = 16; // Calendar's pt-4 = 16px

    // Summary header, aligned with day headers
    const summaryHeader = (
      <div
        key="summary-header"
        className="text-muted-foreground rounded-md w-24 font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50"
        style={{
          position: "absolute",
          top: `${calendarTopPadding}px`, // Align with day headers (pt-4)
          left: "2px", // Center in w-28 column (112px - 96px = 16px, 16/2 = 8px, adjust for m-[2px])
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
        (rowHeight - summaryHeight) / 2;

      return (
        <div
          key={`week-${index}`}
          className="text-sm absolute border border-gray-200 rounded-md m-[2px] w-24 h-24 flex flex-col items-center justify-center bg-gray-50"
          style={{
            top: `${topPosition}px`,
            left: "2px", // Center in w-28 column
            width: "96px", // w-24, matches day cells
            height: "96px", // h-24, matches day cells
          }}
        >
          <p className="font-semibold">Week {index + 1}</p>
          <p className={summary.profit >= 0 ? "text-green-600" : "text-red-600"}>
            ${summary.profit.toFixed(2)}
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
                              className={trade.profit >= 0 ? "text-green-600" : "text-red-600"}
                            >
                              ${trade.profit.toFixed(2)}
                            </div>
                            <div className="truncate">
                              {trade.trades} {trade.trades === 1 ? "trade" : "trades"}
                            </div>
                            <div className="truncate">
                              {trade.rMultiple.toFixed(2)}R, {trade.percentage.toFixed(2)}%
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
                    <thead className="flex mb-2">
                      <tr className="flex w-full">
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Sun
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Mon
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Tue
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Wed
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Thu
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Fri
                        </th>
                        <th className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                          Sat
                        </th>
                      </tr>
                    </thead>
                  ),
                }}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "hidden",
                  nav: "hidden",
                  head_row: "flex mb-2",
                  head_cell:
                    "text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center",
                  row: "flex w-full mt-1",
                  cell:
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full aspect-square border border-gray-200 rounded-md m-[2px]",
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
            <div className="w-28 relative">{renderWeekSummaries()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}