"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DatePickerWithRange } from "./date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { isAfter } from "date-fns";

function normalizeDateToUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function Range({
  dateRange,
  setDateRange,
  includeHoldings,
  setIncludeHoldings,
  onApplyFilters,
}: {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  includeHoldings: boolean;
  setIncludeHoldings: (value: boolean) => void;
  onApplyFilters: () => void;
}) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(dateRange?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(dateRange?.to);
  const [selectedStrategies, setSelectedStrategies] = React.useState<string[]>([]);
  const [isFromValid, setIsFromValid] = React.useState(true);
  const [isToValid, setIsToValid] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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

  // Sync dateRange with fromDate and toDate
  React.useEffect(() => {
    if (fromDate && toDate && !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      if (isAfter(fromDate, toDate)) {
        setError("End date cannot be earlier than start date");
        setIsToValid(false);
        console.log("Range: Invalid range (To before From)", { fromDate, toDate });
        return;
      }
      setError(null);
      const newDateRange: DateRange = { from: fromDate, to: toDate };
      setDateRange(newDateRange);
      console.log("Range: Date range updated", {
        from: newDateRange.from?.toISOString(),
        to: newDateRange.to?.toISOString(),
      });
    } else {
      setDateRange(undefined);
      console.log("Range: Date range set to undefined", { fromDate, toDate });
    }
  }, [fromDate, toDate, setDateRange]);

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

  // Validate date range
  const isDateRangeComplete = () => {
    if (!fromDate || !toDate) {
      console.log("Range: Date range incomplete", { fromDate, toDate });
      return false;
    }
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.log("Range: Invalid date objects", { fromDate, toDate });
      return false;
    }
    if (isAfter(fromDate, toDate)) {
      console.log("Range: Invalid range (To before From)", { fromDate, toDate });
      return false;
    }
    return true;
  };

  // Handle "Apply Filters" button click
  const handleApplyFiltersClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Range: handleApplyFilters:", { fromDate, toDate, isFromValid, isToValid });
      if (!isFromValid || !isToValid) {
        console.log("Range: Apply Filters blocked due to invalid date");
        window.alert("Please select valid dates.");
        return;
      }
      if (!isDateRangeComplete()) {
        console.log("Range: Apply Filters blocked due to incomplete date range");
        window.alert("Please select a valid date range.");
        return;
      }
      onApplyFilters();
    },
    [fromDate, toDate, isFromValid, isToValid, onApplyFilters]
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4">
        <div>
          <Label className="text-gray-900 dark:text-gray-100 pb-2">From:</Label>
          <DatePickerWithRange
            date={fromDate}
            setDate={setFromDate}
            mode="from"
            setError={setError}
            setIsValid={setIsFromValid}
          />
        </div>
        <div>
          <Label className="text-gray-900 dark:text-gray-100 pb-2">To:</Label>
          <DatePickerWithRange
            date={toDate}
            setDate={setToDate}
            mode="to"
            setError={setError}
            setIsValid={setIsToValid}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
        onClick={handleApplyFiltersClick}
        disabled={!isFromValid || !isToValid || !isDateRangeComplete()}
        className="mt-4"
      >
        Apply Filters
      </Button>
    </div>
  );
}