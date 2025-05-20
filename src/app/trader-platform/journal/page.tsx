import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics"; // Adjust path to your TradeAnalytics mockData file

// Define static metadata for the hardcoded trader
export const metadata = {
  title: "CTS | Journal",
  description: "Trader Journal",
};

export default async function Page() {

}