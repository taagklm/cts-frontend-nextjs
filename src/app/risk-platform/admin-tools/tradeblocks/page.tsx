import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import TradeblocksTable from "@/components/features/tradeblocks";
import { mockData } from "@/mock-data/tradeblocks";

export const metadata = {
  title: "CTS | Tradeblocks",
};

export default async function Page() {
  const today = new Date();
  const accountNo = "U1673066"; // Hardcoded for now, can be dynamic via params
  let tradeblocksData = mockData;
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
      tradeblocksData = mockData; // Fallback to mock data
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Network error";
    tradeblocksData = mockData; // Fallback to mock data
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto sm:p-6">
      <Card className="border-none shadow-none">
        <div className="px-12 pt-0">
          <TradeblocksTable initialData={tradeblocksData} initialError={error} />
        </div>
      </Card>
    </div>
  );
}