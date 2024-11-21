// api > hello > [name] > route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: { name: string } }
) {
  const name = params.name;
  const paramGreeting = request.nextUrl.searchParams.get('greeting');
  const greeting = `${paramGreeting || 'Hello'} ${name}!!!`;
  
  return NextResponse.json({ greeting });
}