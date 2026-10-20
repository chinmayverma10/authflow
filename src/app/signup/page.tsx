
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();

  // Store signup form data
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Track signup request
  const [loading, setLoading] = useState(false);

  // Control password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle signup form submission
  const onSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    // Username validation
    if (!user.username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    // Email validation
    if (!user.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(user.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (user.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      // Send signup data to backend
      await axios.post("/api/users/signup", {
        username: user.username.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
      });

      // Show success message
      toast.success("Account created successfully!");

      // Redirect to login
      router.push("/login");
    } catch (error: unknown) {
      // Handle API errors safely
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error;

        toast.error(
          typeof message === "string"
            ? message
            : "Unable to create account"
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
            Create your account
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Join AuthFlow and get started today.
          </p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={onSignUp}
          noValidate
          className="space-y-5"
        >

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Choose a username"
              value={user.username}
              onChange={(e) =>
                setUser({
                  ...user,
                  username: e.target.value,
                })
              }
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>

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
                setUser({
                  ...user,
                  email: e.target.value,
                })
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={user.password}
                onChange={(e) =>
                  setUser({
                    ...user,
                    password: e.target.value,
                  })
                }
                disabled={loading}
                required
                minLength={8}
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

            <p className="mt-2 text-xs text-slate-400">
              Password must contain at least 8 characters.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#111827] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
