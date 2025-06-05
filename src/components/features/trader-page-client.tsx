"use client";

import { useState, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { EquityCurve } from "@/components/features/equity-curve";
import { TradeCalendar } from "./daily-calendar-return";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TraderPageClientProps {
  trader: string;
  accountNo: string;
  phAccountNo: string;
  initialData?: any;
  initialError?: string | null;
  displayedDateRange: DateRange | undefined;
  displayedMarket: string;
}

export function TraderPageClient({
  trader,
  accountNo,
  phAccountNo,
  initialData,
  initialError,
  displayedDateRange,
  displayedMarket,
}: TraderPageClientProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(displayedDateRange);
  const [market, setMarket] = useState(displayedMarket);

  // Memoize dateRange to prevent unnecessary re-renders
  const stableDateRange = useMemo(() => dateRange, [dateRange]);

  console.log("TraderPageClient initialized", {
    displayedDateRange: {
      from: stableDateRange?.from?.toISOString(),
      to: stableDateRange?.to?.toISOString(),
    },
    displayedMarket: market,
    initialData: initialData ? JSON.stringify(initialData, null, 2) : null,
  });

  const handleMarketChange = useCallback((newMarket: string) => {
    console.log("Market changed to:", {
      market: newMarket,
      displayedDateRange: {
        from: stableDateRange?.from?.toISOString(),
        to: stableDateRange?.to?.toISOString(),
      },
    });
    setMarket(newMarket);
  }, [stableDateRange]);

  return (
    <div className="flex flex-col items-center min-w-[48rem] pt-14 gap-4 pb-6 px-4 font-sans text-sm font-normal">
      <div className="fixed top-0 left-64 right-0 z-10 bg-white dark:bg-gray-900 max-w-3xl w-full mx-auto flex justify-center items-center py-5">
        <Tabs
          value={market}
          onValueChange={handleMarketChange}
          className="w-full max-w-3xl mx-auto flex justify-center"
        >
          <TabsList className="grid w-full grid-cols-5 mx-auto max-w-3xl text-sm font-semibold">
            <TabsTrigger value="IB">IB</TabsTrigger>
            <TabsTrigger value="US">US</TabsTrigger>
            <TabsTrigger value="HK">HK</TabsTrigger>
            <TabsTrigger value="JP">JP</TabsTrigger>
            <TabsTrigger value="PH">PH</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <TradeAnalytics
        trader={trader}
        accountNo={accountNo}
        phAccountNo={phAccountNo}
        initialData={initialData}
        initialError={initialError}
        displayedDateRange={stableDateRange}
        setDisplayedDateRange={setDateRange}
        displayedMarket={market}
      />
      <EquityCurve
        accountNo={accountNo}
        phAccountNo={phAccountNo}
        market={market}
      />
      <TradeCalendar
        accountNo={accountNo}
        phAccountNo={phAccountNo}
        market={market}
      />
    </div>
  );
}