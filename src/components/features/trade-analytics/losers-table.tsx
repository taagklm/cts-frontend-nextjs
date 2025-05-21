import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface TradeblockPerformance {
  dateEntered: string;
  symbol: string;
  totalReturn: number;
}

export function LosersTable({
  losers,
  selectedMarket,
}: {
  losers: TradeblockPerformance[];
  selectedMarket: string;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Limit to 5 losers, pad with empty rows if less than 5
  const displayedLosers = losers.slice(0, 5);
  const rows = Array.from({ length: 5 }, (_, index) =>
    index < displayedLosers.length ? displayedLosers[index] : null
  );

  return (
    <div className="flex items-center justify-center pb-3">
      <Card className="max-w-3xl w-full overflow-visible shadow-none pt-0 pb-1">
        <CardContent className="pr-2 pl-2 ">
          <Table>
            <TableBody>
              <TableRow className="text-sm font-semibold">
                <TableCell colSpan={3} className="text-center py-3 border-b">
                  Top 5 Losers
                </TableCell>
              </TableRow>
              {rows.map((item, index) => (
                <TableRow key={index} className="text-sm font-normal">
                  <TableCell className="text-left py-2">
                    {item
                      ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-semibold text-left py-2">
                    {item ? item.symbol : ""}
                  </TableCell>
                  <TableCell
                    className={`text-right py-2 ${
                      item && item.totalReturn < 0 ? "text-[#FF5252]" : "text-[#4CAF50]"
                    }`}
                  >
                    {item
                      ? item.totalReturn > 0
                        ? `+${formatter.format(item.totalReturn)}`
                        : formatter.format(item.totalReturn)
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}