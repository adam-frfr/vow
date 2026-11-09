import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep planning.">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
