import type { NextRequest } from "next/server";

export function getRateLimitIdentifier(
  request: NextRequest
): string {
  // Trust forwarded IP only when running on Vercel.
  if (process.env.VERCEL !== "1") {
    return "local-development";
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return "unknown-client";
  }

  const clientIp = forwardedFor.split(",")[0]?.trim();

  return clientIp || "unknown-client";
}