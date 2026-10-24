import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-white overflow-hidden relative flex items-center justify-center"
      style={{
        background:
          "linear-gradient(160deg, #020617 0%, #0c1a2e 40%, #0d2137 65%, #020617 100%)",
      }}
    >
      <main className="w-full max-w-110 relative z-10">{children}</main>
    </div>
  );
}
