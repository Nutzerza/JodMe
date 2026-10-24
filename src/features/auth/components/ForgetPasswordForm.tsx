// Component for handling the forget password form
"use client";

import { useState } from "react";
import { Mail, Send, Loader2, TriangleAlert } from "lucide-react";

export function ForgetPasswordForm({
  email,
  setEmail,
  onDone,
}: {
  email: string;
  setEmail: (email: string) => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email is not valid");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send a request to the server to initiate the password reset process
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      onDone();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        <Mail className="w-5 h-5 text-indigo-400" />
      </div>

      <h1 className="text-white font-bold text-2xl mb-1">Forget Password?</h1>
      <p className="text-slate-400 text-sm mb-7 leading-relaxed">
        Enter the email associated with your account. We will send a link to
        reset your password.
      </p>

      <form onSubmit={submit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(99,102,241,0.8)" }}
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{
                color: error ? "#f87171" : email ? "#6366f1" : "#475569",
              }}
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
              style={{
                background: "rgba(15,23,42,0.8)",
                border: `1px solid ${error ? "rgba(248,113,113,0.5)" : email ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.15)"}`,
                boxShadow: error
                  ? "0 0 0 3px rgba(248,113,113,0.08)"
                  : email
                    ? "0 0 0 3px rgba(99,102,241,0.08)"
                    : "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = `1px solid ${error ? "rgba(248,113,113,0.6)" : "rgba(99,102,241,0.5)"}`;
                e.currentTarget.style.boxShadow = error
                  ? "0 0 0 3px rgba(248,113,113,0.1)"
                  : "0 0 0 3px rgba(99,102,241,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = `1px solid ${error ? "rgba(248,113,113,0.5)" : email ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.15)"}`;
                e.currentTarget.style.boxShadow = error
                  ? "0 0 0 3px rgba(248,113,113,0.08)"
                  : email
                    ? "0 0 0 3px rgba(99,102,241,0.08)"
                    : "none";
              }}
            />
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <TriangleAlert className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          style={{
            background: "linear-gradient(135deg,#4f46e5,#6366f1 50%,#14b8a6)",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}
          onMouseEnter={(e) =>
            !loading &&
            ((e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 24px rgba(99,102,241,0.5)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 20px rgba(99,102,241,0.35)")
          }
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send reset link
            </>
          )}
        </button>
      </form>
    </>
  );
}
