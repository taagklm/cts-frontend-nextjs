"use client";

import { EquityCurve } from "@/components/features/equity-curve";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { useState, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeCalendar } from "./daily-calendar-return";

interface TraderPageClientProps {
  trader: string;
  accountNo: string;
  phAccountNo: string;
  initialData?: any;
  initialError?: string | null;
}

export function TraderPageClient({
  trader,
  accountNo,
  phAccountNo,
  initialData,
  initialError,
}: TraderPageClientProps) {
  const today = new Date();
  const [displayedDateRange, setDisplayedDateRange] = useState<DateRange | undefined>({
    from: startOfYear(today),
    to: today,
  });
  const [displayedMarket, setDisplayedMarket] = useState("IB");

  const handleMarketChange = useCallback((market: string) => {
    console.log("Market changed to:", market);
    setDisplayedMarket(market);
  }, []);

  return (
    <div className="flex flex-col items-center min-w-[48rem] pt-14 gap-4 pb-6 px-4 font-sans text-sm font-normal">
      <div className="fixed top-0 left-64 right-0 z-10 bg-white dark:bg-gray-900 max-w-3xl w-full mx-auto flex justify-center items-center py-6">
        <Tabs
          value={displayedMarket}
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
        displayedDateRange={displayedDateRange}
        setDisplayedDateRange={setDisplayedDateRange}
        displayedMarket={displayedMarket}
        handleMarketChange={handleMarketChange}
      />
      <EquityCurve
        accountNo={accountNo}
        phAccountNo={phAccountNo}
        market={displayedMarket}
      />
      <TradeCalendar />
    </div>
  );
}