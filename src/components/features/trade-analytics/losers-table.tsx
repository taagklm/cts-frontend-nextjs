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
    index < displayedLosers.length ? displayedLosers[index] : null // Removed parentheses around ternary
  );

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal pb-3">
      <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
        <CardContent className="p-0">
          <div className="px-2">
            <Table className="min-w-0 w-full">
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-sm font-normal text-center pt-0 px-1 h-5 align-middle"
                  >
                    TOP 5 LOSERS
                  </TableCell>
                </TableRow>
                {rows.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm font-normal text-left px-1 py-1">
                      {item
                        ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm font-normal text-left px-1 py-1">
                      {/* Fixed syntax: removed erroneous 'symbol : ""}' */}
                      {item ? item.symbol : ""}
                    </TableCell>
                    <TableCell
                      className={`text-sm font-normal text-right px-1 py-1 ${
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}