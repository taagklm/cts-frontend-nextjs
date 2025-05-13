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
    <div className="flex items-center justify-center pb-0">
      <Card className="max-w-3xl w-full overflow-visible shadow-none">
        <CardContent className="p-2">
          <Table>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell colSpan={3} className="text-center font-semibold py-1 border-b">
                  Top 5 Winners
                </TableCell>
              </TableRow>
              {rows.map((item, index) => (
                <TableRow key={index} className="text-sm">
                  <TableCell className="text-left py-1">
                    {item
                      ? new Date(item.dateEntered).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-left py-1">
                    {item ? item.symbol : ""}
                  </TableCell>
                  <TableCell
                    className={`text-right py-1 ${
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