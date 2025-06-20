import { NextResponse } from "next/server";
import { mockData } from "@/mock-data/tradeblocks";

const useMock = true;    // Toggle true to use mock data

// Handle POST requests to fetch tradeblocks
export async function POST(request: Request) {
  try {
    // Get request body and log details into console.
    const body = await request.json();
    console.log("API Next.js Route Handler:", {
      endpoint: "/api/tradeblocks",
      requestType: "POST",
      requestBody: body || "No request body provided"
    });

    // Validate request body
    if (!body.account || !body.dateStart || !body.dateEnd) {
      console.error("Invalid request body:", body);
      return NextResponse.json(
        { error: "Missing required fields: account, dateStart, dateEnd are required" },
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
    const endpoint = `${backendUrl}/api/Tradeblocks/by-account-date`;

    // Prepare request body
    const requestBody = {
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

    // Parse API response, store in result
    let result;
    try {
      result = await response.json();
    } catch (error: any) {
      console.error("Failed to parse JSON response:", {
        error: error.message,
        body: await response.text()
      });
      return NextResponse.json(
        { error: "Failed to parse JSON response from backend" },
        { status: 500 }
      );
    }

    // // Log response details
    // console.log("Backend response:", {
    //   status: response.status,
    //   statusText: response.statusText,
    //   body: result,
    // });

    if (!response.ok) {
      console.error("Backend error:", result);
      return NextResponse.json(
        { error: result.message || "Failed to fetch analytics from backend" },
        { status: response.status }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in tradeblocks route:", {
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