import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";

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

export default async function TraderPage({
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

  let analyticsData = null;
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
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Network error";
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