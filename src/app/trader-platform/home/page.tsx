import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import { TraderPageClient } from "@/components/features/trader-page-client";
import { DateRange } from "react-day-picker";

// Define static metadata for the homepage
export const metadata = {
  title: "CTS | Prop Trading Fund",
  description: "Trade analytics for Prop Trading Fund, including performance metrics and profit distribution.",
};

export default async function Page() {
  // Hardcode trader details (same as TraderPage for consistency)
  const trader = "Prop Trading Fund";
  const accountNo = "U1673041"; // IB account number
  const phAccountNo = "PHU1673041"; // PH account number

  // Validate account number
  if (!accountNo) {
    return (
      <div className="flex items-center justify-center min-w-[48rem]">
        <Card className="max-w-3xl w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>No IB account number provided for trader: {trader}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch trade analytics or use mock data
  let analyticsData = analyticsMockData;
  let error = null;
  let displayedDateRange: DateRange | undefined = undefined; // Initialize date range
  const displayedMarket = "Global"; // Default market from API request

  try {
    const today = new Date();
    const startDate = startOfYear(today);
    displayedDateRange = { from: startDate, to: today }; // Set date range for TraderPageClient

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/trade-analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market: displayedMarket,
        account: accountNo,
        dateStart: startDate.toISOString().split("T")[0],
        dateEnd: today.toISOString().split("T")[0],
        isHoldingsIncluded: false,
      }),
    });

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
      trader={trader}
      accountNo={accountNo}
      phAccountNo={phAccountNo}
      initialData={analyticsData}
      initialError={error}
      displayedDateRange={displayedDateRange}
      displayedMarket={displayedMarket}
    />
  );
}