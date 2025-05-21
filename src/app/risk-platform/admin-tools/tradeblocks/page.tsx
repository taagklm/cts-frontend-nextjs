import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import TradeblocksTable from "@/components/features/tradeblocks";
import { mockTradeblocks } from "@/mock-data/tradeblocks";

export const metadata = {
  title: "CTS | Tradeblocks",
};

export default async function Page() {
  const today = new Date();
  const accountNo = "U1673066"; // Hardcoded for now, can be dynamic via params
  let tradeblocksData = mockTradeblocks;
  let error = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/tradeblocks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: accountNo,
          dateStart: "2024-01-01",
          dateEnd: "2024-02-01",
        }),
      }
    );

    if (response.ok) {
      tradeblocksData = await response.json();
    } else {
      error = (await response.json()).error || "Failed to fetch tradeblocks";
      tradeblocksData = mockTradeblocks; // Fallback to mock data
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Network error";
    tradeblocksData = mockTradeblocks; // Fallback to mock data
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6">
      {/* <div className="mb-4">
        <TradeAnalytics
          data={analyticsMockData}
          dateRange={{ from: startOfYear(new Date()), to: new Date() }}
        />
      </div> */}
      <Card className="border-none shadow-none">
        {/* <CardHeader className="py-2">
          <CardTitle className="text-lg">Tradeblocks</CardTitle>
          <CardDescription className="text-sm">
            Trading activity for account U1673066 (Jan 1 - Feb 1, 2024)
          </CardDescription>
        </CardHeader> */}
        <div className="px-4 py-4">
          <TradeblocksTable initialData={tradeblocksData} initialError={error} />
        </div>
      </Card>
    </div>
  );
}