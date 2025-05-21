"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

interface Tradeblock {
  id: number;
  account: string;
  assetCategory: string;
  currency: string;
  symbol: string;
  longShort: string;
  unrealizedPnlUsd: number;
  unrealizedPnlPhp: number;
  totalOpenQuantity: number;
  totalRealizedPnlUsd: number;
  totalRealizedPnlPhp: number;
  dateEntered: string;
  dateExit: string;
  avgEntryPrice: number;
  avgExitPrice: number;
  totalValueTradedUsd: number;
  totalValueTradedPhp: number;
  holdingPeriod: number;
}

interface TradeblocksTableProps {
  initialData: Tradeblock[];
  initialError: string | null;
}

interface Column {
  key: keyof Tradeblock;
  label: string;
  width: string;
  align: "left" | "right";
  hideMobile?: boolean;
}

const columns: Column[] = [
  { key: "id", label: "ID", width: "w-8", align: "left" },
  { key: "account", label: "Acct", width: "w-10", align: "left", hideMobile: true },
  { key: "assetCategory", label: "Ast", width: "w-8", align: "left", hideMobile: true },
  { key: "currency", label: "Mkt", width: "w-8", align: "left" },
  { key: "symbol", label: "Sym", width: "w-8", align: "left" },
  { key: "longShort", label: "L/S", width: "w-8", align: "left" },
  { key: "unrealizedPnlUsd", label: "U.USD", width: "w-10", align: "right", hideMobile: true },
  { key: "unrealizedPnlPhp", label: "U.PHP", width: "w-10", align: "right", hideMobile: true },
  { key: "totalOpenQuantity", label: "Qty", width: "w-8", align: "right", hideMobile: true },
  { key: "totalRealizedPnlUsd", label: "P&L", width: "w-10", align: "right" },
  { key: "totalRealizedPnlPhp", label: "P.PHP", width: "w-10", align: "right", hideMobile: true },
  { key: "dateEntered", label: "Ent", width: "w-12", align: "left" },
  { key: "avgEntryPrice", label: "In", width: "w-8", align: "right" },
  { key: "dateExit", label: "Ext", width: "w-12", align: "left" },
  { key: "avgExitPrice", label: "Out", width: "w-8", align: "right" },
  { key: "totalValueTradedUsd", label: "Val", width: "w-12", align: "right" },
  { key: "totalValueTradedPhp", label: "V.PHP", width: "w-10", align: "right", hideMobile: true },
  { key: "holdingPeriod", label: "Hld", width: "w-10", align: "left", hideMobile: true },
];

const defaultVisibleColumns = [
  "id",
  "currency",
  "symbol",
  "longShort",
  "totalRealizedPnlUsd",
  "dateEntered",
  "dateExit",
  "totalValueTradedUsd",
];

