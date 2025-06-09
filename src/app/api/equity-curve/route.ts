import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/daily-pnl";

const useMock = false; // Set to false to use backend API, true to use mock data

export async function POST(request: Request) {
  console.log("API Next.js Route Handler:", {
    endpoint: "/api/equity",
    requestType: "POST",
    useMock,
  });

  try {
    const body = await request.json();
    console.log("Request body:", body);

    // Validate request body
    if (!body.market || !body.account || !body.dateStart || !body.dateEnd) {
      console.error("Missing required fields in request body:", body);
      return NextResponse.json({}, { status: 400 });
    }

    // Validate market and account
    if (
      typeof body.market !== "string" ||
      body.market.trim() === "" ||
      typeof body.account !== "string" ||
      body.account.trim() === ""
    ) {
      console.error("Invalid market or account values:", { market: body.market, account: body.account });
      return NextResponse.json({}, { status: 400 });
    }

    // Validate date format
    try {
      new Date(body.dateStart).toISOString();
      new Date(body.dateEnd).toISOString();
    } catch {
      console.error("Invalid date format in request:", { dateStart: body.dateStart, dateEnd: body.dateEnd });
      return NextResponse.json({}, { status: 400 });
    }

    if (useMock) {
      // Use mock data
      console.log("Processing mock data for account:", body.account);
      const accountData = mockData.filter((data) => data.account === body.account);
      if (!accountData.length) {
        console.error("No mock data found for account:", body.account);
        return NextResponse.json({}, { status: 404 });
      }

      // Filter by date range
      const filteredData = accountData.map((data) => ({
        ...data,
        dailyPnl: data.dailyPnl.filter((entry) => {
          const entryDate = new Date(entry.date);
          const start = new Date(body.dateStart);
          const end = new Date(body.dateEnd);
          return entryDate >= start && entryDate <= end;
        }),
      }));

      console.log("Returning mock data:", filteredData);
      return NextResponse.json(filteredData);
    } else {
      // Connect to backend API
      const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7025";
      if (!backendUrl.startsWith("https://")) {
        console.error("Invalid BACKEND_API_URL configuration:", { backendUrl });
        return NextResponse.json({}, { status: 500 });
      }
      const endpoint = `${backendUrl}/api/Equity`;

      const requestBody = {
        Market: body.market,
        Account: body.account,
        DateStart: body.dateStart,
        DateEnd: body.dateEnd,
      };

      console.log("Sending request to backend:", {
        url: endpoint,
        method: "POST",
        body: requestBody,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      let result;
      try {
        result = await response.json();
      } catch (error: any) {
        return NextResponse.json({}, { status: 500 });
      }

      if (!response.ok) {
        console.error("Backend returned an error:", result);
        return NextResponse.json({}, { status: response.status });
      }

      console.log("Returning backend data:", result);
      return NextResponse.json(result);
    }
  } 
  catch (error: any) {
    console.error("Error processing request:", {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
    return NextResponse.json({}, { status: 500 });
  }
  // catch (error) {
  //   console.error("Unexpected error in /api/equity:", {
  //     message: error.message,
  //     cause: error.cause,
  //     stack: error.stack,
  //   });
  //   if (error.cause?.code === "UND_ERR_SOCKET") {
  //     return NextResponse.json({}, { status: 503 });
  //   }
  //   return NextResponse.json({}, { status: 500 });
  // }
}