
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();

  // Store login form values
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  // Track API request and password visibility
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate requests
    if (loading) return;

    // Validate email
    if (!user.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(user.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!user.password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      // Send credentials to the login API
      await axios.post("/api/users/login", {
        email: user.email.trim().toLowerCase(),
        password: user.password,
      });

      toast.success("Logged in successfully!");

      // Navigate to the protected profile page
      router.replace("/profile");
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error;

        toast.error(
          typeof message === "string"
            ? message
            : "Unable to log in. Please try again."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
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
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your account.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={onLogin}
          noValidate
          className="space-y-5"
        >

          {/* Email */}
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
              value={user.email}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={user.password}
                onChange={(e) =>
                  setUser((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                disabled={loading}
                required
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
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute inset-y-0 right-4 text-sm font-medium text-blue-400 hover:text-blue-300 disabled:opacity-60"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/forgotpassword"
              className="text-sm text-blue-400 transition hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#111827] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-400 transition hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
