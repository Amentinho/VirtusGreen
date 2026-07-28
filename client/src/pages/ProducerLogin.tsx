import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Leaf, ChevronLeft } from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";

const inputCls = "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cta/40";

export default function ProducerLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }
      setLocation("/producer/dashboard");
    } catch (e: any) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <img src={logoImage} alt="VirtusGreen" className="h-8 w-auto object-contain" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-cta/10 flex items-center justify-center mx-auto">
              <Leaf className="w-6 h-6 text-cta" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Producer login</h1>
            <p className="text-sm text-muted-foreground">Access your batches and Digital Product Passports</p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@farm.it"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
              <input
                className={inputCls}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-cta hover:bg-cta/90 text-cta-foreground" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in…</> : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <button onClick={() => setLocation("/producer/register")} className="text-cta underline hover:no-underline">
              Register here
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
