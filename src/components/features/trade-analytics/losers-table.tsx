"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

interface TradeblockPerformance {
  dateEntered: string;
  symbol: string;
  totalReturn: number;
}

// Helper function to truncate symbol to 12 characters + "..." (total 15 characters)
const truncateSymbol = (symbol: string, maxLength: number = 12): string => {
  if (symbol.length <= maxLength) return symbol;
  const truncated = `${symbol.slice(0, maxLength)}...`;
  // console.log(`truncateSymbol: Input="${symbol}", Output="${truncated}"`);
  return truncated;
};

export function LosersTable({
  losers,
  selectedMarket,
}: {
  losers: TradeblockPerformance[];
  selectedMarket: string;
}) {
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [tableData, setTableData] = useState<TradeblockPerformance[]>([]); // Store data

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Simulate async data fetch (replace with actual API call)
  useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      setTableData(losers);
      setIsLoading(false);
    }, 1000);
  }, [losers, selectedMarket]);

  // // Debug loading state and alignment
  // useEffect(() => {
  //   console.log("LosersTable loading state:", isLoading);
  //   console.log("LosersTable data:", tableData);
  //   if (!isLoading) {
  //     const card = document.querySelector(".losers-card");
  //     if (card) {
  //       const rect = card.getBoundingClientRect();
  //       console.log("LosersTable card alignment:", {
  //         width: rect.width,
  //         left: rect.left,
  //         right: rect.right,
  //         parentWidth: card.parentElement?.offsetWidth,
  //       });
  //     }
  //   }
  // }, [isLoading, tableData]);

  // Limit to 5 losers, pad with empty rows if less than 5
  const displayedLosers = tableData.slice(0, 5);
  const rows = Array.from({ length: 5 }, (_, index) =>
    index < displayedLosers.length ? displayedLosers[index] : null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal max-w-3xl w-full mx-auto pb-3">
        <Card className="w-full mx-auto overflow-hidden pt-2 pb-2 shadow-none losers-card">
          <CardContent className="p-0 min-h-[200px]">
            <div className="px-2">
              <Loading variant="table" rows={5} className="w-full" /> {/* 7 rows for ~224px height */}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal max-w-3xl w-full mx-auto pb-3">
      <Card className="w-full mx-auto overflow-hidden pt-2 pb-2 shadow-none losers-card">
        <CardContent className="p-0">
          <div className="px-2">
            <Table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "36%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "24%" }} />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-sm font-normal text-center pt-0 px-1 h-5 align-middle"
                  >
                    TOP 5 LOSERS
                  </TableCell>
                </TableRow>
                {rows.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm font-normal text-left px-1 py-1 ">
                      {item
                        ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm font-normal text-center px-1 py-1">
                      {item ? truncateSymbol(item.symbol) : ""}
                    </TableCell>
                    <TableCell
                      className={`"text-sm font-normal text-right px-1 py-1 tabular-nums ${
                        item && item.totalReturn < 0 ? "text-[#FF5252]" : "text-[#4CAF50]"
                      }`}
                    >
                      {item
                        ? item.totalReturn > 0
                          ? `+${formatter.format(item.totalReturn)}`
                          : formatter.format(item.totalReturn)
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}