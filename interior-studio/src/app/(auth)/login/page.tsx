"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const user = await res.json();
          if (user?.role === "DESIGNER" || user?.role === "ADMIN") {
            router.push("/designer/dashboard");
          } else {
            router.push("/client/dashboard");
          }
        } else {
          // If role lookup fails, check email as fallback then go to client
          router.push("/client/dashboard");
        }
      } catch {
        router.push("/client/dashboard");
      }
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0" style={{ backgroundColor: "#FFFFFF" }}>
      <CardHeader className="text-center pb-2 pt-10">
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
          Nook & Nest
        </p>
        <h1
          className="text-4xl font-light"
          style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}
        >
          Welcome Back
        </h1>
        <p className="text-sm mt-2" style={{ color: "#7A7A7A" }}>
          Sign in to access your portal
        </p>
      </CardHeader>

      <CardContent className="px-10 pb-10 pt-6">
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" style={{ color: "#4A4A4A", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              EMAIL ADDRESS
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: "#4A4A4A", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#FAF8F5" }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 tracking-widest text-sm uppercase"
            style={{
              backgroundColor: "#8B7355",
              color: "#FFFFFF",
              border: "none",
              height: "48px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#7A7A7A" }}>
          Need access? Contact your designer.
        </p>
      </CardContent>
    </Card>
  );
}
