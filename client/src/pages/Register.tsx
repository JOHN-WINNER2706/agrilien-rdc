import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Sprout, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    province: "",
    role: "agriculteur" as "agriculteur" | "grossiste" | "transporteur",
    password: "",
  });
  const [error, setError] = useState("");

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      setLocation("/dev-login");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      setError("Nom, téléphone et mot de passe sont obligatoires");
      return;
    }
    register.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rejoignez AgriLien RDC
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                placeholder="Jean Mukendi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="jean@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input
                placeholder="+243 81 234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Province</Label>
              <Input
                placeholder="Kinshasa"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Je suis un *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              >
                <option value="agriculteur">Agriculteur</option>
                <option value="grossiste">Grossiste</option>
                <option value="transporteur">Transporteur</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              S'inscrire
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => setLocation("/dev-login")}
                className="text-primary hover:underline"
              >
                Se connecter
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}