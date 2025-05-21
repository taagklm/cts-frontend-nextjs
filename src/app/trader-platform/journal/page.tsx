import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TradeAnalytics } from "@/components/features/trade-analytics/trade-analytics";
import { startOfYear } from "date-fns";
import { mockData as analyticsMockData } from "@/mock-data/trader-trade-analytics";
import TradeblocksTable from "@/components/features/tradeblocks";

export const metadata = {
  title: "CTS | Journal",
  description: "Trader Journal",
};

export default function Page() {
  return (
    <div className="px-12 pb-4">
      <TradeblocksTable />
    </div>
    // <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6">
    //   {/* Card with minimal padding */}
    //   <Card className="border-none shadow-none">
    //     {/* <CardHeader className="py-2">
    //       <CardTitle className="text-lg">Tradeblocks</CardTitle>
    //       <CardDescription className="text-sm">
    //         Trading activity for account U1673066 (Jan 1 - Feb 1, 2024)
    //       </CardDescription>
    //     </CardHeader> */}
    //     <div className="px-12">
    //       <TradeblocksTable />
    //     </div>
    //   </Card>
    // </div>
  );
}