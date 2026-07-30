import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, MapPin, Package, Loader2, ShoppingCart, Sprout } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Products() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  
  // Récupère les produits approuvés
  const { data: products, isLoading } = trpc.products.list?.useQuery({ 
    province: province || undefined,
  }) || { data: [], isLoading: false };

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">AgriLien</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {user?.role === "agriculteur" && (
              <Link href="/products/new">
                <Button size="sm">Publier un produit</Button>
              </Link>
            )}
            {user && (
              <Link href={`/dashboard/${user.role}`}>
                <Button variant="outline" size="sm">Mon espace</Button>
              </Link>
            )}
            {!user && (
              <Link href="/">
                <Button variant="outline" size="sm">Connexion</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Catalogue des produits</h1>
        <p className="text-muted-foreground mb-8">
          Découvrez les produits frais disponibles dans toute la RDC
        </p>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un produit (tomates, manioc...)" 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-64">
            <Input 
              placeholder="Filtrer par province..." 
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${product.pricePerUnit}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {product.province || "Province non précisée"}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Stock: {product.quantityAvailable} {product.unit}</span>
                    <span className="text-xs text-muted-foreground">
                      Récolte: {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString("fr-FR") : "N/A"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/products/${product.id}`}>
                      <Button className="w-full gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun produit trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}