"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { isAfter } from "date-fns";
import { DatePickerWithRange } from "./equity-date-picker";

function normalizeDateToUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function EquityRange({
  dateRange,
  setDateRange,
  onApplyFilters,
}: {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onApplyFilters: () => void;
}) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(dateRange?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(dateRange?.to);
  const [isFromValid, setIsFromValid] = React.useState(true);
  const [isToValid, setIsToValid] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const today = normalizeDateToUTC(new Date());

  React.useEffect(() => {
    if (fromDate && toDate && !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      if (isAfter(fromDate, toDate)) {
        setError("End date cannot be earlier than start date");
        setIsToValid(false);
        console.log("EquityRange: Invalid range (To before From)", { fromDate, toDate });
        return;
      }
      setError(null);
      setIsFromValid(true);
      setIsToValid(true);
      const newDateRange: DateRange = { from: fromDate, to: toDate };
      setDateRange(newDateRange);
      console.log("EquityRange: Date range updated", {
        from: newDateRange.from?.toISOString(),
        to: newDateRange.to?.toISOString(),
      });
    } else {
      setDateRange(undefined);
      setIsFromValid(!!fromDate && !isNaN(fromDate.getTime()));
      setIsToValid(!!toDate && !isNaN(toDate.getTime()));
      console.log("EquityRange: Date range set to undefined", { fromDate, toDate });
    }
  }, [fromDate, toDate, setDateRange]);

  const isDateRangeComplete = () => {
    if (!fromDate || !toDate) {
      console.log("EquityRange: Date range incomplete", { fromDate, toDate });
      return false;
    }
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.log("EquityRange: Invalid date objects", { fromDate, toDate });
      return false;
    }
    if (isAfter(fromDate, toDate)) {
      console.log("EquityRange: Invalid range (To before From)", { fromDate, toDate });
      return false;
    }
    return true;
  };

  const handleApplyFiltersClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("EquityRange: handleApplyFilters:", { fromDate, toDate, isFromValid, isToValid });
      if (!isFromValid || !isToValid || !isDateRangeComplete()) {
        console.log("EquityRange: Apply Filters blocked", {
          isFromValid,
          isToValid,
          isDateRangeComplete: isDateRangeComplete(),
        });
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