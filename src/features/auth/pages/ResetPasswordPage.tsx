// Page for handling password reset using the token from the reset link
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// Import the reset password form component
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export function ResetPasswordPage({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleDone = () => {
    setDone(true);
    setTimeout(() => {
      router.push("/auth");
    }, 2000);
  };

  // If the token is missing or invalid, show an error message
  if (!token) {
    return (
      <div className="text-center text-red-400 mt-20">
        Invalid or missing token
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900 p-6 rounded-xl border border-slate-800">
      <AnimatePresence>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Changed 🎉</h2>
              <p className="text-slate-400">Redirecting to login...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResetPasswordForm token={token} done={done} onDone={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
