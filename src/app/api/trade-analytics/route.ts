import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/trader-trade-analytics";

const useMock = false;    // Toggle true to use mock data

// Handle POST requests to fetch trade analytics
export async function POST(request: Request) {
  try {
    // Return mock data if enabled
    if (useMock) {
      return NextResponse.json(mockData);
    }

    const body = await request.json();

    // Validate request body
    if (!body.market || !body.account || !body.dateStart || !body.dateEnd) {
      console.error("Invalid request body:", body);
      return NextResponse.json(
        { error: "Missing required fields: market, account, dateStart, dateEnd are required" },
        { status: 400 }
      );
    }

    // Validate market
    const validMarkets = ["Global", "US", "HK", "JP", "PH"];
    if (!validMarkets.includes(body.market)) {
      console.error("Invalid market:", body.market);
      return NextResponse.json(
        { error: "Invalid market. Must be one of: Global, US, HK, JP, PH" },
        { status: 400 }
      );
    }

    // Validate date format
    try {
      new Date(body.dateStart).toISOString();
      new Date(body.dateEnd).toISOString();
    } catch {
      console.error("Invalid date format:", { dateStart: body.dateStart, dateEnd: body.dateEnd });
      return NextResponse.json(
        { error: "Invalid date format. Use yyyy-MM-dd" },
        { status: 400 }
      );
    }

    // Construct backend API URL
    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7025";
    const endpoint = `${backendUrl}/api/TradeAnalytics`;

    // Prepare request body
    const requestBody = {
      Market: body.market,
      Account: body.account,
      DateStart: body.dateStart,
      DateEnd: body.dateEnd,
      IsHoldingsIncluded: body.isHoldingsIncluded ?? false,
      Tags: body.tags || null,
    };

    // Log request details
    console.log("Sending request to backend:", {
      url: endpoint,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    // Make API request with HTTP fallback to HTTPS
    let response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok && backendUrl.startsWith("http://")) {
      console.warn("HTTP request failed, retrying with HTTPS");
      const httpsEndpoint = endpoint.replace("http://", "https://");
      response = await fetch(httpsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
    }

    const responseBody = await response.text();
    console.log("Backend response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
    });

    // Parse response
    let result;
    try {
      result = JSON.parse(responseBody);
    } catch {
      console.error("Failed to parse response body:", responseBody);
      return NextResponse.json(
        { error: "Invalid response from backend" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend error:", result);
      return NextResponse.json(
        { error: result.message || "Failed to fetch analytics from backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in trade-analytics route:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    if (error.cause?.code === "UND_ERR_SOCKET") {
      return NextResponse.json(
        { error: "Failed to connect to backend. Ensure the server is running at http://localhost:7025 or https://localhost:7025" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}