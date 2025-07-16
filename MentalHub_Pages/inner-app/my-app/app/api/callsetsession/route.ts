import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {

  try {
    console.log("Request callsetsession:", req);
    const baseUrl = process.env.BASEURL || "http://localhost:3000";
    console.log("Base URL:", baseUrl);
    const body = await req.json();
    console.log("body:", body);
    const response = await fetch(`${baseUrl}/api/setsession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: body,
    });
    
    const data = await response.json();
    console.log("Response from callsetsession:", data);
    //res.status(response.status).json(data);

    return NextResponse.json({ status: "success", msg: "minted", data: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}