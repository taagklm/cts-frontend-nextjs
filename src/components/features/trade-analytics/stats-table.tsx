import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

// Define type matching TradeAnalyticsDto
interface TradeAnalyticsData {
  aum?: number | null;
  numberOfTrades: number;
  returnUsd?: number | null;
  returnPhp?: number | null;
  returnPercentage?: number | null;
  realizedPnlUsd?: number | null;
  realizedPnlPhp?: number | null;
  unrealizedPnlUsd?: number | null;
  unrealizedPnlPhp?: number | null;
  hitRatio: number;
  edgeRatio: number;
  totalProfit: number;
  totalLoss: number;
  numberOfWins: number;
  numberOfLosses: number;
  averageProfit: number;
  averageLoss: number;
  churn?: number | null;
}

// Column mappings
const colMappings: Record<string, keyof TradeAnalyticsData | 'winsOverTrades'> = {
  "AUM": "aum",
  "Return (USD)": "returnUsd",
  "Return (PHP)": "returnPhp",
  "Return (%)": "returnPercentage",
  "Realized Return (USD)": "realizedPnlUsd",
  "Realized Return (PHP)": "realizedPnlPhp",
  "Unrealized Return (USD)": "unrealizedPnlUsd",
  "Unrealized Return (PHP)": "unrealizedPnlPhp",
  "Hit (%)": "hitRatio",
  "Edge (x)": "edgeRatio",
  "Winners / Trades": "winsOverTrades",
  "Total Gain": "totalProfit",
  "Total Loss": "totalLoss",
  "Avg. Gain": "averageProfit",
  "Avg. Loss": "averageLoss",
  "Churn (x)": "churn",
};

const colsNames = Object.keys(colMappings);

export function StatsTable({
  data,
  selectedMarket,
}: {
  data: TradeAnalyticsData;
  selectedMarket: string;
}) {
  const isPHMarket = selectedMarket === "PH";

  return (
    <div className="flex items-center justify-center pr-3 pb-3">
      <Card className="max-w-3xl w-full overflow-visible shadow-none pt-0 pb-0">
        <CardContent className="pr-2 pl-2 pt-0 pb-0">
          <Table>
            <TableBody>
              {colsNames
                .filter((colName) => (isPHMarket ? !colName.includes("(USD)") : !colName.includes("(PHP)")))
                .map((colName, index) => {
                  const dataKey = colMappings[colName];
                  let value: number | string | null;

                  // Handle the computed Winners / Trades field
                  if (dataKey === "winsOverTrades") {
                    value = `${data.numberOfWins} / ${data.numberOfTrades}`;
                  } else {
                    value = dataKey && data[dataKey] !== undefined ? data[dataKey] : "N/A";
                  }

                  return (
                    <TableRow key={index} className="text-sm font-normal">
                      <TableCell className="font-semibold py-2 text-left">{colName}</TableCell>
                      <TableCell className={`text-right py-2 ${shouldColorCode(colName, value)}`}>
                        {formatValue(value, colName)}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Function to determine if and how to color-code values
const shouldColorCode = (colName: string, value: number | string | null) => {
  if (typeof value !== "number" || value === null) return "";

  // No color coding for these fields (default text color applies)
  const noColorFields = [
    "AUM",
    "Winners / Trades",
    "Hit (%)",
    "Edge (x)",
    "Churn (x)",
  ];
  if (noColorFields.includes(colName)) return "";

  // Neutral color for zero, otherwise green for positive, red for negative
  if (value === 0) return "";
  return value < 0 ? "text-[#FF5252]" : "text-[#4CAF50]";
};

// Function to format numbers
const formatValue = (value: number | string | null, colName: string) => {
  if (value === null || typeof value === "undefined") return "N/A";
  if (typeof value === "string") return value; // For Winners / Trades, return as is

  // Currency formatting for AUM
  if (colName === "AUM") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Percentage formatting for Return (%) and Hit (%)
  if (["Return (%)", "Hit (%)"].includes(colName)) {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return value > 0 && colName === "Return (%)" ? `+${formatted}%` : `${formatted}%`;
  }

  // Append 'x' for Edge Ratio and Churn
  if (["Edge (x)", "Churn (x)"].includes(colName)) {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}x`;
  }

  // Default formatting for other numeric values with + for positive
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return value > 0 ? `+${formatted}` : formatted;
};