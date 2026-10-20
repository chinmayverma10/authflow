
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UserProfile {
  username: string;
  email: string;
  isVerified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await axios.get<{
          user: UserProfile;
        }>("/api/users/profile");

        if (active) {
          setUser(response.data.user);
        }
      } catch {
        if (active) {
          setError(true);
          toast.error("Unable to load your profile");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const onLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await axios.post("/api/users/logout");

      toast.success("Logged out successfully!");

      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#111827] p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Auth<span className="text-blue-500">Flow</span>
        </h1>

        {loading ? (
          <p className="text-center text-slate-400">
            Loading profile...
          </p>
        ) : error ? (
          <p className="text-center text-red-400">
            Unable to load your profile.
          </p>
        ) : user ? (
          <>
            <h2 className="mb-8 text-center text-2xl font-semibold">
              Welcome back, {user.username}!
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400">
                  Email address
                </p>
                <p className="mt-1 break-all font-medium">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Verification status
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    user.isVerified
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {user.isVerified
                    ? "Verified"
                    : "Not verified"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-slate-400">
            Profile unavailable.
          </p>
        )}

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mt-8 w-full rounded-lg bg-red-600 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </main>
  );
}
