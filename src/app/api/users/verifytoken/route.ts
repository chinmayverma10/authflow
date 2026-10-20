import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbconfig";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token;

    // Step 1: Validate the token
    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      return NextResponse.json(
        { message: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Step 2: Hash the received token
    const hashedToken = createHash("sha256")
      .update(token)
      .digest("hex");

    await connect();

    // Step 3: Find and verify the user atomically
    const user = await User.findOneAndUpdate(
      {
        verifyToken: hashedToken,
        verifyTokenExpiry: { $gt: new Date() },
      },
      {
        $set: { isVerified: true },
        $unset: {
          verifyToken: "",
          verifyTokenExpiry: "",
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired verification token",
        },
        { status: 400 }
      );
    }

    // Step 4: Return a safe response
    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
