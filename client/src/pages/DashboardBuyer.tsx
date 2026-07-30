import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search, ShoppingCart, TrendingDown, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function DashboardBuyer() {
  const { user } = useAuth();
  const { data: myOrders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery();
  const { data: products } = trpc.products.list.useQuery({});
  const [searchProvince, setSearchProvince] = useState("");

  if (!user || user.role !== "grossiste") {
    return <div>Accès refusé</div>;
  }

  const totalSpent = myOrders?.reduce((sum, order) => sum + Number(order.totalPrice), 0) || 0;
  const pendingOrders = myOrders?.filter((o) => o.status === "en attente").length || 0;
  const deliveredOrders = myOrders?.filter((o) => o.status === "livrée").length || 0;

  const filteredProducts = searchProvince
    ? products?.filter((p) => p.province === searchProvince)
    : products;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord grossiste</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commandes passées</p>
                <p className="text-3xl font-bold text-gray-900">{myOrders?.length || 0}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Livrées</p>
                <p className="text-3xl font-bold text-gray-900">{deliveredOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Dépenses totales</p>
                <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList>
            <TabsTrigger value="catalog">Catalogue</TabsTrigger>
            <TabsTrigger value="orders">Mes commandes</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par province..."
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                        <div className="flex gap-4 mt-4 text-sm">
                          <span className="text-gray-600">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {product.province}
                          </span>
                          <span className="text-gray-600">
                            Prix: ${product.pricePerUnit} / {product.unit}
                          </span>
                          <span className="text-gray-600">
                            Quantité: {product.quantityAvailable}
                          </span>
                        </div>
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <Button>Commander</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun produit disponible</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div>Chargement...</div>
            ) : myOrders && myOrders.length > 0 ? (
              <div className="grid gap-4">
                {myOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          Commande #{order.id}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">Quantité</p>
                            <p className="font-semibold text-gray-900">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-semibold text-gray-900">${order.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Statut</p>
                            <p className="font-semibold text-gray-900">{order.status}</p>
                          </div>
                        </div>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Vous n'avez pas encore passé de commandes</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
