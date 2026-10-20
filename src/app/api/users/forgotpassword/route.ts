import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";
import { sendEmail } from "@/helpers/mailer";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Read the submitted email
    const body = await request.json();
    const email = body?.email;

    // Step 2: Validate the email
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Step 3: Connect to MongoDB
    await connect();

    // Step 4: Find the account
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Step 5: Send an email if the account exists
    if (user) {
      await sendEmail({
        email: user.email,
        emailType: "RESET",
        userId: user._id.toString(),
      });
    }

    // Step 6: Return a generic response
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, a password reset link will be sent.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Unable to process your request" },
      { status: 500 }
    );
  }
}
