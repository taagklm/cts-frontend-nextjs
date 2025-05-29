"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function normalizeDateToUTC(date: Date): Date {
  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to normalizeDateToUTC, returning current date");
    return new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function DatePickerWithRange({
  date,
  setDate,
  mode,
  setError,
  setIsValid,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  mode: "from" | "to";
  setError?: (error: string | null) => void;
  setIsValid?: (isValid: boolean) => void;
}) {
  const today = normalizeDateToUTC(new Date());
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [hasSelected, setHasSelected] = React.useState(false);

  console.log(`DatePickerWithRange (${mode}): Initialized`, {
    date: date?.toISOString(),
    hasSelected,
  });

  React.useEffect(() => {
    if (date && !isNaN(date.getTime())) {
      console.log(`DatePickerWithRange (${mode}): Date Updated:`, {
        date: date.toISOString(),
      });
    } else {
      console.log(`DatePickerWithRange (${mode}): Date Invalid or Undefined:`, { date });
    }
  }, [date, mode]);

  React.useEffect(() => {
    const isValid = !localError && hasSelected;
    setIsValid?.(isValid);
    console.log(`DatePickerWithRange (${mode}): Validity updated:`, { isValid, localError });
  }, [localError, hasSelected, mode, setIsValid]);

  const handleSelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      console.log(`DatePickerWithRange (${mode}): handleSelect`, { selectedDate });
      if (!selectedDate) {
        setLocalError("Please select a date");
        setError?.("Please select a date");
        setHasSelected(false);
        setDate(undefined);
        console.log(`DatePickerWithRange (${mode}): No date selected`);
        return;
      }

      const normalizedDate = normalizeDateToUTC(selectedDate);
      if (normalizedDate > today) {
        setLocalError("Date cannot be in the future");
        setError?.("Date cannot be in the future");
        setHasSelected(false);
        console.log(`DatePickerWithRange (${mode}): Future date selected`, { normalizedDate });
        return;
      }

      setLocalError(null);
      setError?.(null);
      setHasSelected(true);
      setDate(normalizedDate);
      console.log(`DatePickerWithRange (${mode}): Date selected`, {
        normalizedDate: normalizedDate.toISOString(),
      });
    },
    [mode, setError, setDate, today]
  );

  const getDisplayText = () => {
    if (!date || isNaN(date.getTime()) || !hasSelected) {
      return mode === "from" ? "From: yyyy-mm-dd" : "To: yyyy-mm-dd";
    }
    try {
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error(`DatePickerWithRange (${mode}): Error formatting date:`, error);
      return "Invalid date";
    }
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={`date-${mode}`}
            variant={"outline"}
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => date > today}
            initialFocus
          />
          {localError && <p className="text-sm text-red-500 p-3">{localError}</p>}
        </PopoverContent>
      </Popover>
    </div>
  );
}