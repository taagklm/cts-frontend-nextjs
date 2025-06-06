"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function normalizeDateToUTC(date: Date): Date {
  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to normalizeDateToUTC, returning current date");
    return new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
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
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [hasSelected, setHasSelected] = React.useState(false);
  const [year, setYear] = React.useState<string | undefined>();
  const [month, setMonth] = React.useState<string | undefined>();
  const [day, setDay] = React.useState<string | undefined>();
  const [hasSelectedYear, setHasSelectedYear] = React.useState(false);
  const [hasSelectedMonth, setHasSelectedMonth] = React.useState(false);
  const [hasSelectedDay, setHasSelectedDay] = React.useState(false);

  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const availableYears = years.filter((year) => year <= currentYear);
  const days = Array.from(
    { length: getDaysInMonth(Number(year) || currentYear, Number(month) || currentMonth) },
    (_, i) => i + 1
  );

  console.log(`DatePickerWithRange (${mode}): Initialized`, {
    date: date?.toISOString(),
    hasSelected,
  });

  React.useEffect(() => {
    if (date && !isNaN(date.getTime())) {
      console.log(`DatePickerWithRange (${mode}): Date Updated:`, {
        date: date.toISOString(),
      });
      setYear(date.getFullYear().toString());
      setMonth(date.getMonth().toString());
      setDay(date.getDate().toString());
      setHasSelectedYear(true);
      setHasSelectedMonth(true);
      setHasSelectedDay(true);
      setHasSelected(true);
      setLocalError(null);
      setIsValid?.(true); // Set valid when date is updated
    } else {
      console.log(`DatePickerWithRange (${mode}): Date Invalid or Undefined:`, { date });
      setYear(undefined);
      setMonth(undefined);
      setDay(undefined);
      setHasSelectedYear(false);
      setHasSelectedMonth(false);
      setHasSelectedDay(false);
      setHasSelected(false);
      setLocalError(null);
      setIsValid?.(false); // Set invalid when date is reset
    }
  }, [date, mode, setIsValid]);

  const handleSelect = React.useCallback(
    (selectedYear: number, selectedMonth: number, selectedDay: number) => {
      console.log(`DatePickerWithRange (${mode}): handleSelect`, {
        selectedYear,
        selectedMonth,
        selectedDay,
      });

      const finalYear = selectedYear ?? (hasSelectedYear ? Number(year) : undefined);
      const finalMonth = selectedMonth ?? (hasSelectedMonth ? Number(month) : undefined);
      const finalDay = selectedDay ?? (hasSelectedDay ? Number(day) : undefined);

      if (finalYear === undefined || finalMonth === undefined || finalDay === undefined) {
        setLocalError("Please select a complete date");
        setError?.("Please select a complete date");
        setHasSelected(false);
        setDate(undefined);
        setIsValid?.(false);
        console.log(`DatePickerWithRange (${mode}): Incomplete date selected`, {
          finalYear,
          finalMonth,
          finalDay,
        });
        return;
      }

      if (isNaN(finalYear) || isNaN(finalMonth) || isNaN(finalDay)) {
        setLocalError("Please select a valid date");
        setError?.("Please select a valid date");
        setHasSelected(false);
        setDate(undefined);
        setIsValid?.(false);
        console.log(`DatePickerWithRange (${mode}): Invalid date selected`);
        return;
      }

      const normalizedDate = normalizeDateToUTC(new Date(finalYear, finalMonth, finalDay));
      // Restore original future date check (handled in Select components, not here)
      setLocalError(null);
      setError?.(null);
      setHasSelected(true);
      setDate(normalizedDate);
      setYear(finalYear.toString());
      setMonth(finalMonth.toString());
      setDay(finalDay.toString());
      setIsValid?.(true); // Explicitly set valid for complete dates
      console.log(`DatePickerWithRange (${mode}): Date selected`, {
        normalizedDate: normalizedDate.toISOString(),
      });
    },
    [mode, setError, setDate, year, month, day, hasSelectedYear, hasSelectedMonth, hasSelectedDay, setIsValid]
  );

  return (
    <div className={cn("grid gap-2")}>
      <div className="flex space-x-2">
        <Select
          value={year}
          onValueChange={(value) => {
            const newYear = parseInt(value);
            setYear(value);
            setHasSelectedYear(true);
            let newMonth = Number(month) ?? currentMonth;
            let newDay = Number(day) ?? currentDay;
            if (newYear === currentYear && newMonth > currentMonth) {
              newMonth = currentMonth;
              newDay = currentDay;
              setMonth(newMonth.toString());
              setDay(newDay.toString());
            } else if (newYear === currentYear && newMonth === currentMonth && newDay > currentDay) {
              newDay = currentDay;
              setDay(newDay.toString());
            }
            const maxDays = getDaysInMonth(newYear, newMonth);
            if (newDay > maxDays) {
              newDay = maxDays;
              setDay(newDay.toString());
            }
            console.log(`Custom ${mode} Year Select:`, { value: newYear, month: newMonth, day: newDay });
            handleSelect(newYear, newMonth, newDay);
          }}
        >
          <SelectTrigger id={`year-${mode}`} className="w-[100px] border-gray-300 rounded-md">
            <SelectValue placeholder="yyyy" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={month}
          onValueChange={(value) => {
            const newMonth = parseInt(value);
            setMonth(value);
            setHasSelectedMonth(true);
            let newDay = Number(day) ?? currentDay;
            if ((Number(year) || currentYear) === currentYear && newMonth === currentMonth && newDay > currentDay) {
              newDay = currentDay;
              setDay(newDay.toString());
            }
            const maxDays = getDaysInMonth(Number(year) || currentYear, newMonth);
            if (newDay > maxDays) {
              newDay = maxDays;
              setDay(newDay.toString());
            }
            console.log(`Custom ${mode} Month Select:`, { value: newMonth, day: newDay });
            handleSelect(Number(year) || currentYear, newMonth, newDay);
          }}
        >
          <SelectTrigger id={`month-${mode}`} className="w-[120px] min-w-[120px] border-gray-300 rounded-md">
            <SelectValue placeholder="mm" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem
                key={month}
                value={index.toString()}
                disabled={(Number(year) || currentYear) === currentYear && index > currentMonth}
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={day}
          onValueChange={(value) => {
            const newDay = parseInt(value);
            setDay(value);
            setHasSelectedDay(true);
            console.log(`Custom ${mode} Day Select:`, { value: newDay });
            handleSelect(Number(year) || currentYear, Number(month) || currentMonth, newDay);
          }}
        >
          <SelectTrigger id={`day-${mode}`} className="w-[80px] border-gray-300 rounded-md">
            <SelectValue placeholder="dd" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem
                key={day}
                value={day.toString()}
                disabled={
                  (Number(year) || currentYear) === currentYear &&
                  (Number(month) || currentMonth) === currentMonth &&
                  day > currentDay
                }
              >
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {localError && <p className="text-sm text-red-500 mt-2">{localError}</p>}
    </div>
  );
}