"use client";

import { useState, useEffect, useCallback } from "react";
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

interface TradeAnalyticsProps {
  trader: string;
  accountNo: string;
  phAccountNo: string;
  initialData?: TradeAnalyticsResponse | null;
  initialError?: string | null;
  displayedDateRange: DateRange | undefined;
  setDisplayedDateRange: (range: DateRange | undefined) => void;
  displayedMarket: string;
  handleMarketChange: (market: string) => void;
}

export function TradeAnalytics({
  trader,
  accountNo,
  phAccountNo,
  initialData,
  initialError,
  displayedDateRange,
  setDisplayedDateRange,
  displayedMarket,
  handleMarketChange,
}: TradeAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"longshort" | "long" | "short">("longshort");
  const [displayedPeriod, setDisplayedPeriod] = useState<string>("yearToDate");
  const [includeHoldings, setIncludeHoldings] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<TradeAnalyticsResponse | null>(initialData || null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [requestArgs, setRequestArgs] = useState<object | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState<boolean>(!!initialData || !!initialError);

  const marketNames: { [key: string]: string } = {
    IB: "Global",
    US: "United States",
    HK: "Hong Kong",
    JP: "Japan",
    PH: "Philippines",
  };

  const fetchAnalytics = useCallback(async () => {
    console.log("fetchAnalytics started", { displayedDateRange, displayedMarket, includeHoldings });
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

    console.log("Preparing Trade Analytics with args:", args);
    setRequestArgs(args);

    const requestDetails = {
      url: "/api/trade-analytics",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    };
    console.log("API Request Details:", requestDetails);

    try {
      console.log("Sending fetch request to /api/trade-analytics");
      const response = await fetch("/api/trade-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(10000),
      });

      console.log("Fetch response received:", { status: response.status, ok: response.ok });
      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        setAnalyticsData(result);
        setError(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error(result.error || "Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalyticsData(null);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
      setRefreshKey((prev) => prev + 1);
    }
  }, [displayedMarket, displayedDateRange, includeHoldings, accountNo, phAccountNo]);

  useEffect(() => {
    if (!isInitialFetchDone) {
      console.log("Triggering initial fetchAnalytics");
      fetchAnalytics();
      setIsInitialFetchDone(true);
    }
  }, [fetchAnalytics, isInitialFetchDone]);

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
    [setDisplayedDateRange],
  );

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
    return `Raw Dates - From: ${range.from.toISOString().split("T")[0]} | To: ${range.to ? range.to.toISOString().split("T")[0] : "N/A"}`;
  };

  if (error || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-red-500">Error Fetching Trade Analytics</CardTitle>
            <CardDescription className="text-sm font-normal">{error || "No data available"}</CardDescription>
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
    <div className="flex flex-col items-center min-w-[48rem] pt-6 gap-4 pb-0">
      <Card className="max-w-3xl w-full pb-3">
        <CardHeader className="pb-0">
          <div className="grid grid-cols-5">
            <div className="col-span-4">
              <CardTitle className="text-2xl font-semibold">Trade Analytics</CardTitle>
            </div>
            <BurgerMenu
              onExportReport={() => console.log("Exporting Report as PDF from TradeAnalytics")}
              onExportTradeblocks={() => console.log("Exporting Tradeblocks as CSV from TradeAnalytics")}
              onExportTransactions={() => console.log("Exporting Transactions as CSV from TradeAnalytics")}
              dateRange={displayedDateRange}
              setDateRange={setDisplayedDateRange}
              period={displayedPeriod}
              setPeriod={setDisplayedPeriod}
              includeHoldings={includeHoldings}
              setIncludeHoldings={setIncludeHoldings}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          <CardDescription className="pb-1 pt-0 text-sm font-normal text-left">
            {`${marketNames[displayedMarket] || "Global"} Market from ${formatDateRange(displayedDateRange)}. The values displayed are in ${displayedMarket === "PH" ? getCurrency() : "USD"}.`}
          </CardDescription>
          <Tabs
            key={`tabs-${refreshKey}`}
            value={activeTab}
            onValueChange={handleTabChange}
            className="pt-1 pb-0"
          >
            <TabsList className="grid w-full grid-cols-3 text-sm font-semibold">
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