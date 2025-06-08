"use client";

import { useState, useEffect, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "../../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";
import { format, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { EquityBurgerMenu } from "./equity-burger-menu";
import Loading from "../../ui/loading";

interface DailyPnlEntry {
  date: string;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
}

interface AccountPnl {
  account: string;
  dailyPnl: DailyPnlEntry[];
}

interface EquityCurveProps {
  accountNo: string;
  phAccountNo: string;
  market: string;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
}

const chartConfig: ChartConfig = {
  totalPnl: {
    label: "Total P&L",
    color: "#4CAF50",
  },
};

const marketNames: Record<string, string> = {
  IB: "Global",
  US: "United States",
  HK: "Hong Kong",
  JP: "Japan",
  PH: "Philippine",
};

export function EquityCurve({
  accountNo,
  phAccountNo,
  market,
  dateRange: propDateRange,
  setDateRange: propSetDateRange,
}: EquityCurveProps) {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>(
    propDateRange ?? { from: startOfYear(today), to: today }
  );
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: Date; totalPnl: number }[]>([]);

  const selectedAccount = market === "PH" && phAccountNo ? phAccountNo : accountNo;
  const currency = market === "PH" ? "PHP" : "USD";
  const setDateRangeCallback = propSetDateRange ?? setDateRange;

  const fetchDailyPnl = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/equity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market,
          account: selectedAccount,
          dateStart: format(dateRange.from, "yyyy-MM-dd"),
          dateEnd: format(dateRange.to, "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) {
        setChartData([]);
        return;
      }

      const data: AccountPnl[] = await response.json();
      const processedData = data
        .flatMap(({ dailyPnl }) => dailyPnl)
        .map((entry) => ({
          date: new Date(entry.date),
          totalPnl: entry.totalPnl,
        }))
        .filter((entry) => entry.date >= dateRange.from! && entry.date <= dateRange.to!)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setChartData(processedData);
    } catch (err) {
      console.error("Fetch error:", err);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, market, dateRange]);

  useEffect(() => {
    fetchDailyPnl();
  }, [fetchDailyPnl]);

  const renderCardHeader = () => (
    <CardHeader className="pb-0">
      <div className="grid grid-cols-5">
        <div className="col-span-4">
          <CardTitle className="text-2xl font-semibold">Equity Curve</CardTitle>
        </div>
        <EquityBurgerMenu
          dateRange={dateRange}
          setDateRange={setDateRangeCallback}
          onExportReport={() => console.log("Exporting Equity Curve Report as PDF")}
          onExportData={() => console.log("Exporting Equity Curve Data as CSV")}
          disabled={isLoading || !chartData.length}
        />
      </div>
      <CardDescription className="pb-0 pt-0">
        {isLoading
          ? `Loading equity data for account: ${selectedAccount}`
          : chartData.length
          ? `${marketNames[market] || "Global"} Market from ${format(
              dateRange.from!,
              "MMMM d, yyyy"
            )} to ${format(dateRange.to!, "MMMM d, yyyy")}. Values in ${currency}.`
          : `No equity data available for account: ${selectedAccount}`}
      </CardDescription>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-w-[48rem] py-4">
        <Card className="max-w-3xl w-full">
          {renderCardHeader()}
          <CardContent className="rounded-lg border bg-card text-card-foreground mx-6 my-0 shadow-none">
            <Loading variant="table" rows={6} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center min-w-[48rem] py-4">
        <Card className="max-w-3xl w-full pb-0">
          {renderCardHeader()}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-w-[48rem] py-4">
      <Card className="max-w-3xl w-full">
        {renderCardHeader()}
        <CardContent className="rounded-lg border bg-card text-card-foreground mx-6 my-0 shadow-none">
          <ChartContainer config={chartConfig}>
            <AreaChart
              data={chartData}
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2} />
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