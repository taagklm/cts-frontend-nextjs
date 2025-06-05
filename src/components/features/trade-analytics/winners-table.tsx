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
  return `${symbol.slice(0, maxLength)}...`;
};

export function WinnersTable({
  winners,
  selectedMarket,
}: {
  winners: TradeblockPerformance[];
  selectedMarket: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<TradeblockPerformance[]>([]);

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTableData(winners);
      setIsLoading(false);
    }, 1000);
  }, [winners, selectedMarket]);

  useEffect(() => {
    console.log("WinnersTable loading state:", isLoading);
  }, [isLoading]);

  const displayedWinners = tableData.slice(0, 5);
  const rows = Array.from({ length: 5 }, (_, index) =>
    index < displayedWinners.length ? displayedWinners[index] : null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal pb-0">
        <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
          <CardContent className="p-0">
            <div className="px-2">
              <Loading variant="table" rows={6} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal pb-0">
      <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
        <CardContent className="p-0">
          <div className="px-2">
            <Table className="min-w-0 w-full">
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-sm font-normal text-center pt-0 px-1 h-5 align-middle"
                  >
                    TOP 5 WINNERS
                  </TableCell>
                </TableRow>
                {rows.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm font-normal text-left px-1 py-1">
                      {item
                        ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      className={`text-sm font-normal px-1 py-1 ${
                        item && item.symbol.length === 4 ? "text-center" : "text-left"
                      }`}
                    >
                      {item ? truncateSymbol(item.symbol) : ""}
                    </TableCell>
                    <TableCell
                      className={`text-sm font-normal text-right px-1 py-1 ${
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