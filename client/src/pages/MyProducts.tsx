import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function MyProducts() {
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Mes annonces</h1>
          <Button onClick={() => setLocation("/products/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Sprout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Vous n'avez pas encore d'annonces.</p>
            <Button variant="outline" className="mt-4" onClick={() => setLocation("/products/new")}>
              Créer ma première annonce
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}