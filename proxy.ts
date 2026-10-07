// Dashboard gate: HTTP Basic auth on everything except /portal/* (client-facing, token-gated).
// Credentials live in .env.local (gitignored): DASHBOARD_USER (default "michael") + DASHBOARD_PASSWORD.
// Fails closed — deploy without DASHBOARD_PASSWORD set and nothing is exposed.
import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

function unauthorized() {
  return new NextResponse("Dashboard is protected.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Portal dashboard", charset="UTF-8"',
    },
  });
}

export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return unauthorized();

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  const provided = Buffer.from(header.slice(6), "base64");
  const expected = Buffer.from(
    `${process.env.DASHBOARD_USER ?? "michael"}:${password}`,
  );

  const ok =
    provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!ok) return unauthorized();
}

export const config = {
  matcher: ["/((?!portal|_next/static|_next/image|favicon.ico).*)"],
};
