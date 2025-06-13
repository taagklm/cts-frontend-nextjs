"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow, TableHeader } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

interface TradeAnalyticsData {
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

interface PrimarySetupStats {
  [setup: string]: TradeAnalyticsData;
}

const colMappings: Record<string, keyof TradeAnalyticsData> = {
  "Total # of Trades": "numberOfTrades",
  "Return (USD)": "returnUsd",
  "Return (PHP)": "returnPhp",
  "Return (%)": "returnPercentage",
  "Realized Return (USD)": "realizedPnlUsd",
  "Realized Return (PHP)": "realizedPnlPhp",
  "Unrealized Return (USD)": "unrealizedPnlUsd",
  "Unrealized Return (PHP)": "unrealizedPnlPhp",
  "Hit (%)": "hit",
  "Edge (x)": "edge",
  "Total Gain": "totalProfit",
  "Total Loss": "totalLoss",
  "# of Wins": "numberOfWins",
  "# of Loss": "numberOfLosses",
  "Ave. Gain": "averageProfit",
  "Ave. Loss": "averageLoss",
  "Churn (x)": "churn",
};

const colsNames = Object.keys(colMappings);

export function PrimarySetupStatsTable({
  data,
  selectedMarket,
}: {
  data: PrimarySetupStats;
  selectedMarket: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<PrimarySetupStats | null>(null);
  const isPHMarket = selectedMarket === "PH";

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTableData(data);
      setIsLoading(false);
    }, 1000);
  }, [data, selectedMarket]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal pb-3">
        <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
          <CardContent className="p-0 min-h-[420px]">
            <div className="px-2">
              <Loading variant="table" rows={12} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tableData || Object.keys(tableData).length === 0) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal pr-3 pb-3">
        <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
          <CardContent className="p-0 min-h-[300px]">
            <div className="px-2">
              <div className="text-red-600">No setup data available</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const setups = Object.keys(tableData);

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal pb-3">
      <Card className="max-w-3xl w-full overflow-visible shadow-none">
        <CardContent className="p-0 min-h-[300px]">
          <div className="px-2 overflow-auto">
            <Table className="w-full min-w-max border-collapse">
              <TableHeader>
                <TableRow>
                  <TableCell className="text-sm font-semibold text-left px-1 py-1 sticky left-0 bg-white z-10 w-40 border-r border-gray-200">
                    Strategies
                  </TableCell>
                  {setups.map((setup) => (
                    <TableCell key={setup} className="text-sm font-semibold text-right px-1 py-1">
                      {setup}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {colsNames
                  .filter((colName) => (isPHMarket ? !colName.includes("(USD)") : !colName.includes("(PHP)")))
                  .map((colName, index) => {
                    const dataKey = colMappings[colName];
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-sm font-normal text-left px-1 py-1 sticky left-0 bg-white  border-r border-gray-100">
                          {colName}
                        </TableCell>
                        {setups.map((setup) => {
                          const value = tableData[setup][dataKey] !== undefined ? tableData[setup][dataKey] : "N/A";
                          return (
                            <TableCell
                              key={`${setup}-${colName}`}
                              className={`text-sm font-normal text-right px-1 py-1 ${shouldColorCode(colName, value)}`}
                            >
                              {formatValue(value, colName)}
                            </TableCell>
                          );
                        })}
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

// Color logic
const shouldColorCode = (colName: string, value: number | string | null) => {
  if (typeof value !== "number" || value === null) return "";
  const noColorFields = [
    "Total # of Trades",
    "Hit (%)",
    "Edge (x)",
    "# of Wins",
    "# of Loss",
    "Churn (x)",
  ];
  if (noColorFields.includes(colName)) return "";
  if (value === 0) return "";
  return value < 0 ? "text-[#FF5252]" : "text-[#4CAF50]";
};

// Format logic
const formatValue = (value: number | string | null, colName: string) => {
  if (value === null || typeof value === "undefined") return "N/A";
  if (typeof value === "string") return value;

  if (["Total # of Trades", "# of Wins", "# of Loss"].includes(colName)) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (["Return (%)", "Hit (%)"].includes(colName)) {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return value > 0 && colName === "Return (%)" ? `+${formatted}%` : `${formatted}%`;
  }

  if (["Edge (x)", "Churn (x)"].includes(colName)) {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}x`;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return value > 0 ? `+${formatted}` : formatted;
};