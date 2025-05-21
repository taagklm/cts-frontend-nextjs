"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define DayContentProps manually
interface DayContentProps {
  date: Date;
  displayMonth?: Date;
  activeModifiers?: Record<string, boolean>;
  [key: string]: any;
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
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 4, 1)); // May 2025 (month is 0-indexed, 4 = May)

  // Sample trade data for May 2025
  const [tradeData] = React.useState<TradeDay[]>([
    { date: new Date(2025, 4, 5), profit: 600, trades: 1, rMultiple: 2.0, percentage: 100 },
    { date: new Date(2025, 4, 13), profit: -638, trades: 2, rMultiple: -3.08, percentage: 0 },
    { date: new Date(2025, 4, 10), profit: 100, trades: 1, rMultiple: 0.0, percentage: 100 },
    { date: new Date(2025, 4, 15), profit: 225, trades: 3, rMultiple: 1.14, percentage: 33.33 },
    { date: new Date(2025, 4, 16), profit: -37.5, trades: 2, rMultiple: -0.83, percentage: 50 },
  ]);

  const getWeekSummary = (weekStart: Date, weekEnd: Date): WeekSummary => {
    const weekTrades = tradeData.filter(
      (trade) => trade.date >= weekStart && trade.date <= weekEnd
    );
    const profit = weekTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const days = weekTrades.length;
    return { profit, days };
  };

  // Calculate week summaries for the current month, limiting to weeks with days in the current month
  const { weekSummaries, numWeeks } = React.useMemo(() => {
    const weeks: WeekSummary[] = [];
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startOfFirstWeek = new Date(firstDayOfMonth);
    startOfFirstWeek.setDate(firstDayOfMonth.getDate() - firstDayOfWeek);

    // Calculate the number of weeks needed
    const totalDaysInGrid = lastDayOfMonth.getDate() + firstDayOfWeek;
    const numWeeks = Math.ceil(totalDaysInGrid / 7);

    // Generate summaries only for weeks that include days from the current month
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
    return weekSummaries.map((summary, index) => {
      // Calculate the vertical position (top) for each week summary, centering it in the row
      const rowHeight = 96 + 9; // h-24 (96px) + mt-1 (4px) + m-[2px] (4px vertically)
      const headerHeight = 65; // Approximate height of the header row (head_row) + mb-2
      const summaryHeight = 96; // Match the height of the day cells (h-24 = 96px)
      const topPosition =
        headerHeight + index * rowHeight + (rowHeight - summaryHeight) / 2;

      return (
        <div
          key={index}
          className="text-sm absolute border border-gray-200 rounded-md m-[2px] w-24 h-24 flex flex-col items-center justify-center bg-gray-50"
          style={{ top: `${topPosition}px`, right: "0" }}
        >
          <p className="font-semibold">Week {index + 1}</p>
          <p className={summary.profit >= 0 ? "text-green-600" : "text-red-600"}>
            ${summary.profit.toFixed(2)}
          </p>
          <p>{summary.days} days</p>
        </div>
      );
    });
  };

  return (
    <Card className="max-w-6xl w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Daily Calendar Return</CardTitle>
        <CardDescription>
          Displays daily trade performance and weekly summaries for the selected month.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4 px-6">
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
                  const trade = tradeData.find(
                    (t) => t.date.toDateString() === props.date.toDateString()
                  );
                  return (
                    <div className="text-center h-full p-2">
                      <div className="text-xs font-medium">{props.date.getDate()}</div>
                      {trade && (
                        <div className="text-[10px] space-y-0.5 mt-1 overflow-hidden">
                          <div className={trade.profit >= 0 ? "text-green-600" : "text-red-600"}>
                            ${trade.profit.toFixed(2)}
                          </div>
                          <div className="truncate">
                            {trade.trades} {trade.trades === 1 ? "trade" : "trades"}
                          </div>
                          <div className="truncate">
                            {trade.rMultiple.toFixed(2)}R, <br />
                            {trade.percentage.toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
                Head: () => (
                  <div className="flex mb-2">
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Sun
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Mon
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Tue
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Wed
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Thu
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Fri
                    </div>
                    <div className="text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-[2px] bg-gray-50">
                      Sat
                    </div>
                  </div>
                ),
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "hidden", // Hide the child "MAY 2025" label
                nav: "hidden", // Hide the child month picker
                head_row: "flex mb-2",
                head_cell:
                  "text-muted-foreground rounded-md w-full font-medium text-[0.9rem] py-2 text-center",
                row: "flex w-full mt-1",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full aspect-square border border-gray-200 rounded-md m-[2px]",
                day: cn(
                  "h-24 w-full p-0 font-normal aria-selected:opacity-100 rounded-md",
                  "flex items-center justify-center"
                ),
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_hidden: "invisible",
              }}
              className="pr-4 pl-0 pb-0"
            />
          </div>
          <div className="w-24 pb-0">
            {renderWeekSummaries()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}