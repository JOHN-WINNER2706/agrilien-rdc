import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, MapPin, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function DashboardTransporter() {
  const { user } = useAuth();
  const { data: orders } = trpc.orders.myOrders.useQuery();
  const [activeTab, setActiveTab] = useState("disponibles");

  if (!user) {
    return (
      <DashboardLayout>
        <div></div>
      </DashboardLayout>
    );
  }

  if (user.role !== "transporteur") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-4">Accès réservé</h2>
          <p className="text-muted-foreground">Cette page est réservée aux transporteurs.</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: "Livraisons disponibles", value: 0, icon: Package, color: "text-amber-600" },
    { label: "En cours", value: orders?.filter((o: any) => o.status === "en_transit").length ?? 0, icon: Truck, color: "text-sky-600" },
    { label: "Livraisons terminées", value: orders?.filter((o: any) => o.status === "livree").length ?? 0, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Revenus totaux", value: "$0.00", icon: TrendingUp, color: "text-primary" },
  ];

  const tabs = [
    { id: "disponibles", label: "Disponibles" },
    { id: "encours", label: "En cours" },
    { id: "historique", label: "Historique" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord transporteur</h1>
          <p className="text-muted-foreground">Bienvenue, {user.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {activeTab === "disponibles" && "Aucune livraison disponible pour le moment"}
                {activeTab === "encours" && "Aucune livraison en cours"}
                {activeTab === "historique" && "Aucun historique de livraison"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Les commandes apparaîtront ici quand un agriculteur aura besoin d'un transporteur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}