import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text");

  const apiURL = new URL(`${process.env.NEXT_PUBLIC_NEST_API_URL}/places`);
  apiURL.searchParams.set("text", text!);

  const response = await fetch(apiURL, {
    next: {
      revalidate: 60,
    },
  });

  return NextResponse.json(await response.json());
}
