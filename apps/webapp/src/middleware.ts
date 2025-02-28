import { NextResponse, NextRequest } from "next/server";
import CryptoJS from "crypto-js";
import { RequestType } from "./requests/request";

const API_SECRET = process.env.API_SECRET || "";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (request.nextUrl.pathname.startsWith("/api/testsuite/neutrino")) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new NextResponse(
        JSON.stringify({ error: "Missing or invalid Authorization" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const hashFromClient = authHeader.split(" ")[1];

    let dataToHash = "";

    if (request.method === RequestType.GET) {
      const sortedParams = Array.from(
        request.nextUrl.searchParams.entries()
      ).sort((a, b) => a[0].localeCompare(b[0]));
      dataToHash = new URLSearchParams(sortedParams).toString();
    } else if (request.method === RequestType.POST) {
      try {
        const body = await request.json();
        dataToHash = JSON.stringify(body || {});
      } catch (err) {
        return new NextResponse(
          JSON.stringify({ error: "Unable to parse JSON body" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else if (request.method === RequestType.DELETE) {
      try {
        dataToHash = JSON.stringify({});
      } catch (err) {
        return new NextResponse(
          JSON.stringify({ error: "Unable to parse JSON body" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      return new NextResponse(JSON.stringify({ error: "Unsupported method" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashFromServer = CryptoJS.HmacSHA256(dataToHash, API_SECRET).toString(
      CryptoJS.enc.Hex
    );

    if (hashFromClient !== hashFromServer) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
