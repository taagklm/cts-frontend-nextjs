"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { DateRange } from "react-day-picker";
import "react-day-picker/style.css";

interface DailyCalendarReturnPickerProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
}

export function DailyCalendarReturn({ selected, onSelect }: DailyCalendarReturnPickerProps) {
  return (
    <div className="flex justify-center pb-4 px-6">
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        className="border rounded-md p-4 bg-white shadow-sm"
        styles={{
          caption: { color: "#1f2937", fontWeight: "600", fontSize: "1rem" },
          head_cell: { color: "#6b7280", textTransform: "uppercase", fontSize: "0.75rem", padding: "8px" },
          cell: { padding: "2px" },
          day: {
            borderRadius: "4px",
            padding: "8px",
            transition: "background-color 0.2s",
            fontSize: "0.875rem",
          },
          day_selected: { backgroundColor: "#2dd4bf", color: "#fff" },
          day_range_middle: { backgroundColor: "#e6fffa", color: "#1f2937" },
          day_range_start: { backgroundColor: "#2dd4bf", color: "#fff" },
          day_range_end: { backgroundColor: "#2dd4bf", color: "#fff" },
          day_outside: { color: "#d1d5db" },
          day_today: { border: "1px solid #2dd4bf" },
          nav_button: { color: "#1f2937", padding: "8px" },
          nav_button_previous: { marginRight: "8px" },
          nav_button_next: { marginLeft: "8px" },
        }}
        modifiersStyles={{
          selected: { backgroundColor: "#2dd4bf", color: "#fff" },
          today: { border: "1px solid #2dd4bf" },
        }}
      />
    </div>
  );
}