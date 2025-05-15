import { LoginForm } from "@/components/features/login";

export const metadata = {
  title: "CTS | Login",
  description: "Login page for CTS",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}