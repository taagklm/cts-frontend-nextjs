import { TradersPerformanceTable } from "@/components/features/traders-performance-table";

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
    <div className="px-12">
      <TradersPerformanceTable data={tradersData} />
    </div>
  );
}