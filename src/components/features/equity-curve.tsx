"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Button } from "../ui/button";
import { format, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { mockDailyPnl } from "@/mock-data/daily-pnl";

interface DailyPnlEntry {
  date: string;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
}

interface DailyPnlData {
  account: string;
  currency: string;
  dailyPnl: DailyPnlEntry[];
}

interface EquityCurveProps {
  accountNo: string;
  phAccountNo: string;
  dateRange?: DateRange;
  market: string;
}

const chartConfig = {
  totalPnl: {
    label: "Total P&L",
    color: "#2dd4bf",
  },
  realizedPnl: {
    label: "Realized P&L",
    color: "#3b82f6",
  },
  unrealizedPnl: {
    label: "Unrealized P&L",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export function EquityCurve({ accountNo, phAccountNo, dateRange, market }: EquityCurveProps) {
  const today = new Date();
  const [defaultDateRange] = useState<DateRange>({
    from: startOfYear(today), // January 1, 2025
    to: today, // May 19, 2025
  });
  const [showTotalPnl, setShowTotalPnl] = useState(true);
  const [showRealizedPnl, setShowRealizedPnl] = useState(true);
  const [showUnrealizedPnl, setShowUnrealizedPnl] = useState(true);

  const effectiveDateRange = dateRange || defaultDateRange;

  const marketNames: { [key: string]: string } = {
    IB: "Global",
    US: "United States",
    HK: "Hong Kong",
    JP: "Japan",
    PH: "Philippine",
  };

  const getCurrency = () => {
    switch (market) {
      case "PH":
        return "PHP";
      case "HK":
        return "JPY";
      case "US":
      case "IB":
      default:
        return "USD";
    }
  };

  // Select account based on market
  const selectedAccount = market === "PH" && phAccountNo ? phAccountNo : accountNo;

  // Filter mockDailyPnl by selected account
  const accountData = mockDailyPnl.find((data) => data.account === selectedAccount) || {
    account: selectedAccount,
    currency: getCurrency(),
    dailyPnl: [],
  };

  // Filter by date range
  const filteredDailyPnl = effectiveDateRange.from && effectiveDateRange.to
    ? accountData.dailyPnl.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= effectiveDateRange.from! && entryDate <= effectiveDateRange.to!;
      })
    : accountData.dailyPnl;

  if (filteredDailyPnl.length === 0) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full pb-0 mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold">Equity Curve</h1>
            <CardDescription className="pb-2">No equity data available for account: {selectedAccount}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chartData = filteredDailyPnl
    .map((entry) => ({
      date: new Date(entry.date),
      totalPnl: entry.totalPnl,
      realizedPnl: entry.realizedPnl,
      unrealizedPnl: entry.unrealizedPnl,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex items-center justify-center min-w-[48rem] pb-6">
      <Card className="max-w-3xl w-full">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <h1 className="text-2xl font-bold">Equity Curve</h1>
            </div>
          </div>
          <CardDescription className="pb-0 pt-0">
            {`${marketNames[market] || "Global"} Market from ${format(effectiveDateRange.from!, "MMMM d, yyyy")} to ${format(effectiveDateRange.to!, "MMMM d, yyyy")}. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
          <div className="flex gap-2 pt-2 pb-0">
            <Button
              variant={showTotalPnl ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTotalPnl(!showTotalPnl)}
              style={{ backgroundColor: showTotalPnl ? "#2dd4bf" : undefined }}
            >
              Total P&L
            </Button>
            <Button
              variant={showRealizedPnl ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRealizedPnl(!showRealizedPnl)}
              style={{ backgroundColor: showRealizedPnl ? "#3b82f6" : undefined }}
            >
              Realized P&L
            </Button>
            <Button
              variant={showUnrealizedPnl ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnrealizedPnl(!showUnrealizedPnl)}
              style={{ backgroundColor: showUnrealizedPnl ? "#f59e0b" : undefined }}
            >
              Unrealized P&L
            </Button>
          </div>
        </CardHeader>
        <CardContent className="rounded-lg border bg-card text-card-foreground mr-6 ml-6 mt-0 mb-0 shadow-none">
          <ChartContainer config={chartConfig}>
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(date) => format(date, "MMM d")}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[-2000, 2500]}
                ticks={[-2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000, 2500]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              {showTotalPnl && (
                <Area
                  key="totalPnl"
                  dataKey="totalPnl"
                  name="Total P&L"
                  type="linear"
                  stroke="#2dd4bf"
                  fill="#2dd4bf"
                  fillOpacity={0.2}
                  stackId="1"
                  connectNulls
                  isAnimationActive={false}
                />
              )}
              {showRealizedPnl && (
                <Area
                  key="realizedPnl"
                  dataKey="realizedPnl"
                  name="Realized P&L"
                  type="linear"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  stackId="1"
                  connectNulls
                  isAnimationActive={false}
                />
              )}
              {showUnrealizedPnl && (
                <Area
                  key="unrealizedPnl"
                  dataKey="unrealizedPnl"
                  name="Unrealized P&L"
                  type="linear"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  stackId="1"
                  connectNulls
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}