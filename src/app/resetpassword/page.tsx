
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  // Password form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent duplicate requests
    if (loading || success) return;

    // Validate new password
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      toast.error("Password must be 8 to 72 characters long");
      return;
    }

    // Validate confirmation
    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Get reset token from the URL
    const token = new URLSearchParams(
      window.location.search
    ).get("token");

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    try {
      setLoading(true);

      // Send token and new password to the backend
      await axios.post("/api/users/resetpassword", {
        token,
        password,
      });

      // Clear sensitive form values
      setPassword("");
      setConfirmPassword("");

      // Show success screen
      setSuccess(true);

      toast.success("Password reset successfully!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error;

        toast.error(
          typeof message === "string"
            ? message
            : "Reset link is invalid or expired"
        );
      } else {
        toast.error("Unable to reset password. Try again.");
      }
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
            Reset password
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {success
              ? "Your password has been updated."
              : "Create a new password for your account."}
          </p>
        </div>

        {success ? (
          /* Success Screen */
          <div className="text-center">
            <div
              role="status"
              className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400"
            >
              Your password has been reset successfully!
            </div>

            <Link
              href="/login"
              className="inline-block w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Go to login
            </Link>
          </div>
        ) : (
          /* Reset Password Form */
          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5"
          >
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  required
                  minLength={8}
                  maxLength={72}
                  className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 pr-20 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  className="absolute inset-y-0 right-4 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Use 8 to 72 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  disabled={loading}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 pr-20 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  className="absolute inset-y-0 right-4 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#111827] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Resetting password..."
                : "Reset password"}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
