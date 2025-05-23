import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/traders-performance";
import { useMock } from "@/app/api/config";

// Handle POST requests to fetch traders performance
export async function POST(request: Request) {
  try {
    // Return mock data if enabled
    if (useMock) {
      return NextResponse.json(mockData);
    }

    // For now, return null when useMock is false
    return NextResponse.json(null);
  } catch (error: any) {
    console.error("Error in traders route:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}