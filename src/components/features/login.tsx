"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Use Shadcn/UI Button
import { Label } from "@/components/ui/label"; // Use Shadcn/UI Label
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("LoginForm mounted:", mounted); // Debug log
    setMounted(true);
    window.scrollTo(0, 0); // Scroll to top
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mock data for authentication
    const validUsers = [
      { username: "testuser", password: "password123", role: "trader" },
      { username: "admin", password: "admin123", role: "admin" },
      { username: "guest", password: "guestpass", role: "risk" },
    ];

    const user = validUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      router.push(user.role === "trader" ? "/home" : "/risk-platform/dashboard/traders");
    } else {
      setError("Invalid username or password");
    }
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-sm bg-background p-4 rounded-lg">
        Loading...
      </div>
    ); // Fallback
  }

  const logoSrc =
    theme === "light" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches)
      ? "/images/logo-light.png"
      : "/images/logo-light.png"; //change if there's a dark logo

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 mt-0 bg-background rounded-lg",
        className
      )}
    >
      {/* Uncomment ModeToggle if needed */}
      {/* <div className="w-full flex justify-end">
        <ModeToggle />
      </div> */}
      <div className="w-60 aspect-[3/1]">
        <img
          src={logoSrc}
          alt="Company Logo"
          className="h-full w-full object-contain"
        />
      </div>
      <form onSubmit={handleLogin} className="flex flex-col w-full gap-3">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
      <p className="text-xs text-muted-foreground text-center">
        Don't have an account?{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Contact your administrator.
        </a>
      </p>
    </div>
  );
}