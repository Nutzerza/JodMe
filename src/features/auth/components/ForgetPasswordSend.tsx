// Component for displaying the success state after a forget password request
import { CheckCircle2 } from "lucide-react";

export function ForgetPasswordSend({
  email,
  onResend,
}: {
  email: string;
  onResend: () => void;
}) {
  return (
    <div className="text-center py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{
          background: "rgba(52,211,153,0.12)",
          border: "1px solid rgba(52,211,153,0.3)",
        }}
      >
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Check your email</h2>
      <p className="text-slate-400 text-sm leading-relaxed mb-1">
        If <span className="text-slate-200 font-medium">{email}</span> exists in
        our system, we have sent a password reset link.
      </p>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        If it exists in our system, we have sent a password reset link.
      </p>
      <p className="text-slate-500 text-xs mb-6">
        Didn&apos;t see the email? Try checking your spam folder.
      </p>
      <button
        onClick={onResend}
        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
      >
        Resend email
      </button>
    </div>
  );
}
