
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/helpers/getAuthenticatedProfile";
import { performance } from "node:perf_hooks";

export async function GET(request: NextRequest) {
  const start = performance.now();

  try {
    // Authenticate and fetch profile using one DB query.
    const user = await getAuthenticatedProfile(request);

    const totalTime = performance.now() - start;

    if (process.env.PERF_LOGGING === "true") {
      console.log("[PROFILE PERFORMANCE]", {
        totalMs: Number(totalTime.toFixed(2)),
      });
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
