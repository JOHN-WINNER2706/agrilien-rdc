import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function DashboardFarmer() {
  const { user } = useAuth();
  const { data: myProducts, isLoading: productsLoading } = trpc.products.myProducts.useQuery();
  const { data: receivedOrders, isLoading: ordersLoading } = trpc.orders.receivedOrders.useQuery();

  if (!user) {
    return (
      <DashboardLayout>
        <div></div>
      </DashboardLayout>
    );
  }
  
  if (user.role !== "agriculteur") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-4">Accès réservé</h2>
          <p className="text-muted-foreground">Cette page est réservée aux agriculteurs.</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = receivedOrders?.reduce((sum, order) => sum + Number(order.totalPrice), 0) || 0;
  const completedOrders = receivedOrders?.filter((o) => o.status === "livrée").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord agriculteur</h1>
            <p className="text-gray-600 mt-2">Bienvenue, {user.name}</p>
          </div>
          <Link href="/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Publier un produit
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Produits publiés</p>
                <p className="text-3xl font-bold text-gray-900">{myProducts?.length || 0}</p>
              </div>
              <Package className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commandes reçues</p>
                <p className="text-3xl font-bold text-gray-900">{receivedOrders?.length || 0}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commandes livrées</p>
                <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenus totaux</p>
                <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Mes produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes reçues</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {productsLoading ? (
              <div>Chargement...</div>
            ) : myProducts && myProducts.length > 0 ? (
              <div className="grid gap-4">
                {myProducts.map((product) => (
                  <Card key={product.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                        <div className="flex gap-4 mt-4 text-sm">
                          <span className="text-gray-600">
                            Prix: ${product.pricePerUnit} / {product.unit}
                          </span>
                          <span className="text-gray-600">
                            Quantité: {product.quantityAvailable}
                          </span>
                          <span className="text-gray-600">
                            Statut: <span className="font-semibold">{product.status}</span>
                          </span>
                        </div>
                      </div>
                      <Link href={`/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Vous n'avez pas encore publié de produits</p>
                <Link href="/products/new">
                  <Button>Publier votre premier produit</Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div>Chargement...</div>
            ) : receivedOrders && receivedOrders.length > 0 ? (
              <div className="grid gap-4">
                {receivedOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          Commande #{order.id}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
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
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
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
                <p className="text-gray-600">Vous n'avez pas encore reçu de commandes</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
