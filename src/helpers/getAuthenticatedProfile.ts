
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";

export async function getAuthenticatedProfile(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.TOKEN_SECRET;

  if (!token) {
    throw new Error("Authentication required");
  }

  if (!secret) {
    throw new Error("Authentication service unavailable");
  }

  try {
    // Verify the JWT signature and expiration.
    const decoded = jwt.verify(token, secret);

    // Validate the expected JWT payload.
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      !decoded.id ||
      typeof decoded.tokenVersion !== "number"
    ) {
      throw new Error("Invalid authentication token");
    }

    await connect();

    // Retrieve authentication and profile data in one query.
    const user = await User.findById(decoded.id)
      .select("username email isVerified tokenVersion")
      .lean();

    if (!user) {
      throw new Error("User no longer exists");
    }

    // Preserve session invalidation after password resets.
    if ((user.tokenVersion ?? 0) !== decoded.tokenVersion) {
      throw new Error("Session has been invalidated");
    }

    return {
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    };
  } catch {
    throw new Error("Invalid or expired authentication token");
  }
}
