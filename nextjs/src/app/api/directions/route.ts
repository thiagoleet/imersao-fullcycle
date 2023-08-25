import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const originId = url.searchParams.get("originId");
  const destinationId = url.searchParams.get("destinationId");

  const apiURL = new URL("http://localhost:3000/directions");
  apiURL.searchParams.set("originId", originId!);
  apiURL.searchParams.set("destinationId", destinationId!);

  const response = await fetch(apiURL, {
    next: {
      revalidate: 60,
    },
  });

  return NextResponse.json(await response.json());
}
