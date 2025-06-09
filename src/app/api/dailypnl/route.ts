import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/daily-pnl";

const useMock = true; // Keep true for testing

// Handle POST requests to fetch daily PnL data
export async function POST(request: Request) {
  try {
    // Get request body and log details into console.
    const body = await request.json();
    console.log("API Next.js Route Handler:", {
      endpoint: "/api/dailypnl",
      requestType: "POST",
      requestBody: body || "No request body provided"
    });

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

    // Validate market
    const validMarkets = ["IB", "US", "HK", "JP", "PH"];
    if (!validMarkets.includes(body.market)) {
      console.error("Invalid market:", body.market);
      return NextResponse.json(
        { error: { message: "Invalid market. Must be one of: IB, US, HK, JP, PH", code: "INVALID_MARKET" } },
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

    // Return mock data if useMock is true.
    if (useMock) {
      return NextResponse.json(mockData);
    }

    // If not using mock data, proceed with backend API call
    // Construct backend API URL, enforcing HTTPS
    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7025";
    if (!backendUrl.startsWith("https://")) {
      console.error("Invalid BACKEND_API_URL: Must use HTTPS", { backendUrl });
      return NextResponse.json(
        { error: { message: "Server configuration error: Backend URL must use HTTPS", code: "INVALID_CONFIG" } },
        { status: 500 }
      );
    }
    const endpoint = `${backendUrl}/api/dailypnl/summary`;

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

    // Make API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    // Read response
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error: any) {
      console.error("Failed to parse JSON response:", {
        error: error.message,
        body: responseText
      });
      return NextResponse.json(
        { error: "Failed to parse JSON response from backend" },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Backend error:", result);
      return NextResponse.json(
        { error: result.message || "Failed to fetch daily pnl from backend" },
        { status: response.status }
      );
    }

    // Log successful response and return result
    console.log("Successfully fetched daily pnl:", { status: response.status, body: result });
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
            "Failed to connect to backend. Ensure the server is running at https://localhost:7025",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
