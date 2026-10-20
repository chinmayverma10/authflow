
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (username.length > 50 || email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "The provided details are too long.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be 8–72 characters long.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already Exist",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Please check your email to verify it.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup request failed.");

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to create an account with those details.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create your account right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
