"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
} from "recharts";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "../../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "../../ui/chart";
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

interface ChartDataPoint {
  date: Date;
  totalPnl: number;
  cumulativePnl: number;
}

interface ChartLineSegment {
  data: ChartDataPoint[];
  isPositive: boolean;
}

const chartConfig = {
  cumulativePnl: {
    label: "Cumulative P&L",
    color: "#4CAF50",
  },
} satisfies ChartConfig;

const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const dotColor = dataPoint.cumulativePnl < 0 ? "#FF5252" : "#4CAF50";
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex items-center">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          ></span>
          <span className="text-sm font-medium">
            {format(dataPoint.date, "MMM d, yyyy")}: {dataPoint.cumulativePnl.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomActiveDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = payload.cumulativePnl < 0 ? "#FF5252" : "#4CAF50";

  return (
    <circle cx={cx} cy={cy} r={5} stroke="white" strokeWidth={2} fill={color} />
  );
};

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

      const response = await fetch("/api/dailypnl/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(errorData.error || `Failed to fetch daily PnL (Status: ${response.status})`);
      }

      const data: AccountPnl[] = await response.json();
      if (!data.length) {
        setError(`No data found for account ${selectedAccount}`);
        setAccountData([]);
        return;
      }

      setAccountData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.from && dateRange.to && selectedAccount) {
      fetchDailyPnl();
    } else {
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
                onExportReport={() => {}}
                onExportData={() => {}}
                disabled
              />
            </div>
            <CardDescription>
              Loading equity data for account: {selectedAccount}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                onExportReport={() => {}}
                onExportData={() => {}}
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

  const chartData: ChartDataPoint[] = accountData
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
        cumulativePnl,
      };
    });

  const lineSegments: ChartLineSegment[] = [];
  let currentSegment: ChartDataPoint[] = [];
  let lastSign: number | null = null;

  chartData.forEach((point, i) => {
    const currentPnl = point.cumulativePnl;
    const currentSign = Math.sign(currentPnl);

    if (i === 0) {
      currentSegment.push(point);
      lastSign = currentSign;
      return;
    }

    const prevPoint = chartData[i - 1];
    const prevPnl = prevPoint.cumulativePnl;

    if ((prevPnl < 0 && currentPnl >= 0) || (prevPnl >= 0 && currentPnl < 0)) {
      const t = -prevPnl / (currentPnl - prevPnl);
      const crossingTime = prevPoint.date.getTime() + t * (point.date.getTime() - prevPoint.date.getTime());
      const crossingPoint: ChartDataPoint = {
        date: new Date(crossingTime),
        totalPnl: 0,
        cumulativePnl: 0,
      };
      currentSegment.push(crossingPoint);
      lineSegments.push({ data: [...currentSegment], isPositive: prevPnl >= 0 });
      currentSegment = [crossingPoint, point];
      lastSign = currentSign;
    } else {
      currentSegment.push(point);
    }
  });

  if (currentSegment.length > 0) {
    lineSegments.push({ data: currentSegment, isPositive: lastSign! >= 0 });
  }

  const minPnl = Math.min(...chartData.map((d) => d.cumulativePnl));
  const maxPnl = Math.max(...chartData.map((d) => d.cumulativePnl));
  const offset = maxPnl <= 0 ? 0 : minPnl >= 0 ? 1 : maxPnl / (maxPnl - minPnl);

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
              onExportReport={() => {}}
              onExportData={() => {}}
            />
          </div>
          <CardDescription>
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
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset={offset} stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset={offset} stopColor="#FF5252" stopOpacity={0.8} />
                  <stop offset={1} stopColor="#FF5252" stopOpacity={0.8} />
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
                domain={[minPnl - 500, maxPnl + 500]}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
              <ReferenceLine y={0} stroke="black" strokeWidth={1} />
             <Area
  dataKey="cumulativePnl"
  name="Cumulative P&L"
  type="monotone"
  stroke="none"
  fill="url(#fillCumulative)"
  fillOpacity={0.3}
  dot={false}
  activeDot={false}  // ← This line disables the green hover dot
  isAnimationActive={false}
/>
              {lineSegments.map((segment, index) => (
  <Line
    key={`line-${index}`}
    data={segment.data}
    dataKey="cumulativePnl"
    name="Cumulative P&L"
    type="monotone"
    stroke={segment.isPositive ? "#4CAF50" : "#FF5252"}
    strokeWidth={3}
    dot={false}
    activeDot={CustomActiveDot} // ← this line changed
    connectNulls={false}
    isAnimationActive={false}
  />
))}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
