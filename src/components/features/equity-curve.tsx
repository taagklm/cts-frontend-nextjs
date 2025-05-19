"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { format } from "date-fns";
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
  dateRange?: DateRange;
  market: string;
}

const chartConfig = {
  equityPositive: {
    label: "Equity (Positive)",
    color: "#2dd4bf",
  },
  equityNegative: {
    label: "Equity (Negative)",
    color: "#ef4444",
  },
  equityLine: {
    label: "Equity",
    color: "#2dd4bf",
  },
} satisfies ChartConfig;

export function EquityCurve({ accountNo, dateRange, market }: EquityCurveProps) {
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
        return "HKD";
      case "JP":
        return "JPY";
      case "US":
      case "IB":
      default:
        return "USD";
    }
  };

  // Filter mockDailyPnl by accountNo
  const accountData = mockDailyPnl.find((data) => data.account === accountNo) || {
    account: accountNo,
    currency: "USD",
    dailyPnl: [],
  };

  // Filter by dateRange if provided
  const filteredDailyPnl = dateRange?.from && dateRange?.to
    ? accountData.dailyPnl.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
      })
    : accountData.dailyPnl;

  if (filteredDailyPnl.length === 0) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <h1 className="text-2xl font-bold">Equity Curve</h1>
            <CardDescription>No equity data available for account: {accountNo}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chartData = filteredDailyPnl
    .map((entry) => ({
      date: new Date(entry.date),
      equityPositive: entry.totalPnl > 0 ? entry.totalPnl : 0,
      equityNegative: entry.totalPnl < 0 ? entry.totalPnl : 0,
      equity: entry.totalPnl,
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
          <CardDescription className="pt-0">
            {`${marketNames[market] || "Global"} Market from ${format(new Date(filteredDailyPnl[0].date), "MMMM d, yyyy")} to ${format(new Date(filteredDailyPnl[filteredDailyPnl.length - 1].date), "MMMM d, yyyy")}. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border bg-card text-card-foreground shadow-sm mr-6 ml-6 shadow-none pb-1">
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
              <Area
                key="positive-fill"
                dataKey="equityPositive"
                name="equityPositive"
                type="linear"
                stroke="none"
                fill="#2dd4bf"
                fillOpacity={0.2}
                stackId="1"
                connectNulls
                isAnimationActive={false}
              />
              <Area
                key="negative-fill"
                dataKey="equityNegative"
                name="equityNegative"
                type="linear"
                stroke="none"
                fill="#ef4444"
                fillOpacity={0.2}
                stackId="1"
                connectNulls
                isAnimationActive={false}
              />
              <Area
                key="equity-line"
                dataKey="equity"
                name="equityLine"
                type="linear"
                stroke="#2dd4bf"
                strokeWidth={2}
                fill="none"
                activeDot={{ r: 8 }}
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