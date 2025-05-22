import { NextResponse } from "next/server";
import { mockIbkrDailyPnl } from "@/mock-data/daily-pnl";
import { useMock } from "@/app/api/config";

export async function POST(request: Request) {
  console.log("Received request to /api/dailypnl");
  try {
    const body = await request.json();
    console.log("Request body:", body);

    if (useMock) {
      const { account } = body;

      if (!account) {
        console.error("Missing account field");
        return NextResponse.json(
          { error: "Missing required field: account" },
          { status: 400 }
        );
      }

      const accountData = mockIbkrDailyPnl.find((data) => data.account === account);
      if (!accountData) {
        console.error("No data found for account:", account);
        return NextResponse.json(
          { error: `No data found for account: ${account}` },
          { status: 404 }
        );
      }

      console.log("Returning mock data for account:", account);
      return NextResponse.json(accountData);
    }

    const { account, dateStart, dateEnd } = body;
    if (!account || !dateStart || !dateEnd) {
      console.error("Missing required fields:", { account, dateStart, dateEnd });
      return NextResponse.json(
        { error: "Missing required fields: account, dateStart, dateEnd" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7025";
    const endpoint = `${backendUrl}/api/DailyPnl`;

    const requestBody = {
      Account: account,
      DateStart: dateStart,
      DateEnd: dateEnd,
    };

    console.log("Sending request to backend:", { endpoint, requestBody });

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
    console.log("Backend response:", { status: response.status, body: responseBody });

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
        { error: result.message || "Failed to fetch daily P&L" },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/dailypnl:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}