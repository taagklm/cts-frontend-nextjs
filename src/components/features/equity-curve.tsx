

"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { format, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { mockData } from "@/mock-data/daily-pnl";
import { EquityBurgerMenu } from "./equity-curve/equity-burger-menu";
import Loading from "../ui/loading";

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
  market: string;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
}

const chartConfig = {
  totalPnl: {
    label: "Total P&L",
    color: "#4CAF50",
  },
  negativePnl: {
    label: "Negative P&L",
    color: "#FF5252",
  },
} satisfies ChartConfig;

export function EquityCurve({
  accountNo,
  phAccountNo,
  market,
  dateRange: propDateRange,
  setDateRange: propSetDateRange,
}: EquityCurveProps) {
  const today = new Date();
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    from: startOfYear(today),
    to: today,
  });
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [accountData, setAccountData] = useState<DailyPnlData | null>(null); // Store data

  // Use propDateRange if valid, else localDateRange
  const dateRange = propDateRange?.from && propDateRange?.to ? propDateRange : localDateRange;
  const setDateRange = propSetDateRange || setLocalDateRange;

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

  const selectedAccount = market === "PH" && phAccountNo ? phAccountNo : accountNo;

  // Simulate async data fetch (replace with actual API call)
  useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      const fetchedData = mockData.find((data) => data.account === selectedAccount) || {
        account: selectedAccount,
        currency: getCurrency(),
        dailyPnl: [],
      };
      setAccountData(fetchedData);
      setIsLoading(false);
    }, 1000);
  }, [selectedAccount]);

  // Debug loading state and data
  useEffect(() => {
    console.log("EquityCurve loading state:", isLoading);
    console.log("EquityCurve accountData:", accountData);
  }, [isLoading, accountData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-w-[48rem] pb-4 pt-4">
        <Card className="max-w-3xl w-full">
          <CardHeader className="pb-0">
            <div className="grid grid-cols-5">
              <div className="col-span-4">
                <CardTitle className="text-2xl font-semibold">Equity Curve</CardTitle>
              </div>
              <EquityBurgerMenu
                dateRange={dateRange}
                setDateRange={setDateRange}
                onExportReport={() => console.log("Exporting Equity Curve Report as PDF")}
                onExportData={() => console.log("Exporting Equity Curve Data as CSV")}
                disabled // Disable menu during loading
              />
            </div>
            <CardDescription className="pb-0 pt-0">
              Loading equity data for account: {selectedAccount}
            </CardDescription>
          </CardHeader>
          <CardContent className="rounded-lg border bg-card text-card-foreground mr-6 ml-6 mt-0 mb-0 shadow-none">
            <Loading variant="table" rows={6} className="w-full" /> {/* 6 rows as placeholder */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accountData || accountData.dailyPnl.length === 0) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full pb-0 mb-6">
          <CardHeader>
            <div className="grid grid-cols-5">
              <div className="col-span-4">
                <CardTitle className="text-2xl font-semibold">Equity Curve</CardTitle>
              </div>
              <EquityBurgerMenu
                dateRange={dateRange}
                setDateRange={setDateRange}
                onExportReport={() => console.log("Exporting Equity Curve Report as PDF")}
                onExportData={() => console.log("Exporting Equity Curve Data as CSV")}
              />
            </div>
            <CardDescription>
              No equity data available for account: {selectedAccount}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredDailyPnl = dateRange.from && dateRange.to
    ? accountData.dailyPnl.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
      })
    : accountData.dailyPnl;

  if (filteredDailyPnl.length === 0) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full pb-0 mb-6">
          <CardHeader>
            <div className="grid grid-cols-5">
              <div className="col-span-4">
                <CardTitle className="text-2xl font-semibold">Equity Curve</CardTitle>
              </div>
              <EquityBurgerMenu
                dateRange={dateRange}
                setDateRange={setDateRange}
                onExportReport={() => console.log("Exporting Equity Curve Report as PDF")}
                onExportData={() => console.log("Exporting Equity Curve Data as CSV")}
              />
            </div>
            <CardDescription>
              No equity data available for account: {selectedAccount}
            </CardDescription>
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
              <CardTitle className="text-2xl font-semibold">Equity Curve</CardTitle>
            </div>
            <EquityBurgerMenu
              dateRange={dateRange}
              setDateRange={setDateRange}
              onExportReport={() => console.log("Exporting Equity Curve Report as PDF")}
              onExportData={() => console.log("Exporting Equity Curve Data as CSV")}
            />
          </div>
          <CardDescription className="pb-0 pt-0">
            {`${marketNames[market] || "Global"} Market from ${format(
              dateRange.from!,
              "MMMM d, yyyy"
            )} to ${format(dateRange.to!, "MMMM d, yyyy")}. The values displayed are in ${getCurrency()}.`}
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