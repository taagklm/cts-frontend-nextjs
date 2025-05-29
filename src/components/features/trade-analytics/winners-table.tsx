import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface TradeblockPerformance {
  dateEntered: string;
  symbol: string;
  totalReturn: number;
}

export function WinnersTable({
  winners,
  selectedMarket,
}: {
  winners: TradeblockPerformance[];
  selectedMarket: string;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Limit to 5 winners, pad with empty rows if less than 5
  const displayedWinners = winners.slice(0, 5);
  const rows = Array.from({ length: 5 }, (_, index) =>
    index < displayedWinners.length ? displayedWinners[index] : null
  );

  return (
    <div className="flex items-center justify-center font-sans text-sm font-normal pb-0">
      {/* Retained font-sans text-sm font-normal from previous updates */}
      <Card className="max-w-3xl w-full overflow-hidden pt-2 pb-2 shadow-none">
        {/* Changed overflow-visible to overflow-hidden, added pt-6 pb-6 to match TradeblocksTable */}
        <CardContent className="p-0">
          {/* Changed pr-2 pl-2 pt-0 pb-0 to p-0 to match TradeblocksTable’s CardContent */}
          <div className="px-2">
            {/* Added table wrapper with p-2 border rounded-md mt-2 mb-2 to match TradeblocksTable */}
            <Table className="min-w-0 w-full">
              {/* Added min-w-0 w-full to match TradeblocksTable */}
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-sm font-normal text-center pt-0 px-1 h-5 align-middle"
                  >
                    TOP 5 WINNERS
                  </TableCell>
                </TableRow>
                {rows.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm font-normal text-left px-1 py-1">
                      {/* Changed py-2 to px-1 py-1 to match TradeblocksTable */}
                      {item
                        ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm font-normal text-left px-1 py-1">
                      {/* Changed py-2 to px-1 py-1, kept text-sm font-normal */}
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