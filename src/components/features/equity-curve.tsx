"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { format, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { mockIbkrDailyPnl } from "@/mock-data/daily-pnl";

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
    color: "#4CAF50", // Green matching StatsTable and ProfitDistributionChart
  },
  negativePnl: {
    label: "Negative P&L",
    color: "#FF5252", // Red matching StatsTable and ProfitDistributionChart
  },
} satisfies ChartConfig;

export function EquityCurve({ accountNo, phAccountNo, dateRange, market }: EquityCurveProps) {
  const today = new Date();
  const [defaultDateRange] = useState<DateRange>({
    from: startOfYear(today), // January 1, 2025
    to: today, // May 22, 2025
  });

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
      default:
        return "USD";
    }
  };

  // Select account based on market
  const selectedAccount = market === "PH" && phAccountNo ? phAccountNo : accountNo;

  // Filter mockDailyPnl by selected account
  const accountData = mockIbkrDailyPnl.find((data) => data.account === selectedAccount) || {
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

  // Calculate total P&L sum (not used in description but kept for potential future use)
  const totalPnlSum = filteredDailyPnl.reduce((sum, entry) => sum + entry.totalPnl, 0);

  if (filteredDailyPnl.length === 0) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full pb-0 mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold">Equity Curve</h1>
            <CardDescription>No equity data available for account: {selectedAccount}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chartData = filteredDailyPnl
    .map((entry) => ({
      date: new Date(entry.date),
      totalPnl: entry.totalPnl,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="flex items-center justify-center min-w-[48rem] pb-4 pt-4">
      <Card className="max-w-3xl w-full">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <h1 className="text-2xl font-bold">Equity Curve</h1>
            </div>
          </div>
          <CardDescription className="pb-0 pt-0">
            {`${marketNames[market] || "Global"} Market from ${format(
              effectiveDateRange.from!,
              "MMMM d, yyyy"
            )} to ${format(
              effectiveDateRange.to!,
              "MMMM d, yyyy"
            )}. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
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
              <defs>
                <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5252" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF5252" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                tickFormatter={(date) => format(date, "MMM d")}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                fontSize={12}
                domain={[-2000, 2500]}
                ticks={[-2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000, 2500]}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="totalPnl"
                name="Total P&L"
                type="linear"
                stroke="#4CAF50"
                fill="url(#fillPositive)"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}