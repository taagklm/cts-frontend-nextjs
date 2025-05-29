import { TradersPerformanceTable } from "@/components/features/traders-performance-table";
import { Card } from "@/components/ui/card";

// Define metadata for Traders Performance page
export const metadata = {
  title: "CTS | Traders",
  description: "Performance metrics for traders across markets, including PNL and AUM.",
};

export default async function Page() {
  // Fetch traders performance data
  let tradersData = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/traders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      const data = await response.json();
      tradersData = data?.Traders || [];
    } else {
      console.error("Failed to fetch traders:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching traders:", error);
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto sm:p-6">
      <Card className="border-none shadow-none">
        <div className="px-12 pt-0">
          <TradersPerformanceTable data={tradersData} />
        </div>
      </Card>
    </div>
  );
}