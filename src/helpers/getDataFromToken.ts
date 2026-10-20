
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbconfig";
import User from "@/models/userModel";

export const getDataFromToken = async (
  request: NextRequest
): Promise<string> => {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.TOKEN_SECRET;

  if (!token) {
    throw new Error("Authentication required");
  }

  if (!secret) {
    console.error("TOKEN_SECRET is not configured");
    throw new Error("Authentication service unavailable");
  }

  try {
    // Step 1: Verify JWT signature and expiration
    const decoded = jwt.verify(token, secret);

    // Step 2: Validate JWT payload
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      !decoded.id ||
      typeof decoded.tokenVersion !== "number"
    ) {
      throw new Error("Invalid authentication token");
    }

    // Step 3: Connect to MongoDB
    await connect();

    // Step 4: Find the user
    const user = await User.findById(decoded.id)
      .select("tokenVersion")
      .lean();

    if (!user) {
      throw new Error("User no longer exists");
    }

    // Step 5: Compare token versions
    if ((user.tokenVersion ?? 0) !== decoded.tokenVersion) {
      throw new Error("Session has been invalidated");
    }

    return decoded.id;
  } catch {
    throw new Error("Invalid or expired authentication token");
  }
};
