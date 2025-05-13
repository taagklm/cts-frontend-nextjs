"use client";

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

interface TradeAnalyticsDto {
  numberOfTrades: number;
  returnUsd?: number | null;
  returnPhp?: number | null;
  returnPercentage?: number | null;
  realizedPnlUsd?: number | null;
  realizedPnlPhp?: number | null;
  unrealizedPnlUsd?: number | null;
  unrealizedPnlPhp?: number | null;
  hitRatio: number;
  edgeRatio: number;
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
    color: "hsl(var(--chart-1))", // Default color for negative or neutral ranges
  },
  positiveFrequency: {
    label: "Positive Frequency",
    color: "#4CAF50", // Green for positive ranges
  },
} satisfies ChartConfig;

// Format range for display
const formatRange = (start: number | null | undefined, end: number | null | undefined): string => {
  if (start == null) return end != null ? `<${end}%` : "N/A";
  if (end == null) return `>${start}%`;
  return `[${start} to ${end}%]`;
};

export function ProfitDistributionChart({ data }: { data: TradeAnalyticsDto }) {
  console.log("ProfitDistributionChart data:", data); // Debug input data
  console.log("ProfitDistribution array:", data.profitDistribution); // Debug profitDistribution

  // Transform profit distribution data for chart
  const chartData: ChartData[] = (data.profitDistribution || []).map((bracket) => {
    const isPositive = bracket.rangeStart != null && bracket.rangeStart >= 0;
    return {
      range: formatRange(bracket.rangeStart, bracket.rangeEnd),
      frequency: bracket.count,
      fill: isPositive ? chartConfig.positiveFrequency.color : chartConfig.frequency.color,
    };
  });

  console.log("Transformed chartData:", chartData); // Debug chartData

  // Handle empty or no data case
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="mb-3 max-w-3xl w-full overflow-visible shadow-none">
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <p className="text-gray-500">No profit distribution data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-3 max-w-3xl w-full overflow-visible shadow-none">
      <CardHeader>
        <CardTitle>Profit Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
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
            <Bar
              dataKey="frequency"
              fill="#8884d8" // Fallback color
            >
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