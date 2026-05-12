// app/auth/reset-password/page.tsx

import ResetPasswordForm from "@/components/authPage/ResetPasswordForm";

export const dynamic = "force-dynamic"; // กัน prerender error

export default function Page() {
  return <ResetPasswordForm />;
}
