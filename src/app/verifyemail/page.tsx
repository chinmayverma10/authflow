
"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

type VerificationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function EmailVerifyPage() {
  // Track the current verification state
  const [status, setStatus] =
    useState<VerificationStatus>("idle");

  // Store the message shown to the user
  const [message, setMessage] = useState("");

  const verifyEmail = async () => {
    // Prevent repeated verification requests
    if (status !== "idle") return;

    // Read verification token from URL
    const token = new URLSearchParams(
      window.location.search
    ).get("token");

    // Check whether token exists
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      toast.error("Verification token is missing");
      return;
    }

    // Start verification
    setStatus("loading");
    setMessage("Verifying your email...");

    try {
      // Send token to existing backend
      await axios.post("/api/users/verifytoken", {
        token,
      });

      // Verification successful
      setStatus("success");
      setMessage(
        "Your email has been verified successfully!"
      );

      toast.success("Email verified successfully!");
    } catch {
      // Verification failed
      setStatus("error");
      setMessage(
        "Verification failed. The link may be invalid, expired, or already used."
      );

      toast.error("Email verification failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#111827] p-7 text-center shadow-2xl sm:p-10">

        {/* Branding */}
        <h1 className="text-3xl font-bold tracking-tight">
          Auth<span className="text-blue-500">Flow</span>
        </h1>

        <h2 className="mt-7 text-2xl font-semibold">
          Email verification
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Confirm your email address to complete
          verification.
        </p>

        {/* Initial Verification Button */}
        {status === "idle" && (
          <button
            type="button"
            onClick={verifyEmail}
            className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            Verify email
          </button>
        )}

        {/* Loading State */}
        {status === "loading" && (
          <div className="mt-8 space-y-4">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

            <p className="text-sm text-slate-400">
              Please wait...
            </p>
          </div>
        )}

        {/* Verification Result */}
        {message && status !== "loading" && (
          <div
            role={status === "error" ? "alert" : "status"}
            className={`mt-7 rounded-lg border p-4 text-sm ${
              status === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Login Link */}
        {(status === "success" || status === "error") && (
          <Link
            href="/login"
            className="mt-7 inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            Go to login
          </Link>
        )}
      </div>
    </main>
  );
}
