import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="section-container py-24 text-center text-brand-muted font-medium">
        Loading secure login...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
