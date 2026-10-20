
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Step 1: Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Step 2: Find the user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Step 3: Check the password
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Step 4: Check JWT secret
    const secret = process.env.TOKEN_SECRET;

    if (!secret) {
      console.error("TOKEN_SECRET is not configured");

      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 500 }
      );
    }

    // Step 5: Generate JWT
    const tokenData = {
      id: user._id.toString(),
      tokenVersion: user.tokenVersion ?? 0
    };

    const token = jwt.sign(tokenData, secret, {
      expiresIn: "1d",
    });

    // Step 6: Create response
    const response = NextResponse.json(
      {
        message: "User logged in successfully",
        success: true,
      },
      { status: 200 }
    );

    // Step 7: Set secure authentication cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Error while logging in user" },
      { status: 500 }
    );
  }
}
