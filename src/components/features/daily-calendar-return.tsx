"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import Loading from "../ui/loading";

// Define interfaces
interface DailyPnl {
  date: string;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
}

interface AccountPnl {
  account: string;
  dailyPnl: DailyPnl[];
}

interface TradeDay {
  date: Date;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  hasTrades: number;
}

interface WeekSummary {
  totalPnl: number;
  days: number;
}

interface DayContentProps {
  date: Date;
  displayMonth: Date;
  activeModifiers: Record<string, boolean>;
}

interface TradeCalendarProps {
  accountNo: string;
  phAccountNo: string;
  market: string;
}

export function TradeCalendar({
  accountNo,
  phAccountNo,
  market,
}: TradeCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 5, 1));
  const [tradeData, setTradeData] = React.useState<TradeDay[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDailyPnl = async () => {
    setLoading(true);
    setError(null);
    try {
      const dateStart = format(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
        "yyyy-MM-dd"
      );
      const dateEnd = format(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
        "yyyy-MM-dd"
      );

      const requestBody = {
        market,
        account: market === "PH" ? phAccountNo : accountNo,
        dateStart,
        dateEnd,
      };

      const response = await fetch("/api/dailypnl/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch daily pnl summary (Status: ${response.status})`
        );
      }

      const data: AccountPnl[] = await response.json();

      const dateMap = new Map<string, TradeDay>();
      data.forEach(({ dailyPnl }) => {
        dailyPnl.forEach(({ date, totalPnl, realizedPnl, unrealizedPnl }) => {
          const parsedDate = new Date(date); // ✅ Changed from parse()
          const dateKey = format(parsedDate, "yyyy-MM-dd");
          const existing = dateMap.get(dateKey) || {
            date: parsedDate,
            totalPnl: 0,
            realizedPnl: 0,
            unrealizedPnl: 0,
            hasTrades: 0,
          };
          existing.totalPnl += totalPnl;
          existing.realizedPnl += realizedPnl;
          existing.unrealizedPnl += unrealizedPnl;
          existing.hasTrades = existing.totalPnl !== 0 ? 1 : 0;
          dateMap.set(dateKey, existing);
        });
      });

      const aggregatedData = Array.from(dateMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      setTradeData(aggregatedData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDailyPnl();
  }, [currentMonth, accountNo, phAccountNo, market]);

  const tradeDataMap = React.useMemo(() => {
    const map = new Map<string, TradeDay>();
    tradeData.forEach((trade) => {
      if (trade.date instanceof Date && !isNaN(trade.date.getTime())) {
        const key = format(trade.date, "yyyy-MM-dd");
        map.set(key, trade);
      }
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

  const { weekSummaries, numWeeks } = React.useMemo(() => {
    const weeks: WeekSummary[] = [];
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

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
  }, [currentMonth, tradeData]);

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

  const renderWeekSummaries = () => {
    const rowHeight = 106;
    const dayHeaderHeight = 38;
    const calendarTopPadding = 14;

    const summaryHeader = (
      <div
        key="summary-header"
        className="text-muted-foreground font-medium text-[0.9rem] py-2 text-center border border-gray-200 m-1 bg-gray-50 rounded-md"
        style={{
          position: "absolute",
          top: `${calendarTopPadding}px`,
          left: "4px",
          width: "96px",
        }}
      >
        Weekly
      </div>
    );

    const summaryCards = weekSummaries.map((summary, index) => {
      const topPosition = calendarTopPadding + dayHeaderHeight + index * rowHeight + 8;
      return (
        <div
          key={`week-${index}`}
          className="text-sm absolute border border-gray-200 rounded-md m-1 w-24 h-24 flex flex-col items-center justify-center bg-gray-50"
          style={{
            top: `${topPosition}px`,
            left: "4px",
            width: "96px",
            height: "98px",
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

  if (loading) {
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
            <Loading variant="calendar" className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
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
