// Forget password page for handling user password reset requests
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
// Components for handling forget password form and success state
import { ForgetPasswordForm } from "@/features/auth/components/ForgetPasswordForm";
import { ForgetPasswordSend } from "@/features/auth/components/ForgetPasswordSend";

export function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onDone = () => {
    setDone(true);
  };

  const onResend = () => {
    setDone(false);
    setEmail("");
  };

  return (
    <>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle,#6366f1 0%,transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle,#14b8a6 0%,transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-110 relative z-10"
      >
        <div className="relative w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg,#0d1526 0%,#0a1020 100%)",
              border: "1px solid rgba(99,102,241,0.18)",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.05)",
            }}
          >
            {/* Top glow stripe */}
            <div
              className="h-0.5 w-full"
              style={{
                background:
                  "linear-gradient(to right,transparent,#6366f1,#14b8a6,transparent)",
              }}
            />

            <div className="px-8 py-8">
              {done ? (
                /* ── Success state ── */
                <ForgetPasswordSend email={email} onResend={onResend} />
              ) : (
                /* ── Form state ── */
                <ForgetPasswordForm
                  email={email}
                  setEmail={setEmail}
                  onDone={onDone}
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 flex items-center justify-center"
              style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}
            >
              <Link
                href="/auth"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          </div>

          {/* Floating label below */}
          <p className="text-center text-slate-600 text-xs mt-5">
            New here?{" "}
            <Link
              href="/auth"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </>
  );
}
