import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const apiURL = new URL(`${process.env.NEXT_PUBLIC_NEST_API_URL}/routes`);

  const response = await fetch(apiURL, {
    next: {
      revalidate: 60,
      tags: ["routes"], //revalidação de cache sob demanda
    },
  });
  return NextResponse.json(await response.json());
}

export async function POST(request: Request) {
  const apiURL = new URL(`${process.env.NEXT_PUBLIC_NEST_API_URL}/routes`);

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(await request.json()),
  });
  revalidateTag("routes");
  return NextResponse.json(await response.json());
}