const TradeblocksTable: React.FC<TradeblocksTableProps> = ({ initialData, initialError }) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tradeblocksData, setTradeblocksData] = useState<Tradeblock[]>(initialData);
  const [error, setError] = useState<string | null>(initialError);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(!!initialData || !!initialError);
  const pageSize = 10;

  // Load visibleColumns from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColumns = localStorage.getItem("tradeblocksVisibleColumns");
      if (savedColumns) {
        setVisibleColumns(JSON.parse(savedColumns));
      }
    }
  }, []);

  // Persist column visibility to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tradeblocksVisibleColumns", JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Fetch tradeblocks data
  const fetchTradeblocks = useCallback(async () => {
    console.log("fetchTradeblocks started");
    const args = {
      account: "U1673066", // Hardcoded for now
      dateStart: "2024-01-01",
      dateEnd: "2024-02-01",
    };

    try {
      console.log("Sending fetch request to /api/tradeblocks", args);
      const response = await fetch("/api/tradeblocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(10000),
      });

      console.log("Fetch response received:", { status: response.status, ok: response.ok });
      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        setTradeblocksData(result);
        setError(null);
      } else {
        throw new Error(result.error || "Failed to fetch tradeblocks");
      }
    } catch (err) {
      console.error("Error fetching tradeblocks:", err);
      setTradeblocksData(initialData); // Fallback to initialData
      setError(err instanceof Error ? err.message : "Failed to fetch tradeblocks");
    }
  }, [initialData]);

  // Initial fetch
  useEffect(() => {
    if (!isInitialFetchDone) {
      console.log("Triggering initial fetchTradeblocks");
      fetchTradeblocks();
      setIsInitialFetchDone(true);
    }
  }, [fetchTradeblocks, isInitialFetchDone]);

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Filter and sort trades
  const trades: Tradeblock[] = tradeblocksData
    .filter((trade) =>
      searchTerm ? trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.totalRealizedPnlUsd - b.totalRealizedPnlUsd;
      } else if (sortOrder === "desc") {
        return b.totalRealizedPnlUsd - a.totalRealizedPnlUsd;
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(trades.length / pageSize);
  const paginatedTrades = trades.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
  };

  // Shorten holding period
  const formatHoldingPeriod = (nanoseconds: number): string => {
    const duration = intervalToDuration({ start: 0, end: nanoseconds / 1_000_000 });
    const { days, hours, minutes, seconds } = duration;
    if (days) return `${days}d ${hours || 0}h`;
    if (hours) return `${hours}h ${minutes || 0}m`;
    if (minutes) return `${minutes}m ${seconds || 0}s`;
    return `${seconds || 0}s`;
  };

  // Render cell value based on column key
  const renderCellValue = (trade: Tradeblock, column: Column): string | number => {
    const value = trade[column.key];
    if (value === undefined || value === null) return "N/A";

    switch (column.key) {
      case "dateEntered":
      case "dateExit":
        return format(new Date(value as string), "MMM d HH:mm");
      case "holdingPeriod":
        return formatHoldingPeriod(value as number);
      case "unrealizedPnlUsd":
      case "unrealizedPnlPhp":
      case "totalRealizedPnlUsd":
      case "totalRealizedPnlPhp":
      case "avgEntryPrice":
      case "avgExitPrice":
        return (value as number).toFixed(2);
      case "totalValueTradedUsd":
      case "totalValueTradedPhp":
        return (value as number).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      default:
        return value as string | number;
    }
  };

  if (error || !tradeblocksData) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error Fetching Tradeblocks</CardTitle>
            <CardDescription>{error || "No data available"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full box-border">
      <div className="flex items-center py-2">
        <Input
          placeholder="Search by symbol"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table className="w-full max-w-full table-fixed box-border">
          <TableHeader>
            <TableRow>
              {columns.map(
                (column) =>
                  visibleColumns.includes(column.key) && (
                    <TableHead
                      key={column.key}
                      className={`${column.width} ${column.align === "right" ? "text-right" : ""} ${
                        column.hideMobile ? "hidden sm:table-cell" : ""
                      } text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap truncate`}
                    >
                      {column.key === "totalRealizedPnlUsd" ? (
                        <Button
                          variant="ghost"
                          className="p-0"
                          onClick={handleSort}
                        >
                          {column.label}
                          {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : ""}
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length ? (
              paginatedTrades.map((trade) => (
                <TableRow key={trade.id}>
                  {columns.map(
                    (column) =>
                      visibleColumns.includes(column.key) && (
                        <TableCell
                          key={column.key}
                          className={`${column.width} ${column.align === "right" ? "text-right" : ""} ${
                            column.hideMobile ? "hidden sm:table-cell" : ""
                          } px-2 py-1 text-xs truncate overflow-hidden box-border`}
                          style={{
                            color:
                              column.key === "totalRealizedPnlUsd"
                                ? trade.totalRealizedPnlUsd >= 0
                                  ? "#26a69a"
                                  : "#ef5350"
                                : undefined,
                          }}
                        >
                          {renderCellValue(trade, column)}
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TradeblocksTable;