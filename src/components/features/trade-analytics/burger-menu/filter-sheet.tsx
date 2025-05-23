"use client";

import * as React from "react";
import { startOfYear, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DatePickerWithRange } from "./date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function normalizeDateToUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function Range({
  dateRange,
  setDateRange,
  period,
  setPeriod,
  includeHoldings,
  setIncludeHoldings,
  onApplyFilters,
}: {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  period: string;
  setPeriod: (period: string) => void;
  includeHoldings: boolean;
  setIncludeHoldings: (value: boolean) => void;
  onApplyFilters: () => void;
}) {
  const [selectedStrategies, setSelectedStrategies] = React.useState<string[]>([]);
  const [isDateRangeValid, setIsDateRangeValid] = React.useState(true);
  const today = normalizeDateToUTC(new Date());

  // List of trading strategies (non-functional, for display only)
  const strategies = [
    "Bluesky",
    "Capitulation",
    "Coil",
    "Intraday Coil",
    "Intraday Price Action",
    "Intraday Pullback",
    "IPO",
    "Momentum",
    "Movers",
    "None",
    "Others",
    "Pullback",
    "Range",
    "Reset",
    "Reversal",
  ].sort((a, b) => a.localeCompare(b));

  // Initialize dateRange to undefined to trigger placeholders
  React.useEffect(() => {
    if (!dateRange) {
      setDateRange(undefined);
      console.log("Range: Initialized dateRange with placeholders");
    }
  }, [dateRange, setDateRange]);

  // Update date range based on selected period
  React.useEffect(() => {
    const todayUTC = normalizeDateToUTC(today);
    switch (period) {
      case "daily":
      case "custom":
        setDateRange(undefined); // Use placeholders until user selects
        break;
      case "monthly":
      case "monthToDate":
        setDateRange({ from: normalizeDateToUTC(startOfMonth(today)), to: todayUTC });
        break;
      case "annual":
      case "yearToDate":
        setDateRange({ from: normalizeDateToUTC(startOfYear(today)), to: todayUTC });
        break;
    }
    console.log("Range: Period changed:", { period, dateRange });
  }, [period, setDateRange]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    console.log("Range: handlePeriodChange:", { value });
  };

  // Non-functional strategy handlers (for UI only)
  const handleStrategyChange = (strategy: string) => {
    let updatedStrategies: string[];
    if (strategy === "None") {
      updatedStrategies = ["None"];
    } else {
      updatedStrategies = selectedStrategies.includes(strategy)
        ? selectedStrategies.filter((s) => s !== strategy && s !== "None")
        : [...selectedStrategies.filter((s) => s !== "None"), strategy];
    }
    setSelectedStrategies(updatedStrategies);
    console.log("Range: handleStrategyChange:", { strategy, updatedStrategies });
  };

  const handleSelectAll = () => {
    const allStrategies = strategies.filter((s) => s !== "None");
    setSelectedStrategies(allStrategies);
    console.log("Range: handleSelectAll:", { allStrategies });
  };

  const handleUnselectAll = () => {
    setSelectedStrategies([]);
    console.log("Range: handleUnselectAll");
  };

  // Handle "Apply Filters" button click
  const handleApplyFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Range: handleApplyFilters:", { dateRange, period, isDateRangeValid });
    if (!isDateRangeValid) {
      console.log("Range: Apply Filters blocked due to invalid date range");
      return;
    }
    if (!dateRange || !dateRange.from) {
      window.alert("Please select a valid date range.");
      return;
    }
    onApplyFilters();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-4 items-center">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="monthToDate">Month to Date</SelectItem>
            <SelectItem value="yearToDate">Year to Date</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
          period={period}
          setIsValid={setIsDateRangeValid}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="include-holdings"
          checked={includeHoldings}
          onCheckedChange={(checked) => setIncludeHoldings(checked as boolean)}
          className="border-gray-300 dark:border-gray-600"
        />
        <Label htmlFor="include-holdings" className="text-gray-900 dark:text-gray-100">
          Include Holdings?
        </Label>
      </div>

      <Card className="border-gray-200 dark:border-gray-600 shadow-none">
        <CardHeader className="pt-0 pb-0">
          <div className="flex justify-between items-center">
            <Label className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
              Trading Strategies
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleUnselectAll}>
                Unselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="grid grid-cols-3 gap-2">
            {strategies.map((strategy) => (
              <div key={strategy} className="flex items-center gap-2">
                <Checkbox
                  id={`strategy-${strategy}`}
                  checked={selectedStrategies.includes(strategy)}
                  onCheckedChange={() => handleStrategyChange(strategy)}
                  className="border-gray-300 dark:border-gray-600"
                />
                <Label
                  htmlFor={`strategy-${strategy}`}
                  className="text-gray-900 dark:text-gray-100 text-sm"
                >
                  {strategy}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleApplyFilters}
        disabled={!isDateRangeValid}
        className="mt-4"
      >
        Apply Filters
      </Button>
    </div>
  );
}