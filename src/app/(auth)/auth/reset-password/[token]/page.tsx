// Page for handling password reset using the token from the reset link
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

interface Props {
  params: {
    token: string;
  };
}
export const dynamic = "force-dynamic"; // กัน prerender error

export default async function Page({ params }: Props) {
  const { token } = await params;
  return <ResetPasswordPage token={token} />;
}
