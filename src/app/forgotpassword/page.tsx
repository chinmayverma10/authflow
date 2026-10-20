
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Track whether the API request is running
  const [loading, setLoading] = useState(false);

  // Store the success message from the server
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent multiple simultaneous requests
    if (loading) return;

    // Validate empty email
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Request a password reset link
      const response = await axios.post(
        "/api/users/forgotpassword",
        {
          email: email.trim().toLowerCase(),
        }
      );

      const successMessage =
        typeof response.data?.message === "string"
          ? response.data.message
          : "If an account exists, a reset link will be sent.";

      setMessage(successMessage);

      toast.success("Request processed successfully!");
    } catch {
      toast.error(
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#111827] p-7 shadow-2xl sm:p-10">

        {/* Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Auth<span className="text-blue-500">Flow</span>
          </h1>

          <h2 className="mt-7 text-2xl font-semibold">
            Forgot password?
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter your email address to request a
            password reset link.
          </p>
        </div>

        {/* Forgot Password Form */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#111827] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400"
          >
            {message}
          </div>
        )}

        {/* Login Link */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
