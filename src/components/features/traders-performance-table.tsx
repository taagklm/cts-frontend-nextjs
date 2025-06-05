"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
  Row,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Loading from "../ui/loading";

export type TradersPerformanceTableData = {
  trader: string;
  ibPnlYTD: number;
  ibPnlYTDPercent: number;
  phPnlYTD: number;
  phPnlYTDPercent: number;
  ibAum: number;
  phAum: number;
  ibAccountNo: string;
  phAccountNo: string;
};

export const columns: ColumnDef<TradersPerformanceTableData>[] = [
  {
    accessorKey: "trader",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Trader
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const trader = row.getValue("trader") as string;
      const ibAccountNo = row.getValue("ibAccountNo") as string;
      const phAccountNo = row.getValue("phAccountNo") as string;
      console.log("TradersPerformanceTable: Linking trader:", { trader, ibAccountNo, phAccountNo });
      return (
        <Link
          href={{
            pathname: `/risk-platform/dashboard/traders/${encodeURIComponent(trader)}`,
            query: {
              ibAccountNo,
              phAccountNo,
            },
          }}
          className="text-blue-500 hover:underline"
        >
          {trader}
        </Link>
      );
    },
  },
  {
    accessorKey: "ibPnlYTD",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        IB YTD
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("ibPnlYTD"));
      const isValid = !isNaN(value);
      const color = isValid && value >= 0 ? "#26a69a" : "#ef5350";
      const formattedValue = isValid
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value)
        : "N/A";
      return (
        <div className="text-right" style={{ color }}>
          {formattedValue}
        </div>
      );
    },
  },
  {
    accessorKey: "ibPnlYTDPercent",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        %
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("ibPnlYTDPercent"));
      const isValid = !isNaN(value);
      const color = isValid && value >= 0 ? "#26a69a" : "#ef5350";
      const formattedValue = isValid
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value * 100) + "%"
        : "N/A";
      return (
        <div className="text-center" style={{ color }}>
          {formattedValue}
        </div>
      );
    },
  },
  {
    accessorKey: "phPnlYTD",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        PH YTD
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("phPnlYTD"));
      const isValid = !isNaN(value);
      const color = isValid && value >= 0 ? "#26a69a" : "#ef5350";
      const formattedValue = isValid
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value)
        : "N/A";
      return (
        <div className="text-right" style={{ color }}>
          {formattedValue}
        </div>
      );
    },
  },
  {
    accessorKey: "phPnlYTDPercent",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        %
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("phPnlYTDPercent"));
      const isValid = !isNaN(value);
      const color = isValid && value >= 0 ? "#26a69a" : "#ef5350";
      const formattedValue = isValid
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value * 100) + "%"
        : "N/A";
      return (
        <div className="text-center" style={{ color }}>
          {formattedValue}
        </div>
      );
    },
  },
  {
    accessorKey: "ibAum",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        IB AUM (USD)
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("ibAum"));
      const formattedValue = !isNaN(value)
        ? new Intl.NumberFormat("en-US").format(value)
        : "N/A";
      return <div className="text-center">{formattedValue}</div>;
    },
  },
  {
    accessorKey: "phAum",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        PH AUM (PHP)
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => {
      const value = parseFloat(row.getValue("phAum"));
      const formattedValue = !isNaN(value)
        ? new Intl.NumberFormat("en-US").format(value)
        : "N/A";
      return <div className="text-center">{formattedValue}</div>;
    },
  },
  {
    accessorKey: "ibAccountNo",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        IB Account
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => (
      <div className="text-center">{row.getValue("ibAccountNo") || "N/A"}</div>
    ),
  },
  {
    accessorKey: "phAccountNo",
    header: ({ column }: { column: Column<TradersPerformanceTableData> }) => (
      <Button
        variant="ghost"
        className="p-0 w-full justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        PH Account
        {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
      </Button>
    ),
    cell: ({ row }: { row: Row<TradersPerformanceTableData> }) => (
      <div className="text-center">{row.getValue("phAccountNo") || "N/A"}</div>
    ),
  },
];

interface TradersPerformanceTableProps {
  data: TradersPerformanceTableData[];
}

export function TradersPerformanceTable({ data }: TradersPerformanceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isLoading, setIsLoading] = React.useState(true); // Added loading state
  const [tableData, setTableData] = React.useState<TradersPerformanceTableData[]>([]); // Store data

  // Simulate async data fetch (replace with actual API call)
  React.useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      setTableData(data);
      setIsLoading(false);
    }, 1000);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
        <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Traders' PNL</CardTitle>
              <Button variant="outline" disabled>
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Loading variant="table" rows={6} className="w-full" /> {/* 6 rows: 1 header + 5 data */}
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
            <CardTitle className="text-2xl font-semibold">Traders' PNL</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-[60vh] overflow-y-auto">
                <DropdownMenuItem onClick={() => table.toggleAllColumnsVisible(true)}>
                  Reset to Default
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full flex-grow rounded-md border pr-2 pl-2 pt-0 pb-2 mb-2 max-h-[500px] overflow-y-auto">
            <Table className="min-w-0 w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-center text-sm font-semibold px-1 h-10 align-middle whitespace-nowrap truncate"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="text-center px-1 py-1 text-xs truncate text-ellipsis overflow-hidden"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
}