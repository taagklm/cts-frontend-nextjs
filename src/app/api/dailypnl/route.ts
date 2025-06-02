import { NextResponse } from "next/server";
import { mockIbkrDailyPnl } from "@/mock-data/daily-pnl";

const useMock = true; // Keep true for testing

// Handle POST requests to fetch daily PnL data
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Return mock data if enabled
    if (useMock) {
      // Validate account field for mock data
      if (!body.account) {
        console.error("Missing account in request body:", body);
        return NextResponse.json(
          { error: "Account is required for mock data" },
          { status: 400 }
        );
      }
      // Filter mock data by account
      const filteredData = mockIbkrDailyPnl.filter(item => item.account === body.account);
      console.log("Filtered mock data for account:", body.account, filteredData);
      return NextResponse.json(filteredData);
    }

    // Validate request body
    if (!body.market || !body.account || !body.dateStart || !body.dateEnd) {
      console.error("Invalid request body:", body);
      return NextResponse.json(
        { error: "Missing required fields: market, account, dateStart, dateEnd are required" },
        { status: 400 }
      );
    }

    // Validate market and account are non-empty strings
    if (typeof body.market !== "string" || body.market.trim() === "" || 
        typeof body.account !== "string" || body.account.trim() === "") {
      console.error("Invalid market or account:", { market: body.market, account: body.account });
      return NextResponse.json(
        { error: "Market and account must be non-empty strings" },
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
    const endpoint = `${backendUrl}/api/dailypnl`;

    // Prepare request body
    const requestBody = {
      Market: body.market,
      Account: body.account,
      DateStart: body.dateStart,
      DateEnd: body.dateEnd,
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
        { error: result.message || "Failed to fetch daily PnL from backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in dailypnl route:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    if (error.cause?.code === "UND_ERR_SOCKET") {
      return NextResponse.json(
        {
          error:
            "Failed to connect to backend. Ensure the server is running at http://localhost:7025 or https://localhost:7025",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}