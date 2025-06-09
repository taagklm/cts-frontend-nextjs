"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "../../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";
import { format, startOfYear } from "date-fns";
import { DateRange } from "react-day-picker";
import { EquityBurgerMenu } from "./equity-burger-menu";
import Loading from "@/components/ui/loading";

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

const chartConfig = {
  cumulativePnl: {
    label: "Cumulative P&L",
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
  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState<AccountPnl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dateRange = propDateRange?.from && propDateRange?.to ? propDateRange : localDateRange;
  const setDateRange = propSetDateRange || ((range: DateRange | undefined) =>
    setLocalDateRange(range || { from: startOfYear(new Date()), to: new Date() })
  );

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

  const fetchDailyPnl = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStart = format(dateRange.from!, "yyyy-MM-dd");
      const dateEnd = format(dateRange.to!, "yyyy-MM-dd");

      const requestBody = {
        market,
        account: selectedAccount,
        dateStart,
        dateEnd,
      };
      console.log("Fetching daily pnl summary for equity curve component:", requestBody);

      const response = await fetch("/api/dailypnl/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "Failed to parse error response" };
        }
        console.error("Fetch failed:", { status: response.status, errorData });
        throw new Error(
          errorData.error || `Failed to fetch daily PnL (Status: ${response.status})`
        );
      }

      const data: AccountPnl[] = await response.json();
      console.log("Received daily pnl summary for equity curve component:", selectedAccount, data);

      if (!data.length) {
        setError(`No data found for account ${selectedAccount}`);
        setAccountData([]);
        return;
      }

      setAccountData(data);
    } catch (err: any) {
      console.error("Fetch error:", {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.from && dateRange.to && selectedAccount) {
      console.log("Triggering fetch for account:", selectedAccount, {
        dateStart: format(dateRange.from, "yyyy-MM-dd"),
        dateEnd: format(dateRange.to, "yyyy-MM-dd"),
      });
      fetchDailyPnl();
    } else {
      console.warn("Skipping fetch due to missing data:", { selectedAccount, dateRange });
      setIsLoading(false);
      setError("Invalid account or date range");
    }
  }, [selectedAccount, market, dateRange]);

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
                disabled
              />
            </div>
            <CardDescription className="pb-0 pt-0">
              Loading equity data for account: {selectedAccount}
            </CardDescription>
          </CardHeader>
          <CardContent className="rounded-lg border bg-card text-card-foreground mr-6 ml-6 mt-0 mb-0 shadow-none">
            <Loading variant="table" rows={6} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !accountData.length) {
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
              {error || `No equity data available for account: ${selectedAccount}`}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chartData = accountData
    .flatMap(({ dailyPnl }) => dailyPnl)
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry, index, array) => {
      const cumulativePnl = array
        .slice(0, index + 1)
        .reduce((sum, current) => sum + current.totalPnl, 0);
      return {
        date: new Date(entry.date),
        totalPnl: entry.totalPnl,
        cumulativePnl, // Store the cumulative sum
      };
    });

  if (chartData.length === 0) {
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

  const minPnl = Math.min(...chartData.map((d) => d.cumulativePnl));
  const maxPnl = Math.max(...chartData.map((d) => d.cumulativePnl));
  const padding = 500; // Add padding for visibility
  const yDomain = [minPnl - padding, maxPnl + padding];

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
                domain={yDomain}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="cumulativePnl"
                name="Cumulative P&L"
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