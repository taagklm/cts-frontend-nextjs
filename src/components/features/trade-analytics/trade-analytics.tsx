"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsTable } from "./stats-table";
import { WinnersTable } from "./winners-table";
import { LosersTable } from "./losers-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BurgerMenu } from "./burger-menu/burger-menu";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ProfitDistributionChart } from "./profit-distribution-chart";

interface TradeAnalyticsResponse {
  longAndShort: TradeAnalyticsBundle;
  long: TradeAnalyticsBundle;
  short: TradeAnalyticsBundle;
  data: TradeAnalyticsData;
}

interface TradeAnalyticsBundle {
  overallStats: OverallStats;
  primarySetupStats: Record<string, Stats>;
}

interface OverallStats {
  stats: Stats;
  topWinners: TradeblockPerformance[];
  topLosers: TradeblockPerformance[];
  profitDistribution: ProfitDistributionBracket[];
}

interface Stats {
  aum?: number | null;
  numberOfTrades: number;
  returnUsd?: number | null;
  returnPhp?: number | null;
  returnPercentage?: number | null;
  realizedPnlUsd?: number | null;
  realizedPnlPhp?: number | null;
  unrealizedPnlUsd?: number | null;
  unrealizedPnlPhp?: number | null;
  hitRatio: number;
  edgeRatio: number;
  totalProfit: number;
  totalLoss: number;
  numberOfWins: number;
  numberOfLosses: number;
  averageProfit: number;
  averageLoss: number;
  churn?: number | null;
}

interface TradeblockPerformance {
  dateEntered: string;
  symbol: string;
  totalReturn: number;
  realizedReturn: number;
  unrealizedReturn: number;
  currency: string;
}

interface ProfitDistributionBracket {
  rangeStart?: number | null;
  rangeEnd?: number | null;
  count: number;
}

interface TradeAnalyticsData {
  tradeblockIds: number[];
  transactionIds: number[];
}

interface TradeAnalyticsProps {
  trader: string;
  accountNo: string;
  phAccountNo: string;
  initialData?: TradeAnalyticsResponse | null;
  initialError?: string | null;
  displayedDateRange: DateRange | undefined;
  setDisplayedDateRange: (range: DateRange | undefined) => void;
  displayedMarket: string;
}

const today = new Date();
const initialDateRange: DateRange = {
  from: new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)),
  to: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
};

