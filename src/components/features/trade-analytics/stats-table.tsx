"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading"; // Assuming you have a Loading component

// Define type matching TradeAnalyticsDto
interface TradeAnalyticsData {
  aum?: number | null;
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
  churn?: number | null;
}

// Column mappings
const colMappings: Record<string, keyof TradeAnalyticsData | 'winsOverTrades'> = {
  "AUM": "aum",
  "Return (USD)": "returnUsd",
  "Return (PHP)": "returnPhp",
  "Return (%)": "returnPercentage",
  "Realized Return (USD)": "realizedPnlUsd",
  "Realized Return (PHP)": "realizedPnlPhp",
  "Unrealized Return (USD)": "unrealizedPnlUsd",
  "Unrealized Return (PHP)": "unrealizedPnlPhp",
  "Hit (%)": "hit",
  "Edge (x)": "edge",
  "Winners / Trades": "winsOverTrades",
  "Total Gain": "totalProfit",
  "Total Loss": "totalLoss",
  "Avg. Gain": "averageProfit",
  "Avg. Loss": "averageLoss",
  "Churn (x)": "churn",
};

const colsNames = Object.keys(colMappings);

export function StatsTable({
  data,
  selectedMarket,
}: {
  data: TradeAnalyticsData;
  selectedMarket: string;
}) {
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [tableData, setTableData] = useState<TradeAnalyticsData | null>(null); // Store data

  const isPHMarket = selectedMarket === "PH";

  // Simulate async data fetch (replace with actual API call)
  useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      setTableData(data);
      setIsLoading(false);
    }, 1000);
  }, [data, selectedMarket]);

  // Debug loading state and data
  useEffect(() => {
    console.log("StatsTable loading state:", isLoading);
    console.log("StatsTable data:", tableData);
  }, [isLoading, tableData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal pr-3 pb-3">
        <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
          <CardContent className="p-0 min-h-[400px]">
            <div className="px-2">
              <Loading variant="table" rows={12} className="w-full" /> {/* 12 rows for ~384px height */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal pr-3 pb-3">
        <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
          <CardContent className="p-0 min-h-[400px]">
            <div className="px-2">
              <div className="text-red-600">No data available</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal pr-3 pb-3">
      <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
        <CardContent className="p-0">
          <div className="px-2">
            <Table className="min-w-0 w-full">
              <TableBody>
                {colsNames
                  .filter((colName) => (isPHMarket ? !colName.includes("(USD)") : !colName.includes("(PHP)")))
                  .map((colName, index) => {
                    const dataKey = colMappings[colName];
                    let value: number | string | null;

                    // Handle the computed Winners / Trades field
                    if (dataKey === "winsOverTrades") {
                      value = `${tableData.numberOfWins} / ${tableData.numberOfTrades}`;
                    } else {
                      value = dataKey && tableData[dataKey] !== undefined ? tableData[dataKey] : "N/A";
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="text-sm font-normal text-left px-1 py-1">
                          {colName}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-normal text-right px-1 py-1 ${shouldColorCode(colName, value)}`}
                        >
                          {formatValue(value, colName)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Function to determine if and how to color-code values
const shouldColorCode = (colName: string, value: number | string | null) => {
  if (typeof value !== "number" || value === null) return "";

  // No color coding for these fields (default text color applies)
  const noColorFields = [
    "AUM",
    "Winners / Trades",
    "Hit (%)",
    "Edge (x)",
    "Churn (x)",
  ];
  if (noColorFields.includes(colName)) return "";

  // Neutral color for zero, otherwise green for positive, red for negative
  if (value === 0) return "";
  return value < 0 ? "text-[#FF5252]" : "text-[#4CAF50]";
};

// Function to format numbers
const formatValue = (value: number | string | null, colName: string) => {
  if (value === null || typeof value === "undefined") return "N/A";
  if (typeof value === "string") return value; // For Winners / Trades, return as is

  // Currency formatting for AUM
  if (colName === "AUM") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Percentage formatting for Return (%) and Hit (%)
  if (["Return (%)", "Hit (%)"].includes(colName)) {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return value > 0 && colName === "Return (%)" ? `+${formatted}%` : `${formatted}%`;
  }

  // Append 'x' for Edge Ratio and Churn
  if (["Edge (x)", "Churn (x)"].includes(colName)) {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}x`;
  }

  // Default formatting for other numeric values with + for positive
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return value > 0 ? `+${formatted}` : formatted;
};