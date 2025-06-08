import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/traders-performance";

const useMock = true;    // Toggle true to use mock data

// Handle POST requests to fetch traders performance
export async function POST(request: Request) {
  try {
    // Get request body and log details into console.
    const body = await request.json();
    console.log("API Next.js Route Handler:", {
      endpoint: "/api/traders",
      requestType: "POST",
      requestBody: body || "No request body provided"
    });
    
    // Return mock data if enabled
    if (useMock) {
      return NextResponse.json(mockData);
    }

    // If not using mock data, proceed with backend API call
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