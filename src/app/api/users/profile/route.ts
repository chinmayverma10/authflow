
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user's ID
    const userId = await getDataFromToken(request);

    // Fetch only the fields needed by the UI
    const user = await User.findById(userId)
      .select("username email isVerified")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