export function TradeAnalytics({
  trader,
  accountNo,
  phAccountNo,
  initialData,
  initialError,
  displayedDateRange,
  setDisplayedDateRange,
  displayedMarket,
}: TradeAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"longAndShort" | "long" | "short">("longAndShort");
  const [includeHoldings, setIncludeHoldings] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<TradeAnalyticsResponse | null>(initialData || null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [requestArgs, setRequestArgs] = useState<object | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchedRange, setLastFetchedRange] = useState<{ dateStart: string; dateEnd: string } | null>(null);

  console.log("TradeAnalytics: Initializing", {
    initialData: initialData ? JSON.stringify(initialData, null, 2) : null,
    initialDateRange,
    from: initialDateRange.from?.toISOString(),
    to: initialDateRange.to?.toISOString(),
    displayedDateRange,
    fromDisplayed: displayedDateRange?.from?.toISOString(),
    toDisplayed: displayedDateRange?.to?.toISOString(),
    filtersApplied,
    isMounted,
    lastFetchedRange,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const marketNames: { [key: string]: string } = {
    IB: "Global",
    US: "United States",
    HK: "Hong Kong",
    JP: "Japan",
    PH: "Philippines",
  };

  const fetchAnalytics = useCallback(async () => {
    if (isFetching) {
      console.log("fetchAnalytics skipped: Already fetching");
      return;
    }

    if (!displayedDateRange?.from || !displayedDateRange?.to) {
      console.log("fetchAnalytics skipped: Invalid date range", { displayedDateRange });
      return;
    }

    const dateStart = displayedDateRange.from.toISOString().split("T")[0];
    const dateEnd = displayedDateRange.to.toISOString().split("T")[0];

    if (
      lastFetchedRange &&
      lastFetchedRange.dateStart === dateStart &&
      lastFetchedRange.dateEnd === dateEnd
    ) {
      console.log("fetchAnalytics skipped: Same date range already fetched", {
        lastFetchedRange,
        dateStart,
        dateEnd,
      });
      return;
    }

    console.log("fetchAnalytics started", {
      dateStart,
      dateEnd,
      displayedMarket,
      includeHoldings,
      timestamp: new Date().toISOString(),
    });

    setIsFetching(true);
    const accountForMarket = displayedMarket === "PH" && phAccountNo ? phAccountNo : accountNo;
    const args = {
      market: displayedMarket === "IB" ? "Global" : displayedMarket,
      account: accountForMarket,
      dateStart,
      dateEnd,
      isHoldingsIncluded: includeHoldings,
      tags: null,
    };

    console.log("Sending request to /api/trade-analytics:", {
      url: "/api/trade-analytics",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args, null, 2),
    });
    setRequestArgs(args);

    try {
      const response = await fetch("/api/trade-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(30000),
      });

      console.log("Fetch response received:", { status: response.status, ok: response.ok });
      const result = await response.json();
      console.log("API Response:", {
        result: JSON.stringify(result, null, 2),
        realizedPnlUsd: result?.longAndShort?.overallStats?.stats?.realizedPnlUsd,
      });

      if (response.ok) {
        if (result?.longAndShort?.overallStats?.stats?.numberOfTrades === 0) {
          setError("No trades found for the selected date range");
          setAnalyticsData(null);
        } else {
          setAnalyticsData(result);
          setError(null);
        }
        setRefreshKey((prev) => prev + 1);
        setLastFetchedRange({ dateStart, dateEnd });
        setFiltersApplied(false);
      } else {
        throw new Error(result.error || "Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalyticsData(null);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
      setRefreshKey((prev) => prev + 1);
    } finally {
      setIsFetching(false);
    }
  }, [displayedMarket, displayedDateRange, includeHoldings, accountNo, phAccountNo]);

  const isDateRangeDifferent = useMemo(() => {
    if (!displayedDateRange?.from || !displayedDateRange?.to) return false;
    const dateStart = displayedDateRange.from.toISOString().split("T")[0];
    const dateEnd = displayedDateRange.to.toISOString().split("T")[0];
    return (
      dateStart !== initialDateRange.from?.toISOString().split("T")[0] ||
      dateEnd !== initialDateRange.to?.toISOString().split("T")[0]
    );
  }, [displayedDateRange]);

  useEffect(() => {
    if (isMounted && filtersApplied && isDateRangeDifferent) {
      console.log("useEffect: Triggering fetchAnalytics", {
        displayedDateRange,
        from: displayedDateRange?.from?.toISOString(),
        to: displayedDateRange?.to?.toISOString(),
        fromDateOnly: displayedDateRange?.from?.toISOString().split("T")[0],
        toDateOnly: displayedDateRange?.to?.toISOString().split("T")[0],
        isDateRangeDifferent,
        filtersApplied,
        timestamp: new Date().toISOString(),
      });
      fetchAnalytics();
    }
  }, [fetchAnalytics, filtersApplied, isMounted, isDateRangeDifferent]);

  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleApplyFilters = useCallback(
    debounce((newDateRange: DateRange | undefined, newIncludeHoldings: boolean) => {
      console.log("handleApplyFilters triggered", {
        newDateRange,
        from: newDateRange?.from?.toISOString(),
        to: newDateRange?.to?.toISOString(),
        fromDateOnly: newDateRange?.from?.toISOString().split("T")[0],
        toDateOnly: newDateRange?.to?.toISOString().split("T")[0],
        newIncludeHoldings,
        timestamp: new Date().toISOString(),
      });
      if (!newDateRange || !newDateRange.from || !newDateRange.to || isNaN(newDateRange.from.getTime()) || isNaN(newDateRange.to.getTime())) {
        console.log("handleApplyFilters: Invalid date range", { newDateRange });
        setError("Invalid date range selected");
        return;
      }
      console.log("handleApplyFilters: Applying filters", { newDateRange, newIncludeHoldings });
      setDisplayedDateRange(newDateRange);
      setIncludeHoldings(newIncludeHoldings);
      setFiltersApplied(true);
    }, 300),
    [setDisplayedDateRange, setError]
  );

  const handleTabChange = useCallback((val: string) => {
    console.log("Tab changed to:", val);
    setActiveTab(val as "longAndShort" | "long" | "short");
  }, []);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      console.log("formatDateRange: No date selected", { range });
      return "No date selected";
    }
    const formatted = (() => {
      if (!range.to) return format(range.from, "MMMM d, yyyy");
      return `${format(range.from, "MMMM d, yyyy")} to ${format(range.to, "MMMM d, yyyy")}`;
    })();
    console.log("formatDateRange result:", {
      range,
      from: range?.from?.toISOString(),
      to: range?.to?.toISOString(),
      fromDateOnly: range?.from?.toISOString().split("T")[0],
      toDateOnly: range?.to?.toISOString().split("T")[0],
      formatted,
    });
    return formatted;
  };

  const getCurrency = () => {
    switch (displayedMarket) {
      case "PH":
        return "PHP";
      case "HK":
        return "HKD";
      case "JP":
        return "JPY";
      case "US":
      case "IB":
      default:
        return "USD";
    }
  };

  if (error || !analyticsData) {
    console.log("Rendering error state", { error, hasAnalyticsData: !!analyticsData });
    return (
      <div className="flex items-center justify-center font-sans text-sm font-normal min-w-[48rem]">
        {/* Added font-sans text-sm font-normal to match TradeblocksTable */}
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-red-500">
              {/* Updated to text-2xl font-semibold text-red-500 */}
              Trade Analytics
            </CardTitle>
            <CardDescription className="text-sm font-normal">
              {/* Updated to text-sm font-normal */}
              {error || "No data available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-normal">Request Arguments:</p>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-sm font-normal">
              {JSON.stringify(requestArgs, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mapAnalyticsData = (bundle: TradeAnalyticsBundle) => {
    console.log("Mapping bundle:", JSON.stringify(bundle.overallStats.stats, null, 2));
    return {
      aum: bundle.overallStats.stats.aum,
      numberOfTrades: bundle.overallStats.stats.numberOfTrades,
      returnUsd: bundle.overallStats.stats.returnUsd,
      returnPhp: bundle.overallStats.stats.returnPhp,
      returnPercentage: bundle.overallStats.stats.returnPercentage,
      realizedPnlUsd: bundle.overallStats.stats.realizedPnlUsd,
      realizedPnlPhp: bundle.overallStats.stats.realizedPnlPhp,
      unrealizedPnlUsd: bundle.overallStats.stats.unrealizedPnlUsd,
      unrealizedPnlPhp: bundle.overallStats.stats.unrealizedPnlPhp,
      hitRatio: bundle.overallStats.stats.hitRatio,
      edgeRatio: bundle.overallStats.stats.edgeRatio,
      totalProfit: bundle.overallStats.stats.totalProfit,
      totalLoss: bundle.overallStats.stats.totalLoss,
      numberOfWins: bundle.overallStats.stats.numberOfWins,
      numberOfLosses: bundle.overallStats.stats.numberOfLosses,
      averageProfit: bundle.overallStats.stats.averageProfit,
      averageLoss: bundle.overallStats.stats.averageLoss,
      churn: bundle.overallStats.stats.churn,
      topWinners: bundle.overallStats.topWinners,
      topLosers: bundle.overallStats.topLosers,
      profitDistribution: bundle.overallStats.profitDistribution,
    };
  };

  const activeData =
    activeTab === "longAndShort"
      ? mapAnalyticsData(analyticsData.longAndShort)
      : activeTab === "long"
        ? mapAnalyticsData(analyticsData.long)
        : mapAnalyticsData(analyticsData.short);

  console.log("Mapped Active Data:", {
    data: JSON.stringify(activeData, null, 2),
    realizedPnlUsd: activeData.realizedPnlUsd,
  });

  return (
    <div className="flex flex-col items-center font-sans text-sm font-normal min-w-[48rem] pt-6 gap-4 pb-0">
      {/* Added font-sans text-sm font-normal to match TradeblocksTable */}
      <Card className="max-w-3xl w-full pb-3">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <CardTitle className="text-2xl font-semibold">
                Trade Analytics
              </CardTitle>
            </div>
            <BurgerMenu
              onExportReport={() => console.log("Exporting Report as PDF from TradeAnalytics")}
              onExportTradeblocks={() => console.log("Exporting Tradeblocks as CSV from TradeAnalytics")}
              onExportTransactions={() => console.log("Exporting Transactions as CSV from TradeAnalytics")}
              dateRange={displayedDateRange}
              setDateRange={setDisplayedDateRange}
              includeHoldings={includeHoldings}
              setIncludeHoldings={setIncludeHoldings}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          <CardDescription className="pb-1 pt-0 text-sm font-normal text-left">
            {/* Updated to text-sm font-normal */}
            {`${marketNames[displayedMarket] || "Global"} Market from ${formatDateRange(displayedDateRange)}. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
          <Tabs
            key={`tabs-${refreshKey}`}
            value={activeTab}
            onValueChange={handleTabChange}
            className="pt-1 pb-0"
          >
            <TabsList className="grid w-full grid-cols-3 text-sm font-semibold">
              {/* Retained text-sm font-semibold as it matches TradeblocksTable table headers */}
              <TabsTrigger value="longAndShort">LONG & SHORT</TabsTrigger>
              <TabsTrigger value="long">LONG</TabsTrigger>
              <TabsTrigger value="short">SHORT</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pb-0 pt-0">
          <div className="grid grid-cols-9">
            <div className="col-span-5">
              <StatsTable data={activeData} selectedMarket={displayedMarket} />
            </div>
            <div className="col-span-4">
              <div className="grid grid-rows-2">
                <div className="row-span-1">
                  <WinnersTable winners={activeData.topWinners} selectedMarket={displayedMarket} />
                </div>
                <div className="row-span-1">
                  <LosersTable losers={activeData.topLosers} selectedMarket={displayedMarket} />
                </div>
              </div>
            </div>
          </div>
          <ProfitDistributionChart data={activeData} />
        </CardContent>
      </Card>
    </div>
  );
}