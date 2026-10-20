import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import bcryptjs from "bcryptjs";
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Step 1: Validate the reset token
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 },
      );
    }

    // Step 2: Validate the new password
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return NextResponse.json(
        { error: "Password must be 8 to 72 characters long" },
        { status: 400 },
      );
    }

    // Step 3: Hash the token to match MongoDB
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Step 4: Hash the new password
    const hashedPassword = await bcryptjs.hash(password, 12);

    await connect();

    // Step 5: Find the matching, unexpired token
    // and update the password in one atomic operation
    const user = await User.findOneAndUpdate(
      {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: { $gt: new Date() },
      },

      {
        $set: {
          password: hashedPassword,
        },
        $inc: {
          tokenVersion: 1,
        },
        $unset: {
          forgotPasswordToken: "",
          forgotPasswordTokenExpiry: "",
        },
      },

      { new: false },
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    // Step 6: Return a safe response
    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      { error: "Unable to reset password" },
      { status: 500 },
    );
  }
}
