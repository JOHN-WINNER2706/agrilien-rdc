import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sprout, ShoppingCart, Truck, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function DevLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const devLogin = trpc.dev.login.useMutation({
    onSuccess: (data) => {
      window.location.href = data.redirectTo;
    },
  });

  const handleLogin = (role: "agriculteur" | "grossiste" | "transporteur" | "admin") => {
    setLoading(role);
    devLogin.mutate({ role });
  };

  const roles = [
    { id: "agriculteur" as const, label: "Agriculteur", icon: Sprout, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
    { id: "grossiste" as const, label: "Grossiste", icon: ShoppingCart, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    { id: "transporteur" as const, label: "Transporteur", icon: Truck, color: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
    { id: "admin" as const, label: "Administrateur", icon: Shield, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Mode Développement</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Choisissez un rôle pour tester l'application sans connexion Manus.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.map((role) => (
            <Button
              key={role.id}
              variant="outline"
              className={`w-full justify-start gap-3 h-14 text-base font-medium transition-all ${role.color}`}
              onClick={() => handleLogin(role.id)}
              disabled={loading !== null}
            >
              <role.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{role.label}</span>
              {loading === role.id && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          ))}
          
          <div className="pt-4 text-center">
            <button 
              onClick={() => setLocation("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}