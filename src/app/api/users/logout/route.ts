
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        message: "User logged out successfully",
        success: true,
      },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { error: "Error while logging out" },
      { status: 500 }
    );
  }
}
