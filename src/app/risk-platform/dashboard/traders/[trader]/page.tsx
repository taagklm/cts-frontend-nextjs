import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import { TraderPageClient } from "@/components/features/trader-page-client";
import { DateRange } from "react-day-picker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trader: string }>;
}) {
  const { trader } = await params;
  const decodedTrader = decodeURIComponent(trader);
  return {
    title: "CTS | " + decodedTrader,
    description: `Trade analytics for ${decodedTrader}, including performance metrics and profit distribution.`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ trader: string }>;
  searchParams: Promise<{ ibAccountNo?: string; phAccountNo?: string }>;
}) {
  const { trader } = await params;
  const { ibAccountNo, phAccountNo } = await searchParams;
  const decodedTrader = decodeURIComponent(trader);

  const accountNo = ibAccountNo || "";
  const phAccountNoValue = phAccountNo || "";

  if (!accountNo) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>No IB account number provided for trader: {decodedTrader}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  let analyticsData: any = null; // Replace 'any' with actual type if known
  let error: string | null = null;
  const today = new Date();
  const dateStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString().split("T")[0]; // 2025-05-01
  const dateEnd = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().split("T")[0]; // 2025-05-29

  console.log("Server: Fetching analytics data", {
    trader,
    accountNo,
    dateStart,
    dateEnd,
    timestamp: new Date().toISOString(),
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/trade-analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market: "Global",
        account: accountNo,
        dateStart,
        dateEnd,
        isHoldingsIncluded: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      analyticsData = await response.json();
      console.log("Server: API Response", JSON.stringify(analyticsData, null, 2));
    } else {
      error = (await response.json()).error || "Failed to fetch trade analytics";
      analyticsData = analyticsMockData; // Fallback to mock data
      console.log("Server: API Error", { error });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Network error";
    analyticsData = analyticsMockData; // Fallback to mock data
    console.log("Server: Fetch Error", { error });
  }

  const displayedDateRange: DateRange = {
    from: new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)),
    to: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
  };

  console.log("Server: Passing props to TraderPageClient", {
    trader: decodedTrader,
    accountNo,
    phAccountNo: phAccountNoValue,
    initialData: analyticsData ? JSON.stringify(analyticsData, null, 2) : null,
    initialError: error,
    displayedDateRange: {
      from: displayedDateRange.from?.toISOString(),
      to: displayedDateRange.to?.toISOString(),
    },
    displayedMarket: "IB",
  });

  return (
    <TraderPageClient
      trader={decodedTrader}
      accountNo={accountNo}
      phAccountNo={phAccountNoValue}
      initialData={analyticsData}
      initialError={error}
      displayedDateRange={displayedDateRange}
      displayedMarket="IB"
    />
  );
}