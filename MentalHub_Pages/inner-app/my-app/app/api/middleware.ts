import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigin = process.env.BASEURL || "https://tudominio.com";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  // Permite solo el dominio configurado
  if (origin && origin !== allowedOrigin) {
    return new NextResponse("CORS error: origin not allowed", { status: 403 });
  }

  // Para preflight requests (OPTIONS)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  // Para otras peticiones
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// Aplica el middleware solo a la API
export const config = {
  matcher: "/api/:path*",
};