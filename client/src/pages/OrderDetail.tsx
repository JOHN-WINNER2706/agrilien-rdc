import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MapPin, User, Package, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ORDER_STATUSES = ["en attente", "confirmée", "en transit", "livrée"];

export default function OrderDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const orderId = parseInt(params.id);

  const { data: order, isLoading } = trpc.orders.getById.useQuery(orderId);
  const { data: product } = trpc.products.getById.useQuery(order?.productId || 0, {
    enabled: !!order?.productId,
  });
  const { data: buyer } = trpc.users.getProfile.useQuery(order?.buyerId || 0, {
    enabled: !!order?.buyerId,
  });
  const { data: farmer } = trpc.users.getProfile.useQuery(product?.farmerId || 0, {
    enabled: !!product?.farmerId,
  });

  const [newStatus, setNewStatus] = useState(order?.status || "");
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (!order) return <div className="p-8">Commande non trouvée</div>;

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) {
      toast.error("Sélectionnez un nouveau statut");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus as "en attente" | "confirmée" | "en transit" | "livrée",
      });
      toast.success("Statut de la commande mis à jour");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmée":
        return "bg-blue-100 text-blue-800";
      case "en transit":
        return "bg-purple-100 text-purple-800";
      case "livrée":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canUpdateStatus =
    (user?.role === "agriculteur" && farmer?.id === user.id) ||
    (user?.role === "grossiste" && buyer?.id === user.id) ||
    user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commande #{order.id}</h1>
          <p className="text-gray-600 mt-2">
            Créée le {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Status */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statut</h2>
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </div>

              {canUpdateStatus && (
                <div className="mt-4 space-y-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.filter((s) => s !== order.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending}
                    className="w-full"
                  >
                    {updateStatusMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                  </Button>
                </div>
              )}
            </Card>

            {/* Product Info */}
            {product && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Produit</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Quantité commandée</p>
                      <p className="font-semibold text-gray-900">{order.quantity} {product.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Prix unitaire</p>
                      <p className="font-semibold text-gray-900">${product.pricePerUnit}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Province</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">{product.province}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700">{order.notes}</p>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Commande créée</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.orderDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                {order.actualDeliveryDate && (
                  <div className="flex gap-4">
                    <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Livrée</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.actualDeliveryDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Total */}
            <Card className="p-6 bg-green-50 border-green-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Total</h2>
              <p className="text-4xl font-bold text-green-600">${order.totalPrice}</p>
            </Card>

            {/* Buyer */}
            {buyer && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Acheteur</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="font-semibold text-gray-900">{buyer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Province</p>
                    <p className="font-semibold text-gray-900">{buyer.province}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Farmer */}
            {farmer && (
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Producteur</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="font-semibold text-gray-900">{farmer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Province</p>
                    <p className="font-semibold text-gray-900">{farmer.province}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Button variant="outline" className="w-full">
              Contacter le producteur
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
