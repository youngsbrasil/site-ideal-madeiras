import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso Administrativo — Ideal Madeiras" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setMsg("Conta criada! Verifique seu email (ou já pode entrar se a confirmação estiver desativada).");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setMsg(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-700 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-emerald-800">Ideal Madeiras</div>
          <div className="text-sm text-muted-foreground">Painel Administrativo</div>
        </div>
        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={mode === "login" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("login")}
          >
            Entrar
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("signup")}
          >
            Criar conta
          </Button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
          {msg && <p className="text-sm text-center text-muted-foreground">{msg}</p>}
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Voltar para o site</Link>
          <p className="mt-2">O primeiro usuário cadastrado torna-se administrador automaticamente.</p>
        </div>
      </Card>
    </div>
  );
}
