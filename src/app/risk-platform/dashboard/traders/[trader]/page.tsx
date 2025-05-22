import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import { TraderPageClient } from "@/components/features/trader-page-client";

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

  let analyticsData = analyticsMockData;
  let error = null;
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const dateStart = `${currentYear}-01-01`
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);  // 30 seconds timeout
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/trade-analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market: "Global",
        account: accountNo,
        dateStart: dateStart,
        dateEnd: format(today, "yyyy-MM-dd"),
        isHoldingsIncluded: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId); // Clear timeout if request completes

    if (response.ok) {
      analyticsData = await response.json();
    } else {
      error = (await response.json()).error || "Failed to fetch trade analytics";
      analyticsData = analyticsMockData; // Fallback to mock data
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Network error";
    analyticsData = analyticsMockData; // Fallback to mock data
  }

  return (
    <TraderPageClient
      trader={decodedTrader}
      accountNo={accountNo}
      phAccountNo={phAccountNoValue}
      initialData={analyticsData}
      initialError={error}
    />
  );
}