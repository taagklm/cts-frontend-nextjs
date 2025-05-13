"use client";

import * as React from "react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, isAfter } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function normalizeDateToUTC(date: Date): Date {
  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to normalizeDateToUTC, returning current date");
    return new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// Helper to get days in a month, accounting for leap years
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePickerWithRange({
  dateRange,
  setDateRange,
  period,
}: {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  period: string;
}) {
  const today = normalizeDateToUTC(new Date());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const availableYears = years.filter((year) => year <= currentYear);

  // State for dropdowns and selection flags
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);
  const [fromYear, setFromYear] = React.useState<number | null>(null);
  const [fromMonth, setFromMonth] = React.useState<number | null>(null);
  const [fromDay, setFromDay] = React.useState<number | null>(null);
  const [toYear, setToYear] = React.useState<number | null>(null);
  const [toMonth, setToMonth] = React.useState<number | null>(null);
  const [toDay, setToDay] = React.useState<number | null>(null);
  const [hasSelectedYear, setHasSelectedYear] = React.useState(false);
  const [hasSelectedMonth, setHasSelectedMonth] = React.useState(false);
  const [hasSelectedDay, setHasSelectedDay] = React.useState(false);
  const [hasSelectedFromYear, setHasSelectedFromYear] = React.useState(false);
  const [hasSelectedFromMonth, setHasSelectedFromMonth] = React.useState(false);
  const [hasSelectedFromDay, setHasSelectedFromDay] = React.useState(false);
  const [hasSelectedToYear, setHasSelectedToYear] = React.useState(false);
  const [hasSelectedToMonth, setHasSelectedToMonth] = React.useState(false);
  const [hasSelectedToDay, setHasSelectedToDay] = React.useState(false);

  // Generate days for dropdowns based on selected year and month
  const fromDays = Array.from(
    { length: getDaysInMonth(fromYear ?? currentYear, fromMonth ?? currentMonth) },
    (_, i) => i + 1
  );
  const toDays = Array.from(
    { length: getDaysInMonth(toYear ?? currentYear, toMonth ?? currentMonth) },
    (_, i) => i + 1
  );

  // Initialize dateRange to undefined to trigger placeholders
  React.useEffect(() => {
    if (!dateRange || !dateRange.from) {
      setDateRange(undefined); // Ensure placeholders are shown initially
      setSelectedYear(null);
      setFromYear(null);
      setToYear(null);
      setSelectedMonth(null);
      setFromMonth(null);
      setToMonth(null);
      setFromDay(null);
      setToDay(null);
      setHasSelectedYear(false);
      setHasSelectedMonth(false);
      setHasSelectedDay(false);
      setHasSelectedFromYear(false);
      setHasSelectedFromMonth(false);
      setHasSelectedFromDay(false);
      setHasSelectedToYear(false);
      setHasSelectedToMonth(false);
      setHasSelectedToDay(false);
      console.log("DatePickerWithRange: Initialized with placeholders");
    }
  }, [dateRange, setDateRange]);

  // Log dateRange changes for debugging
  React.useEffect(() => {
    if (dateRange && dateRange.from) {
      console.log("DatePickerWithRange: Date Range Updated:", {
        from: dateRange.from.toISOString(),
        to: dateRange.to?.toISOString() || "N/A",
        period,
      });
    }
  }, [dateRange, period]);

  const handleAnnualSelect = (year: string) => {
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return;
    setSelectedYear(yearNum);
    setHasSelectedYear(true);
    const start = normalizeDateToUTC(startOfYear(new Date(yearNum, 0, 1)));
    const end = yearNum === currentYear
      ? today
      : normalizeDateToUTC(endOfYear(new Date(yearNum, 0, 1)));
    setDateRange({ from: start, to: end });
    setFromYear(yearNum);
    setFromMonth(0);
    setFromDay(1);
    setToYear(yearNum);
    setToMonth(11);
    setToDay(getDaysInMonth(yearNum, 11));
    console.log("handleAnnualSelect:", { yearNum, from: start, to: end });
  };

  const handleMonthlySelect = (month: string, year?: string) => {
    const monthNum = parseInt(month);
    const yearNum = year ? parseInt(year) : currentYear; // Use currentYear for monthToDate
    if (isNaN(monthNum) || isNaN(yearNum)) return;
    setSelectedMonth(monthNum);
    setHasSelectedMonth(true);
    if (year) {
      setSelectedYear(yearNum);
      setHasSelectedYear(true);
    }
    const date = new Date(yearNum, monthNum, 1);
    if (period === "monthToDate") {
      const start = normalizeDateToUTC(startOfMonth(date));
      setDateRange({ from: start, to: today });
      setFromYear(yearNum);
      setFromMonth(monthNum);
      setFromDay(1);
      setToYear(currentYear);
      setToMonth(currentMonth);
      setToDay(currentDay);
      console.log("handleMonthlySelect (monthToDate):", { from: start, to: today });
    } else {
      const start = normalizeDateToUTC(startOfMonth(date));
      const endOfSelectedMonth = normalizeDateToUTC(endOfMonth(date));
      const end = yearNum === currentYear && monthNum === currentMonth
        ? today
        : endOfSelectedMonth;
      setDateRange({ from: start, to: end });
      setFromYear(yearNum);
      setFromMonth(monthNum);
      setFromDay(1);
      setToYear(yearNum);
      setToMonth(monthNum);
      setToDay(getDaysInMonth(yearNum, monthNum));
      console.log("handleMonthlySelect (monthly):", { from: start, to: end });
    }
  };

  const handleDailySelect = (year: number, month: number, day: number) => {
    // Use current values if not all fields are selected
    const finalYear = year ?? (hasSelectedYear ? fromYear : currentYear);
    const finalMonth = month ?? (hasSelectedMonth ? fromMonth : currentMonth);
    const finalDay = day ?? (hasSelectedDay ? fromDay : currentDay);
    // Reset to valid date if future for 2025
    let adjustedYear = finalYear;
    let adjustedMonth = finalMonth;
    let adjustedDay = finalDay;
    if (finalYear === currentYear && finalMonth > currentMonth) {
      adjustedMonth = currentMonth;
      adjustedDay = currentDay;
    } else if (finalYear === currentYear && finalMonth === currentMonth && finalDay > currentDay) {
      adjustedDay = currentDay;
    }
    const selectedDate = normalizeDateToUTC(new Date(adjustedYear, adjustedMonth, adjustedDay));
    setDateRange({ from: selectedDate, to: selectedDate });
    setFromYear(adjustedYear);
    setFromMonth(adjustedMonth);
    setFromDay(adjustedDay);
    setToYear(adjustedYear);
    setToMonth(adjustedMonth);
    setToDay(adjustedDay);
    console.log("handleDailySelect:", {
      fromYear: adjustedYear,
      fromMonth: adjustedMonth,
      fromDay: adjustedDay,
      selectedDate,
    });
  };

  const handleCustomSelect = (
    fromYearVal: number,
    fromMonthVal: number,
    fromDayVal: number,
    toYearVal: number,
    toMonthVal: number,
    toDayVal: number
  ) => {
    // Use current values if not all fields are selected
    const finalFromYear = fromYearVal ?? (hasSelectedFromYear ? fromYear : currentYear);
    const finalFromMonth = fromMonthVal ?? (hasSelectedFromMonth ? fromMonth : currentMonth);
    const finalFromDay = fromDayVal ?? (hasSelectedFromDay ? fromDay : currentDay);
    const finalToYear = toYearVal ?? (hasSelectedToYear ? toYear : currentYear);
    const finalToMonth = toMonthVal ?? (hasSelectedToMonth ? toMonth : currentMonth);
    const finalToDay = toDayVal ?? (hasSelectedToDay ? toDay : currentDay);
    const fromDate = normalizeDateToUTC(new Date(finalFromYear, finalFromMonth, finalFromDay));
    const toDate = normalizeDateToUTC(new Date(finalToYear, finalToMonth, finalToDay));
    // Prevent setting if To is before From (validation deferred to Apply Filters)
    if (isAfter(fromDate, toDate)) {
      console.log("handleCustomSelect: Skipped due to To before From", { fromDate, toDate });
      return;
    }
    setDateRange({ from: fromDate, to: toDate });
    setFromYear(finalFromYear);
    setFromMonth(finalFromMonth);
    setFromDay(finalFromDay);
    setToYear(finalToYear);
    setToMonth(finalToMonth);
    setToDay(finalToDay);
    console.log("handleCustomSelect:", {
      fromDate,
      toDate,
      fromYear: finalFromYear,
      fromMonth: finalFromMonth,
      fromDay: finalFromDay,
      toYear: finalToYear,
      toMonth: finalToMonth,
      toDay: finalToDay,
    });
  };

  const getDisplayText = () => {
    if (!dateRange || !dateRange.from || isNaN(dateRange.from.getTime())) {
      if (period === "daily") {
        const yearText = hasSelectedYear && fromYear ? fromYear : "yyyy";
        const monthText =
          hasSelectedMonth && fromMonth !== null ? (fromMonth + 1).toString().padStart(2, "0") : "mm";
        const dayText = hasSelectedDay && fromDay ? fromDay.toString().padStart(2, "0") : "dd";
        return `${yearText}-${monthText}-${dayText}`;
      }
      if (period === "custom") {
        const fromYearText = hasSelectedFromYear && fromYear ? fromYear : "yyyy";
        const fromMonthText =
          hasSelectedFromMonth && fromMonth !== null ? (fromMonth + 1).toString().padStart(2, "0") : "mm";
        const fromDayText = hasSelectedFromDay && fromDay ? fromDay.toString().padStart(2, "0") : "dd";
        const toYearText = hasSelectedToYear && toYear ? toYear : "yyyy";
        const toMonthText =
          hasSelectedToMonth && toMonth !== null ? (toMonth + 1).toString().padStart(2, "0") : "mm";
        const toDayText = hasSelectedToDay && toDay ? toDay.toString().padStart(2, "0") : "dd";
        return `${fromYearText}-${fromMonthText}-${fromDayText} - ${toYearText}-${toMonthText}-${toDayText}`;
      }
      if (period === "monthToDate") {
        const monthText = hasSelectedMonth && selectedMonth !== null ? months[selectedMonth] : "mm";
        return `${monthText} ${currentYear}`;
      }
      return "Pick a date";
    }

    try {
      if (period === "daily") {
        return format(dateRange.from, "yyyy-MM-dd");
      }
      if (period === "annual") {
        return `${dateRange.from.getUTCFullYear()}`;
      }
      if (period === "yearToDate") {
        const toDate = dateRange.to && !isNaN(dateRange.to.getTime()) ? dateRange.to : dateRange.from;
        return `${format(dateRange.from, "yyyy-MM-dd")} - ${format(toDate, "yyyy-MM-dd")}`;
      }
      if (period === "monthly" || period === "monthToDate") {
        return formatInTimeZone(dateRange.from, "UTC", "MMMM yyyy");
      }
      const toDate = dateRange.to && !isNaN(dateRange.to.getTime()) ? dateRange.to : dateRange.from;
      return `${format(dateRange.from, "yyyy-MM-dd")} - ${format(toDate, "yyyy-MM-dd")}`;
    } catch (error) {
      console.error("Error formatting date range:", error);
      return "Invalid date range";
    }
  };

  return (
    <div className={cn("grid gap-2 w-full")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {period === "annual" ? (
            <div className="p-3 text-left w-full">
              <Select
                value={hasSelectedYear && selectedYear ? selectedYear.toString() : ""}
                onValueChange={(value) => {
                  console.log("Annual Year Select:", { value });
                  handleAnnualSelect(value);
                }}
              >
                <SelectTrigger className="w-full">
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
            </div>
          ) : period === "yearToDate" ? (
            <div className="p-3 text-left w-full">
              <p className="text-sm">
                January 1, {selectedYear ?? currentYear} to {format(today, "MMMM d, yyyy")}
              </p>
            </div>
          ) : period === "monthly" ? (
            <div className="p-3 space-y-2 text-left w-full">
              <Select
                value={hasSelectedMonth && selectedMonth !== null ? selectedMonth.toString() : ""}
                onValueChange={(value) => {
                  console.log("Monthly Month Select:", { value });
                  handleMonthlySelect(value, (selectedYear ?? currentYear).toString());
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="mm" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem
                      key={month}
                      value={index.toString()}
                      disabled={(selectedYear ?? currentYear) === currentYear && index > currentMonth}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={hasSelectedYear && selectedYear ? selectedYear.toString() : ""}
                onValueChange={(value) => {
                  console.log("Monthly Year Select:", { value });
                  handleMonthlySelect((selectedMonth ?? currentMonth).toString(), value);
                }}
              >
                <SelectTrigger className="w-full">
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
            </div>
          ) : period === "monthToDate" ? (
            <div className="p-3 text-left w-full">
              <Select
                value={hasSelectedMonth && selectedMonth !== null ? selectedMonth.toString() : ""}
                onValueChange={(value) => {
                  console.log("MonthToDate Month Select:", { value });
                  handleMonthlySelect(value);
                }}
              >
                <SelectTrigger className="w-[120px] min-w-[120px]">
                  <SelectValue placeholder="mm" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem
                      key={month}
                      value={index.toString()}
                      disabled={index > currentMonth}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : period === "daily" ? (
            <div className="p-3 space-y-2 text-left w-full">
              <div className="flex space-x-2">
                <Select
                  value={hasSelectedYear && fromYear ? fromYear.toString() : ""}
                  onValueChange={(value) => {
                    const newYear = parseInt(value);
                    setFromYear(newYear);
                    setHasSelectedYear(true);
                    // Reset day if month/day is in future for 2025
                    let newMonth = fromMonth ?? currentMonth;
                    let newDay = fromDay ?? currentDay;
                    if (newYear === currentYear && newMonth > currentMonth) {
                      newMonth = currentMonth;
                      newDay = currentDay;
                      setFromMonth(newMonth);
                      setFromDay(newDay);
                    } else if (newYear === currentYear && newMonth === currentMonth && newDay > currentDay) {
                      newDay = currentDay;
                      setFromDay(newDay);
                    }
                    const maxDays = getDaysInMonth(newYear, newMonth);
                    if (newDay > maxDays) {
                      newDay = maxDays;
                      setFromDay(newDay);
                    }
                    console.log("Daily Year Select:", { value: newYear, fromMonth: newMonth, fromDay: newDay });
                    handleDailySelect(newYear, newMonth, newDay);
                  }}
                >
                  <SelectTrigger className="w-[100px] border-gray-300 rounded-md">
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
                  value={hasSelectedMonth && fromMonth !== null ? fromMonth.toString() : ""}
                  onValueChange={(value) => {
                    const newMonth = parseInt(value);
                    setFromMonth(newMonth);
                    setHasSelectedMonth(true);
                    // Reset day if day is in future for current year/month
                    let newDay = fromDay ?? currentDay;
                    if ((fromYear ?? currentYear) === currentYear && newMonth === currentMonth && newDay > currentDay) {
                      newDay = currentDay;
                      setFromDay(newDay);
                    }
                    const maxDays = getDaysInMonth(fromYear ?? currentYear, newMonth);
                    if (newDay > maxDays) {
                      newDay = maxDays;
                      setFromDay(newDay);
                    }
                    console.log("Daily Month Select:", { value: newMonth, fromDay: newDay });
                    handleDailySelect(fromYear ?? currentYear, newMonth, newDay);
                  }}
                >
                  <SelectTrigger className="w-[120px] min-w-[120px] border-gray-300 rounded-md">
                    <SelectValue placeholder="mm" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem
                        key={month}
                        value={index.toString()}
                        disabled={(fromYear ?? currentYear) === currentYear && index > currentMonth}
                      >
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={hasSelectedDay && fromDay ? fromDay.toString() : ""}
                  onValueChange={(value) => {
                    const newDay = parseInt(value);
                    setFromDay(newDay);
                    setHasSelectedDay(true);
                    console.log("Daily Day Select:", { value: newDay });
                    handleDailySelect(fromYear ?? currentYear, fromMonth ?? currentMonth, newDay);
                  }}
                >
                  <SelectTrigger className="w-[80px] border-gray-300 rounded-md">
                    <SelectValue placeholder="dd" />
                  </SelectTrigger>
                  <SelectContent>
                    {fromDays.map((day) => (
                      <SelectItem
                        key={day}
                        value={day.toString()}
                        disabled={
                          (fromYear ?? currentYear) === currentYear &&
                          (fromMonth ?? currentMonth) === currentMonth &&
                          day > currentDay
                        }
                      >
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-4 text-left w-full">
              <div>
                <label className="text-sm font-medium text-gray-700">From</label>
                <div className="flex space-x-2 mt-1">
                  <Select
                    value={hasSelectedFromYear && fromYear ? fromYear.toString() : ""}
                    onValueChange={(value) => {
                      const newYear = parseInt(value);
                      setFromYear(newYear);
                      setHasSelectedFromYear(true);
                      const maxDays = getDaysInMonth(newYear, fromMonth ?? currentMonth);
                      let newDay = fromDay ?? currentDay;
                      if (newDay > maxDays) {
                        newDay = maxDays;
                        setFromDay(newDay);
                      }
                      console.log("Custom From Year Select:", { value: newYear, fromDay: newDay });
                      handleCustomSelect(
                        newYear,
                        fromMonth ?? currentMonth,
                        newDay,
                        toYear ?? currentYear,
                        toMonth ?? currentMonth,
                        toDay ?? currentDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[100px] border-gray-300 rounded-md">
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
                    value={hasSelectedFromMonth && fromMonth !== null ? fromMonth.toString() : ""}
                    onValueChange={(value) => {
                      const newMonth = parseInt(value);
                      setFromMonth(newMonth);
                      setHasSelectedFromMonth(true);
                      const maxDays = getDaysInMonth(fromYear ?? currentYear, newMonth);
                      let newDay = fromDay ?? currentDay;
                      if (newDay > maxDays) {
                        newDay = maxDays;
                        setFromDay(newDay);
                      }
                      console.log("Custom From Month Select:", { value: newMonth, fromDay: newDay });
                      handleCustomSelect(
                        fromYear ?? currentYear,
                        newMonth,
                        newDay,
                        toYear ?? currentYear,
                        toMonth ?? currentMonth,
                        toDay ?? currentDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[120px] min-w-[120px] border-gray-300 rounded-md">
                      <SelectValue placeholder="mm" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={hasSelectedFromDay && fromDay ? fromDay.toString() : ""}
                    onValueChange={(value) => {
                      const newDay = parseInt(value);
                      setFromDay(newDay);
                      setHasSelectedFromDay(true);
                      console.log("Custom From Day Select:", { value: newDay });
                      handleCustomSelect(
                        fromYear ?? currentYear,
                        fromMonth ?? currentMonth,
                        newDay,
                        toYear ?? currentYear,
                        toMonth ?? currentMonth,
                        toDay ?? currentDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[80px] border-gray-300 rounded-md">
                      <SelectValue placeholder="dd" />
                    </SelectTrigger>
                    <SelectContent>
                      {fromDays.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">To</label>
                <div className="flex space-x-2 mt-1">
                  <Select
                    value={hasSelectedToYear && toYear ? toYear.toString() : ""}
                    onValueChange={(value) => {
                      const newYear = parseInt(value);
                      setToYear(newYear);
                      setHasSelectedToYear(true);
                      const maxDays = getDaysInMonth(newYear, toMonth ?? currentMonth);
                      let newDay = toDay ?? currentDay;
                      if (newDay > maxDays) {
                        newDay = maxDays;
                        setToDay(newDay);
                      }
                      console.log("Custom To Year Select:", { value: newYear, toDay: newDay });
                      handleCustomSelect(
                        fromYear ?? currentYear,
                        fromMonth ?? currentMonth,
                        fromDay ?? currentDay,
                        newYear,
                        toMonth ?? currentMonth,
                        newDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[100px] border-gray-300 rounded-md">
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
                    value={hasSelectedToMonth && toMonth !== null ? toMonth.toString() : ""}
                    onValueChange={(value) => {
                      const newMonth = parseInt(value);
                      setToMonth(newMonth);
                      setHasSelectedToMonth(true);
                      const maxDays = getDaysInMonth(toYear ?? currentYear, newMonth);
                      let newDay = toDay ?? currentDay;
                      if (newDay > maxDays) {
                        newDay = maxDays;
                        setToDay(newDay);
                      }
                      console.log("Custom To Month Select:", { value: newMonth, toDay: newDay });
                      handleCustomSelect(
                        fromYear ?? currentYear,
                        fromMonth ?? currentMonth,
                        fromDay ?? currentDay,
                        toYear ?? currentYear,
                        newMonth,
                        newDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[120px] min-w-[120px] border-gray-300 rounded-md">
                      <SelectValue placeholder="mm" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={hasSelectedToDay && toDay ? toDay.toString() : ""}
                    onValueChange={(value) => {
                      const newDay = parseInt(value);
                      setToDay(newDay);
                      setHasSelectedToDay(true);
                      console.log("Custom To Day Select:", { value: newDay });
                      handleCustomSelect(
                        fromYear ?? currentYear,
                        fromMonth ?? currentMonth,
                        fromDay ?? currentDay,
                        toYear ?? currentYear,
                        toMonth ?? currentMonth,
                        newDay
                      );
                    }}
                  >
                    <SelectTrigger className="w-[80px] border-gray-300 rounded-md">
                      <SelectValue placeholder="dd" />
                    </SelectTrigger>
                    <SelectContent>
                      {toDays.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}