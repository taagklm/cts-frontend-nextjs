"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, intervalToDuration } from "date-fns";
import { ChevronDown, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Loading from "../ui/loading";

interface Tradeblock {
  id?: number;
  account?: string;
  assetCategory?: string;
  currency?: string;
  symbol?: string;
  longShort?: string;
  unrealizedPnlUsd?: number;
  unrealizedPnlPhp?: number;
  totalOpenQuantity?: number;
  totalRealizedPnlUsd?: number;
  totalRealizedPnlPhp?: number;
  dateEntered?: string;
  dateExit?: string;
  avgEntryPrice?: number;
  avgExitPrice?: number;
  totalValueTradedUsd?: number;
  totalValueTradedPhp?: number;
  holdingPeriod?: number;
}

interface TradeblocksTableProps {
  initialData: Tradeblock[];
  initialError: string | null;
  account?: string;
  dateStart?: string;
  dateEnd?: string;
  fetchTimeout?: number;
}

interface Column {
  key: keyof Tradeblock | "actions";
  label: string;
  width: string;
  align: "left" | "right" | "center";
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
  { key: "actions", label: "Actions", width: "w-10", align: "center" },
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
  "actions",
];

const TradeblocksTable: React.FC<TradeblocksTableProps> = ({
  initialData,
  initialError,
  account = "U1673066",
  dateStart = "2024-01-01",
  dateEnd = "2024-02-01",
  fetchTimeout = 15000,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Tradeblock | null;
    order: "asc" | "desc" | null;
  }>({ key: null, order: null });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);
  const [tradeblocksData, setTradeblocksData] = useState<Tradeblock[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Always start with loading
  const [error, setError] = useState<string | null>(initialError);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(false); // Track fetch completion
  const [selectedTradeblock, setSelectedTradeblock] = useState<Tradeblock | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    account: "",
    assetCategory: "",
    currency: "",
    symbol: "",
    longShort: "",
    unrealizedPnlUsd: "",
    unrealizedPnlPhp: "",
    totalOpenQuantity: "",
    totalRealizedPnlUsd: "",
    totalRealizedPnlPhp: "",
    avgEntryPrice: "",
    avgExitPrice: "",
    totalValueTradedUsd: "",
    totalValueTradedPhp: "",
    holdingPeriod: "",
  });

  // Debounce helper for button clicks
  const debounce = (func: () => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  // Load visibleColumns from localStorage
  useEffect(() => {
    try {
      const savedColumns = localStorage.getItem("tradeblocksVisibleColumns");
      if (savedColumns) {
        const parsed = JSON.parse(savedColumns);
        if (Array.isArray(parsed) && parsed.every((key) => columns.some((col) => col.key === key))) {
          setVisibleColumns(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load columns from localStorage:", err);
      setVisibleColumns(defaultVisibleColumns);
    }
  }, []);

  // Persist visibleColumns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tradeblocksVisibleColumns", JSON.stringify(visibleColumns));
    } catch (err) {
      console.error("Failed to save columns to localStorage:", err);
    }
  }, [visibleColumns]);

  // Notify on error
  useEffect(() => {
    if (error && error !== initialError) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error, initialError]);

  // Fetch tradeblocks data
  const fetchTradeblocks = useCallback(async () => {
    console.log("fetchTradeblocks started");
    setIsLoading(true); // Ensure loading state is set
    const args = { account, dateStart, dateEnd };

    try {
      console.log("Sending fetch request to /api/tradeblocks", args);
      const response = await fetch("/api/tradeblocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(fetchTimeout),
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
      setTradeblocksData(initialData);
      setError(err instanceof Error ? err.message : "Failed to fetch tradeblocks");
    } finally {
      setIsLoading(false); // Clear loading state
      setIsInitialFetchDone(true); // Mark fetch as done
    }
  }, [initialData, account, dateStart, dateEnd, fetchTimeout]);

  // Initial fetch
  useEffect(() => {
    console.log("Initial fetch check:", { isInitialFetchDone, isLoading });
    if (!isInitialFetchDone) {
      fetchTradeblocks();
    } else {
      setIsLoading(false); // Ensure loading is false if fetch is already done
    }
  }, [fetchTradeblocks, isInitialFetchDone]);

  // Debug loading state changes
  useEffect(() => {
    console.log("TradeblocksTable loading state:", isLoading);
  }, [isLoading]);

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  };

  // Reset to default columns
  const handleResetColumns = () => {
    setVisibleColumns(defaultVisibleColumns);
    try {
      localStorage.setItem("tradeblocksVisibleColumns", JSON.stringify(defaultVisibleColumns));
    } catch (err) {
      console.error("Failed to save default columns to localStorage:", err);
    }
  };

  // Reset rows to default order
  const handleResetRows = () => {
    setSortConfig({ key: null, order: null });
  };

  // Handle sort
  const handleSort = (key: keyof Tradeblock) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key ? (prev.order === "asc" ? "desc" : prev.order === "desc" ? null : "asc") : "asc",
    }));
  };

  // Memoized sorting
  const trades = useMemo(() => {
    if (!sortConfig.key || !sortConfig.order) return tradeblocksData;
    return [...tradeblocksData].sort((a, b) => {
      const key = sortConfig.key as keyof Tradeblock;
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === undefined || bValue === undefined) return 0;

      if (key === "dateEntered" || key === "dateExit") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.order === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.order === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortConfig.order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [tradeblocksData, sortConfig]);

  // Handle edit tradeblock
  const handleEditTradeblock = (trade: Tradeblock) => {
    setSelectedTradeblock(trade);
    setEditForm({
      account: trade.account || "",
      assetCategory: trade.assetCategory || "",
      currency: trade.currency || "",
      symbol: trade.symbol || "",
      longShort: trade.longShort || "",
      unrealizedPnlUsd: trade.unrealizedPnlUsd?.toString() || "",
      unrealizedPnlPhp: trade.unrealizedPnlPhp?.toString() || "",
      totalOpenQuantity: trade.totalOpenQuantity?.toString() || "",
      totalRealizedPnlUsd: trade.totalRealizedPnlUsd?.toString() || "",
      totalRealizedPnlPhp: trade.totalRealizedPnlPhp?.toString() || "",
      avgEntryPrice: trade.avgEntryPrice?.toString() || "",
      avgExitPrice: trade.avgExitPrice?.toString() || "",
      totalValueTradedUsd: trade.totalValueTradedUsd?.toString() || "",
      totalValueTradedPhp: trade.totalValueTradedPhp?.toString() || "",
      holdingPeriod: trade.holdingPeriod?.toString() || "",
    });
    setIsEditOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = () => {
    if (!selectedTradeblock || !selectedTradeblock.id) return;

    const updatedTradeblock: Tradeblock = {
      ...selectedTradeblock,
      account: editForm.account,
      assetCategory: editForm.assetCategory,
      currency: editForm.currency,
      symbol: editForm.symbol,
      longShort: editForm.longShort || undefined,
      unrealizedPnlUsd: editForm.unrealizedPnlUsd ? Number(editForm.unrealizedPnlUsd) : undefined,
      unrealizedPnlPhp: editForm.unrealizedPnlPhp ? Number(editForm.unrealizedPnlPhp) : undefined,
      totalOpenQuantity: editForm.totalOpenQuantity ? Number(editForm.totalOpenQuantity) : undefined,
      totalRealizedPnlUsd: editForm.totalRealizedPnlUsd ? Number(editForm.totalRealizedPnlUsd) : undefined,
      totalRealizedPnlPhp: editForm.totalRealizedPnlPhp ? Number(editForm.totalRealizedPnlPhp) : undefined,
      avgEntryPrice: editForm.avgEntryPrice ? Number(editForm.avgEntryPrice) : undefined,
      avgExitPrice: editForm.avgExitPrice ? Number(editForm.avgExitPrice) : undefined,
      totalValueTradedUsd: editForm.totalValueTradedUsd ? Number(editForm.totalValueTradedUsd) : undefined,
      totalValueTradedPhp: editForm.totalValueTradedPhp ? Number(editForm.totalValueTradedPhp) : undefined,
      holdingPeriod: editForm.holdingPeriod ? Number(editForm.holdingPeriod) : undefined,
    };

    const updatedTrades = tradeblocksData.map((trade) =>
      trade.id === selectedTradeblock.id ? updatedTradeblock : trade
    );
    setTradeblocksData(updatedTrades);
    setIsEditOpen(false);
    toast.success("Tradeblock updated successfully");
  };

  // Format holding period
  const formatHoldingPeriod = (nanoseconds: number): string => {
    const duration = intervalToDuration({ start: 0, end: nanoseconds / 1_000_000 });
    const { days, hours, minutes, seconds } = duration;
    if (days) return `${days}d ${hours || 0}h`;
    if (hours) return `${hours}h ${minutes || 0}m`;
    if (minutes) return `${minutes}m ${seconds || 0}s`;
    return `${seconds || 0}s`;
  };

  // Render cell value
  const renderCellValue = (trade: Tradeblock, column: Column): string | number => {
    if (column.key === "actions") return "";
    const value = trade[column.key as keyof Tradeblock];
    if (value === undefined || value === null) return "N/A";

    switch (column.key) {
      case "dateEntered":
      case "dateExit":
        return value ? format(new Date(value as string), "MMM d HH:mm") : "N/A";
      case "holdingPeriod":
        return value ? formatHoldingPeriod(value as number) : "N/A";
      case "unrealizedPnlUsd":
      case "unrealizedPnlPhp":
      case "totalRealizedPnlUsd":
      case "totalRealizedPnlPhp":
      case "avgEntryPrice":
      case "avgExitPrice":
      case "totalValueTradedUsd":
      case "totalValueTradedPhp":
        return typeof value === "number" ? value.toFixed(2) : "N/A";
      default:
        return value as string | number;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
        <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Tradeblocks</CardTitle>
              <Button variant="outline" disabled>
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Loading variant="table" rows={6} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error or no data state
  if (error || !tradeblocksData.length) {
    return (
      <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
        <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Tradeblocks</CardTitle>
              <Button variant="outline" disabled>
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-red-600">
              {error || "No tradeblocks data available"}
              {error && (
                <button
                  onClick={fetchTradeblocks}
                  className="ml-2 text-blue-600 underline"
                >
                  Retry
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
      <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">Tradeblocks</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[60vh] overflow-y-auto">
                  <DropdownMenuItem onClick={handleResetColumns}>Reset to Default Columns</DropdownMenuItem>
                  <DropdownMenuSeparator />
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
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div
            className="w-full flex-grow rounded-md border p-2 mb-2 overflow-x-auto overflow-y-auto max-h-[500px]"
            style={{ minWidth: "800px" }}
          >
            <Table className="min-w-[800px] w-full" aria-label="Tradeblocks data table">
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <TableRow>
                  {columns.map(
                    (column) =>
                      visibleColumns.includes(column.key) && (
                        <TableHead
                          key={column.key}
                          className={`text-center text-sm font-semibold px-1 h-10 align-middle whitespace-nowrap truncate ${
                            column.hideMobile ? "hidden sm:table-cell" : ""
                          }`}
                          aria-sort={
                            column.key !== "actions" && sortConfig.key === column.key
                              ? sortConfig.order === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          {column.key !== "actions" ? (
                            <Button
                              variant="ghost"
                              className="p-0 flex items-center gap-1 justify-center w-full"
                              onClick={() => handleSort(column.key as keyof Tradeblock)}
                              aria-label={`Sort by ${column.label} in ${
                                sortConfig.key === column.key && sortConfig.order === "asc"
                                  ? "descending"
                                  : "ascending"
                              } order`}
                            >
                              {column.label}
                              {sortConfig.key === column.key &&
                                (sortConfig.order === "asc" ? " ↑" : sortConfig.order === "desc" ? " ↓" : "")}
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
                {trades.length ? (
                  trades.map((trade, index) => (
                    <TableRow key={trade.id ?? `trade-${index}`}>
                      {columns.map(
                        (column) =>
                          visibleColumns.includes(column.key) && (
                            <TableCell
                              key={column.key}
                              className={`text-center px-1 py-0 text-xs truncate text-ellipsis overflow-hidden ${
                                column.key === "actions" ? "" : "truncate text-ellipsis overflow-hidden"
                              } ${column.hideMobile ? "hidden sm:table-cell" : ""}`}
                              style={{
                                color:
                                  column.key === "totalRealizedPnlUsd"
                                    ? trade.totalRealizedPnlUsd && trade.totalRealizedPnlUsd >= 0
                                      ? "#26a69a"
                                      : "#ef5350"
                                    : undefined,
                              }}
                              title={column.key !== "actions" ? renderCellValue(trade, column).toString() : undefined}
                            >
                              {column.key === "actions" ? (
                                <div className="flex gap-1 justify-center">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title={`Edit Tradeblock ID ${trade.id}`}
                                        onClick={debounce(() => handleEditTradeblock(trade), 200)}
                                      >
                                        <Pencil size={12} className="text-green-500" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                      className="max-w-2xl overflow-y-auto max-h-[80vh] font-sans text-sm font-normal z-50 bg-white dark:bg-gray-900"
                                      style={{ width: "650px", maxWidth: "90vw" }}
                                    >
                                      <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
                                          Edit Tradeblock: ID {selectedTradeblock?.id}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-normal">
                                          Modify tradeblock details below.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-6 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-account" className="text-right text-sm font-normal">
                                            Account
                                          </Label>
                                          <Input
                                            id="edit-account"
                                            value={editForm.account}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, account: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-assetCategory" className="text-right text-sm font-normal">
                                            Asset Category
                                          </Label>
                                          <Input
                                            id="edit-assetCategory"
                                            value={editForm.assetCategory}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, assetCategory: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-currency" className="text-right text-sm font-normal">
                                            Currency
                                          </Label>
                                          <Input
                                            id="edit-currency"
                                            value={editForm.currency}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-symbol" className="text-right text-sm font-normal">
                                            Symbol
                                          </Label>
                                          <Input
                                            id="edit-symbol"
                                            value={editForm.symbol}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, symbol: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-longShort" className="text-right text-sm font-normal">
                                            Long/Short
                                          </Label>
                                          <Select
                                            value={editForm.longShort}
                                            onValueChange={(value) => setEditForm((prev) => ({ ...prev, longShort: value }))}
                                          >
                                            <SelectTrigger id="edit-longShort" className="col-span-3 text-sm font-normal">
                                              <SelectValue placeholder="Select Long/Short" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Long">Long</SelectItem>
                                              <SelectItem value="Short">Short</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-unrealizedPnlUsd" className="text-right text-sm font-normal">
                                            Unrealized P&L USD
                                          </Label>
                                          <Input
                                            id="edit-unrealizedPnlUsd"
                                            type="number"
                                            value={editForm.unrealizedPnlUsd}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, unrealizedPnlUsd: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-unrealizedPnlPhp" className="text-right text-sm font-normal">
                                            Unrealized P&L PHP
                                          </Label>
                                          <Input
                                            id="edit-unrealizedPnlPhp"
                                            type="number"
                                            value={editForm.unrealizedPnlPhp}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, unrealizedPnlPhp: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-totalOpenQuantity" className="text-right text-sm font-normal">
                                            Total Open Quantity
                                          </Label>
                                          <Input
                                            id="edit-totalOpenQuantity"
                                            type="number"
                                            value={editForm.totalOpenQuantity}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalOpenQuantity: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-totalRealizedPnlUsd" className="text-right text-sm font-normal">
                                            Total Realized P&L USD
                                          </Label>
                                          <Input
                                            id="edit-totalRealizedPnlUsd"
                                            type="number"
                                            value={editForm.totalRealizedPnlUsd}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalRealizedPnlUsd: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-totalRealizedPnlPhp" className="text-right text-sm font-normal">
                                            Total Realized P&L PHP
                                          </Label>
                                          <Input
                                            id="edit-totalRealizedPnlPhp"
                                            type="number"
                                            value={editForm.totalRealizedPnlPhp}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalRealizedPnlPhp: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-avgEntryPrice" className="text-right text-sm font-normal">
                                            Avg Entry Price
                                          </Label>
                                          <Input
                                            id="edit-avgEntryPrice"
                                            type="number"
                                            value={editForm.avgEntryPrice}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, avgEntryPrice: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-avgExitPrice" className="text-right text-sm font-normal">
                                            Avg Exit Price
                                          </Label>
                                          <Input
                                            id="edit-avgExitPrice"
                                            type="number"
                                            value={editForm.avgExitPrice}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, avgExitPrice: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-totalValueTradedUsd" className="text-right text-sm font-normal">
                                            Total Value Traded USD
                                          </Label>
                                          <Input
                                            id="edit-totalValueTradedUsd"
                                            type="number"
                                            value={editForm.totalValueTradedUsd}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalValueTradedUsd: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-totalValueTradedPhp" className="text-right text-sm font-normal">
                                            Total Value Traded PHP
                                          </Label>
                                          <Input
                                            id="edit-totalValueTradedPhp"
                                            type="number"
                                            value={editForm.totalValueTradedPhp}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalValueTradedPhp: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="edit-holdingPeriod" className="text-right text-sm font-normal">
                                            Holding Period (ns)
                                          </Label>
                                          <Input
                                            id="edit-holdingPeriod"
                                            type="number"
                                            value={editForm.holdingPeriod}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, holdingPeriod: e.target.value }))}
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsEditOpen(false)}
                                          className="text-sm font-normal"
                                        >
                                          Cancel
                                        </Button>
                                        <Button onClick={handleEditSubmit} className="text-sm font-normal">
                                          Save
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ) : (
                                renderCellValue(trade, column)
                              )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeblocksTable;