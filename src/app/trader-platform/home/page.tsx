import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics"; // Adjust path to your TradeAnalytics mockData file

// Define static metadata for the hardcoded trader
export const metadata = {
  title: "CTS | Prop Trading Fund",
  description: "Trade analytics for Prop Trading Fund, including performance metrics and profit distribution.",
};

export default async function TraderPage() {
  // Hardcode trader details
  const decodedTrader = "Prop Trading Fund";
  const accountNo = "U1673041"; // IB account number for Prop Trading Fund
  const phAccountNoValue = "PHU1673041"; // PH account number for Prop Trading Fund

  // Validate account number
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

  // Fetch trade analytics or use mock data
  let analyticsData = analyticsMockData; // Default to mockData.longAndShort
  let error = null;

  try {
    const today = new Date();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/trade-analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market: "Global",
        account: accountNo,
        dateStart: startOfYear(today).toISOString().split("T")[0],
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
    <TradeAnalytics
      trader={decodedTrader}
      accountNo={accountNo}
      phAccountNo={phAccountNoValue}
      initialData={analyticsData}
      initialError={error}
    />
    
  );
}