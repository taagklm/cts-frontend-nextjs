"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsTable } from "./stats-table";
import { WinnersTable } from "./winners-table";
import { LosersTable } from "./losers-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BurgerMenu } from "./burger-menu/burger-menu";
import { DateRange } from "react-day-picker";
import { format, startOfYear } from "date-fns";
import { ProfitDistributionChart } from "./profit-distribution-chart";

// Import normalizeDateToUTC for consistent date handling
function normalizeDateToUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// Define interfaces matching TradeAnalyticsResponseDto from backend
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
  hit: number;
  edge: number;
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

// Define component props
interface TradeAnalyticsProps {
  trader: string;
  accountNo: string;
  phAccountNo: string;
  initialData?: TradeAnalyticsResponse | null;
  initialError?: string | null;
}

export function TradeAnalytics({ trader, accountNo, phAccountNo, initialData, initialError }: TradeAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"longshort" | "long" | "short">("longshort");
  const [displayedMarket, setDisplayedMarket] = useState("IB");
  const today = new Date();
  // Initialize date range to year-to-date with UTC normalization
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: normalizeDateToUTC(startOfYear(today)), // Ensure 2025-01-01
    to: normalizeDateToUTC(today), // Ensure current date
  });
  const [displayedDateRange, setDisplayedDateRange] = useState<DateRange | undefined>({
    from: normalizeDateToUTC(startOfYear(today)), // Ensure 2025-01-01
    to: normalizeDateToUTC(today), // Ensure current date
  });
  const [displayedPeriod, setDisplayedPeriod] = useState<string>("yearToDate");
  const [includeHoldings, setIncludeHoldings] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<TradeAnalyticsResponse | null>(initialData || null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing re-render
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(!!initialData || !!initialError);

  const marketNames: { [key: string]: string } = {
    IB: "Global",
    US: "United States",
    HK: "Hong Kong",
    JP: "Japan",
    PH: "Philippines",
  };

  // Fetch analytics data when filters are applied
  const fetchAnalytics = useCallback(async () => {
    if (!displayedDateRange?.from) {
      console.log("fetchAnalytics aborted: No valid displayedDateRange.from");
      setError("Invalid date range selected");
      return;
    }

    const accountForMarket = displayedMarket === "PH" && phAccountNo ? phAccountNo : accountNo;
    const args = {
      market: displayedMarket === "IB" ? "Global" : displayedMarket,
      account: accountForMarket,
      dateStart: displayedDateRange.from.toISOString().split("T")[0],
      dateEnd: displayedDateRange.to?.toISOString().split("T")[0] ?? displayedDateRange.from.toISOString().split("T")[0],
      isHoldingsIncluded: includeHoldings,
      tags: null,
    };

    const requestDetails = {
      url: "/api/trade-analytics",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    };
    // Log API request details
    console.log("API Request Initiated (trade-analytics.tsx):", {
      requestDetails,
      filterState: { displayedDateRange, displayedPeriod, includeHoldings, displayedMarket },
    });

    try {
      console.log("Sending fetch request to /api/trade-analytics");
      const response = await fetch("/api/trade-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(10000),
      });

      console.log("Fetch response received (trade-analytics.tsx):", { status: response.status, ok: response.ok });
      const result = await response.json();
      console.log("API Response (trade-analytics.tsx):", result);

      if (response.ok) {
        setAnalyticsData(result);
        setError(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error(result.error || "Failed to fetch analytics data (trade-analytics.tsx)");
      }
    } catch (err) {
      console.error("Error fetching analytics (trade-analytics.tsx):", err);
      setAnalyticsData(null);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data (trade-analytics.tsx)");
      setRefreshKey((prev) => prev + 1);
    }
  }, [displayedMarket, displayedDateRange, includeHoldings, accountNo, phAccountNo]);

  // Initial fetch only if no initialData is provided
  useEffect(() => {
    if (!isInitialFetchDone) {
      console.log("Triggering initial fetchAnalytics");
      fetchAnalytics();
      setIsInitialFetchDone(true);
    }
  }, [fetchAnalytics, isInitialFetchDone]);

  // Fetch analytics when filter states change
  useEffect(() => {
    if (isInitialFetchDone) {
      console.log("Filter states changed, triggering fetchAnalytics:", {
        displayedDateRange,
        displayedPeriod,
        includeHoldings,
        displayedMarket,
      });
      fetchAnalytics();
    }
  }, [displayedDateRange, displayedPeriod, includeHoldings, displayedMarket, fetchAnalytics, isInitialFetchDone]);

  // Handle apply filters by updating filter states
  const handleApplyFilters = useCallback(
    (newDateRange: DateRange | undefined, newPeriod: string, newIncludeHoldings: boolean) => {
      console.log("handleApplyFilters triggered in trade-analytics.tsx", {
        newDateRange,
        newPeriod,
        newIncludeHoldings,
      });
      setDisplayedDateRange(newDateRange);
      setDisplayedPeriod(newPeriod);
      setIncludeHoldings(newIncludeHoldings);
    },
    [],
  );

  const handleMarketChange = useCallback((market: string) => {
    console.log("Market changed to:", market);
    setDisplayedMarket(market);
  }, []);

  const handleTabChange = useCallback((val: string) => {
    console.log("Tab changed to:", val);
    setActiveTab(val as "longshort" | "long" | "short");
  }, []);

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "No date selected";
    if (displayedPeriod === "daily") {
      return format(range.from, "MMMM d, yyyy");
    }
    if (displayedPeriod === "monthly") {
      return format(range.from, "MMMM yyyy");
    }
    if (displayedPeriod === "annual") {
      return range.from.getFullYear().toString();
    }
    if (displayedPeriod === "yearToDate") {
      return `${format(range.from, "MMMM d, yyyy")} to ${format(range.to || range.from, "MMMM d, yyyy")}`;
    }
    if (!range.to) return format(range.from, "MMMM d, yyyy");
    return `${format(range.from, "MMMM d, yyyy")} to ${format(range.to, "MMMM d, yyyy")}`;
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

  const displayRawDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return "No date range selected";
    // Ensure raw dates are displayed in UTC yyyy-MM-dd format
    return `Raw Dates - From: ${range.from.toISOString().split("T")[0]} | To: ${range.to ? range.to.toISOString().split("T")[0] : "N/A"}`;
  };

  if (error || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error Fetching Trade Analytics</CardTitle>
            <CardDescription>{error || "No data available"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Map API data to component's expected format
  const mapAnalyticsData = (bundle: TradeAnalyticsBundle) => {
    console.log("Mapping bundle:", bundle);
    return {
      numberOfTrades: bundle.overallStats.stats.numberOfTrades,
      aum: bundle.overallStats.stats.aum,
      returnUsd: bundle.overallStats.stats.returnUsd,
      returnPhp: bundle.overallStats.stats.returnPhp,
      returnPercentage: bundle.overallStats.stats.returnPercentage,
      realizedPnlUsd: bundle.overallStats.stats.realizedPnlUsd,
      realizedPnlPhp: bundle.overallStats.stats.realizedPnlPhp,
      unrealizedPnlUsd: bundle.overallStats.stats.unrealizedPnlUsd,
      unrealizedPnlPhp: bundle.overallStats.stats.unrealizedPnlPhp,
      hitRatio: bundle.overallStats.stats.hit,
      edgeRatio: bundle.overallStats.stats.edge,
      totalProfit: bundle.overallStats.stats.totalProfit,
      totalLoss: bundle.overallStats.stats.totalLoss,
      numberOfWins: bundle.overallStats.stats.numberOfWins,
      numberOfLosses: bundle.overallStats.stats.numberOfLosses,
      averageProfit: bundle.overallStats.stats.averageProfit,
      averageLoss: bundle.overallStats.stats.averageLoss,
      topWinners: bundle.overallStats.topWinners,
      topLosers: bundle.overallStats.topLosers,
      profitDistribution: bundle.overallStats.profitDistribution,
    };
  };

  const activeData =
    activeTab === "longshort"
      ? mapAnalyticsData(analyticsData.longAndShort)
      : activeTab === "long"
        ? mapAnalyticsData(analyticsData.long)
        : mapAnalyticsData(analyticsData.short);

  console.log("Mapped Active Data:", activeData);

  return (
    <div className="flex flex-col items-center min-w-[48rem] pt-4 gap-4">
      {/* Market TabsList placed at the top, vertically stacked */}
      <Tabs
        value={displayedMarket}
        onValueChange={handleMarketChange}
        className="w-full max-w-3xl"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="IB">IB</TabsTrigger>
          <TabsTrigger value="US">US</TabsTrigger>
          <TabsTrigger value="HK">HK</TabsTrigger>
          <TabsTrigger value="JP">JP</TabsTrigger>
          <TabsTrigger value="PH">PH</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="max-w-3xl w-full">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <CardTitle className="text-2xl pb-0">Trade Analytics</CardTitle>
            </div>
            <BurgerMenu
              onExportReport={() => console.log("Exporting Report as PDF from TradeAnalytics")}
              onExportTradeblocks={() => console.log("Exporting Tradeblocks as CSV from TradeAnalytics")}
              onExportTransactions={() => console.log("Exporting Transactions as CSV from TradeAnalytics")}
              dateRange={dateRange}
              setDateRange={setDateRange}
              period={displayedPeriod}
              setPeriod={setDisplayedPeriod}
              includeHoldings={includeHoldings}
              setIncludeHoldings={setIncludeHoldings}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          <CardDescription className="pb-2 pt-0">
            {`${marketNames[displayedMarket] || "Global"} Market from ${formatDateRange(displayedDateRange)}. The values displayed are in ${getCurrency()}.`}
          </CardDescription>
          <Tabs
            key={`tabs-${refreshKey}`}
            value={activeTab}
            onValueChange={handleTabChange}
            className="pt-1 pb-0"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="longshort">LONG & SHORT</TabsTrigger>
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