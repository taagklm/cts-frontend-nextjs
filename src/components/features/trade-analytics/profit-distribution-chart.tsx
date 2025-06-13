"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Loading from "@/components/ui/loading";

interface TradeAnalyticsDto {
  numberOfTrades: number;
  returnUsd?: number | null;
  returnPhp?: number | null;
  returnPercentage?: number | null;
  realizedPnlUsd?: number | null;
  realizedPnlPhp?: number | null;
  unrealizedPnlUsd?: number | null;
  unrealizedPnlPhp?: number | null;
  hit: number;
  edge: number;
  totalProfit: number;
  totalLoss: number;
  numberOfWins: number;
  numberOfLosses: number;
  averageProfit: number;
  averageLoss: number;
  topWinners: TradeblockPerformanceDto[];
  topLosers: TradeblockPerformanceDto[];
  profitDistribution: ProfitDistributionBracket[];
  aum?: number | null;
}

interface TradeblockPerformanceDto {
  dateEntered: string;
  symbol: string;
  totalReturn: number;
  realizedReturn: number;
  unrealizedReturn: number;
  currency: string;
}

interface ProfitDistributionBracket {
  rangeStart?: number | null;
  rangeEnd?: number | null;
  count: number;
}

// Define type for chart data
interface ChartData {
  range: string;
  frequency: number;
  fill: string;
}

const chartConfig = {
  frequency: {
    label: "Frequency",
    color: "#FF5252", // Red for negative ranges, matching StatsTable
  },
  positiveFrequency: {
    label: "Positive Frequency",
    color: "#4CAF50", // Green for positive ranges, matching StatsTable
  },
} satisfies ChartConfig;

// Format range for display
const formatRange = (start: number | null | undefined, end: number | null | undefined): string => {
  if (start == null) return end != null ? `<${end}%` : "N/A";
  if (end == null) return `>${start}%`;
  return `[${start} to ${end}%]`;
};

export function ProfitDistributionChart({ data }: { data: TradeAnalyticsDto }) {
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [chartData, setChartData] = useState<ChartData[]>([]); // Store transformed chart data

  // Simulate async data fetch (replace with actual API call)
  useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      const transformedData = (data?.profitDistribution ?? []).map((bracket) => {
        const isNegative = bracket.rangeStart != null && bracket.rangeStart < 0;
        return {
          range: formatRange(bracket.rangeStart, bracket.rangeEnd),
          frequency: bracket.count ?? 0,
          fill: isNegative ? chartConfig.frequency.color : chartConfig.positiveFrequency.color,
        };
      });
      setChartData(transformedData);
      setIsLoading(false);
    }, 1000);
  }, [data]);

  // // Debug loading state and data
  // useEffect(() => {
  //   console.log("ProfitDistributionChart loading state:", isLoading);
  //   console.log("ProfitDistributionChart data:", data);
  //   console.log("ProfitDistribution array:", data?.profitDistribution);
  //   console.log("Transformed chartData:", chartData);
  // }, [isLoading, data, chartData]);

  if (isLoading) {
    return (
      <Card className="mb-3 max-w-3xl w-full overflow-visible shadow-none">
        
        <CardContent className="p-0 min-h-[430px]">
          <div className="px-4">
            <Loading variant="table" rows={11} className="w-full h-[240px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty or no data case
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="mb-3 max-w-3xl w-full overflow-visible shadow-none">
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center min-h-[300px]">
          <p className="text-gray-500">No profit distribution data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-3 max-w-3xl w-full overflow-visible shadow-none pb-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Profit Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 10,
              bottom: 50,
              left: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="frequency" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="frequency"
                  fill={entry.fill}
                  radius={0}
                />
              ))}
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}