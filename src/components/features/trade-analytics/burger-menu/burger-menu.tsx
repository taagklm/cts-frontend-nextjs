"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Range } from "./filter-sheet";

type BurgerMenuProps = {
  onExportReport?: () => void;
  onExportTradeblocks?: () => void;
  onExportTransactions?: () => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  includeHoldings: boolean;
  setIncludeHoldings: (value: boolean) => void;
  onApplyFilters: (dateRange: DateRange | undefined, includeHoldings: boolean) => void;
};

export function BurgerMenu({
  onExportReport = () => console.log("Exporting Report as PDF"),
  onExportTradeblocks = () => console.log("Exporting Tradeblocks as CSV"),
  onExportTransactions = () => console.log("Exporting Transactions as CSV"),
  dateRange,
  setDateRange,
  includeHoldings,
  setIncludeHoldings,
  onApplyFilters,
}: BurgerMenuProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    console.log("Custom modal open state changing to:", open);
    setIsSheetOpen(open);
  }, []);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    console.log("Burger menu dropdown open state changing to:", open);
    setIsDropdownOpen(open);
  }, []);

  const handleApplyFilters = useCallback(() => {
    console.log("Applying filters and closing modal", { dateRange, includeHoldings });
    setIsSheetOpen(false);
    onApplyFilters(dateRange, includeHoldings);
  }, [dateRange, includeHoldings, onApplyFilters]);

  useEffect(() => {
    if (isSheetOpen || isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setTimeout(() => {
        const blockers = document.querySelectorAll(
          '[data-radix-dialog-content], [data-radix-dialog-overlay], .SheetOverlay, [class*="overlay"], [class*="Overlay"], [class*="modal"], [class*="backdrop"], [class*="dialog"], [class*="popup"], [class*="popover"]'
        );
        console.log("Found potential blockers:", blockers.length);
        blockers.forEach((blocker, index) => {
          const computedStyle = window.getComputedStyle(blocker);
          console.log(`Blocker ${index}:`, {
            id: blocker.id,
            tagName: blocker.tagName,
            className: blocker.className,
            dataState: blocker.getAttribute("data-state"),
            display: computedStyle.display,
            pointerEvents: computedStyle.pointerEvents,
            zIndex: computedStyle.zIndex,
            opacity: computedStyle.opacity,
            position: computedStyle.position,
            width: computedStyle.width,
            height: computedStyle.height,
          });
          (blocker as HTMLElement).style.display = "none";
          (blocker as HTMLElement).style.pointerEvents = "none";
        });

        const allElements = document.querySelectorAll("*");
        allElements.forEach((el, index) => {
          const computedStyle = window.getComputedStyle(el);
          const zIndex = parseInt(computedStyle.zIndex);
          if (
            zIndex > 10 &&
            computedStyle.display !== "none" &&
            computedStyle.pointerEvents !== "none" &&
            computedStyle.width !== "0px" &&
            computedStyle.height !== "0px"
          ) {
            console.log(`High z-index element ${index}:`, {
              id: el.id,
              tagName: el.tagName,
              className: el.className,
              zIndex,
              display: computedStyle.display,
              pointerEvents: computedStyle.pointerEvents,
              position: computedStyle.position,
              top: computedStyle.top,
              left: computedStyle.left,
              width: computedStyle.width,
              height: computedStyle.height,
            });
            (el as HTMLElement).style.display = "none";
            (el as HTMLElement).style.pointerEvents = "none";
          }
        });
      }, 200);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen, isDropdownOpen]);

  const handleMenuTriggerClick = (e: React.MouseEvent) => {
    console.log("Burger menu trigger clicked");
    e.stopPropagation();
  };

  return (
    <div className="col-span-1 flex justify-end">
      <style jsx global>{`
        .custom-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          opacity: 0;
          transition: opacity 0.5s ease-out 0.1s;
        }
        .custom-modal-overlay.open {
          opacity: 1;
        }
        .custom-modal-content {
          background: white;
          color: #111827;
          width: 700px;
          max-width: 90vw;
          height: 100%;
          padding: 18px;
          overflow-y: auto;
          border-left: 1px solid #e5e7eb;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
          z-index: 51;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .custom-modal-content::-webkit-scrollbar {
          display: none;
        }
        .custom-modal-content.open {
          transform: translateX(0);
        }
        .dark .custom-modal-content {
          background: #020817;
          color: #f9fafb;
          border-left: 1px solid #1f2937;
        }
        .custom-modal-content.hidden {
          transform: translateX(100%);
          display: none;
        }
        .custom-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #111827;
        }
        .dark .custom-modal-close {
          color: #f9fafb;
        }
        .custom-modal-close:hover {
          color: #4b5563;
        }
        .dark .custom-modal-close:hover {
          color: #d1d5db;
        }
        .custom-modal-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
        }
        .custom-modal-header p {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .dark .custom-modal-header p {
          color: #9ca3af;
        }
        .custom-modal-content [data-radix-popper-content-wrapper] {
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          z-index: 52;
          position: absolute;
        }
        .burger-dropdown-content {
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          z-index: 52;
          position: absolute;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .burger-dropdown-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <DropdownMenu onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Open menu"
            onClick={handleMenuTriggerClick}
          >
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 burger-dropdown-content rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none text-left"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => {
              console.log("Filters menu item clicked");
              setIsSheetOpen(true);
            }}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 justify-start"
          >
            Filters
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportReport}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 justify-start"
          >
            Export Report (.pdf)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportTradeblocks}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 justify-start"
          >
            Export Tradeblocks (.csv)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onExportTransactions}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 justify-start"
          >
            Export Transactions (.csv)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isSheetOpen && (
        <div className={`custom-modal-overlay ${isSheetOpen ? "open" : ""}`}>
          <div className={`custom-modal-content ${isSheetOpen ? "open" : "hidden"}`}>
            <button
              className="custom-modal-close"
              onClick={() => handleOpenChange(false)}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="custom-modal-header text-left">
              <h2>Filters</h2>
              <p>Select a date range to filter the data.</p>
            </div>
            <div className="flex flex-col gap-4 py-4">
              <Range
                dateRange={dateRange}
                setDateRange={setDateRange}
                includeHoldings={includeHoldings}
                setIncludeHoldings={setIncludeHoldings}
                onApplyFilters={handleApplyFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}