import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthShell title="Let’s begin" subtitle="Create your free account to start your wedding website.">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
