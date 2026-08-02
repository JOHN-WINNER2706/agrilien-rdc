import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sprout, ShoppingCart, Truck, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const roleIcons = {
    agriculteur: Sprout,
    grossiste: ShoppingCart,
    transporteur: Truck,
    admin: Shield,
  };

  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || Sprout;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name || "Utilisateur"}</CardTitle>
              <p className="text-muted-foreground flex items-center gap-2">
                <RoleIcon className="h-4 w-4" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <p>{user.phone || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Province</p>
                <p>{user.province || "Non renseignée"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Note</p>
                <p>{user.rating ? `${user.rating}/5` : "Pas encore noté"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio</p>
              <p className="mt-1">{user.bio || "Aucune description"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}