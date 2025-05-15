"use client";

import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardDescription, CardContent } from "../ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";


interface EquityCurveProps {
  data: {
    totalProfit: number;
    totalLoss: number;
    topWinners: { dateEntered: string; totalReturn: number }[];
    topLosers: { dateEntered: string; totalReturn: number }[];
  };
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

export function EquityCurve({ data }: EquityCurveProps) {
  const [selectedMarket, setSelectedMarket] = useState("US");

  const marketNames: { [key: string]: string } = {
    global: "Global",
    US: "United States",
    HK: "Hong Kong",
    JP: "Japan",
    PH: "Philippine",
  };

  const getCurrency = () => {
    switch (selectedMarket) {
      case "PH":
        return "PHP";
      case "HK":
        return "HKD";
      case "JP":
        return "JPY";
      case "US":
      case "global":
      default:
        return "USD";
    }
  };

  // Generate chartData from data
  const chartData = [
    ...data.topWinners.map((w, i) => ({
      day: new Date(w.dateEntered).getDate(),
      equity: w.totalReturn,
    })),
    ...data.topLosers.map((l, i) => ({
      day: new Date(l.dateEntered).getDate(),
      equity: l.totalReturn,
    })),
  ].sort((a, b) => a.day - b.day); // Sort by day

  return (
    <div className="flex items-center justify-center min-w-[48rem]">
      <Card className="max-w-3xl w-full">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <h1 className="text-2xl font-bold">Equity Curve</h1>
            </div>
          </div>
          <CardDescription className="pb-2 pt-0">
            {`${marketNames[selectedMarket]} Market from April 23, 2025. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
          <Tabs
            value={selectedMarket}
            onValueChange={(val) => setSelectedMarket(val)}
            className="pt-1 pb-1"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="US">US</TabsTrigger>
              <TabsTrigger value="HK">HK</TabsTrigger>
              <TabsTrigger value="JP">JP</TabsTrigger>
              <TabsTrigger value="PH">PH</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="rounded-lg border bg-card text-card-foreground shadow-sm mr-6 ml-6 mt-3 mb-6">
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
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[-150, 200]}
                ticks={[-150, -100, -50, 0, 50, 100, 150, 200]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                key="positive-fill"
                dataKey="equity"
                name="equityPositive"
                type="linear"
                stroke="none"
                fill="#2dd4bf"
                fillOpacity={0.2}
                stackId="1"
                connectNulls
                isAnimationActive={false}
                baseValue={0}
              />
              <Area
                key="negative-fill"
                dataKey="equity"
                name="equityNegative"
                type="linear"
                stroke="none"
                fill="#ef4444"
                fillOpacity={0.2}
                stackId="1"
                connectNulls
                isAnimationActive={false}
                baseValue={0}
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