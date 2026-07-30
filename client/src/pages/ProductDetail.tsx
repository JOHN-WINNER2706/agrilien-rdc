import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MapPin, User, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const productId = parseInt(params.id);

  const { data: product, isLoading } = trpc.products.getById.useQuery(productId);
  const { data: farmerProfile } = trpc.users.getProfile.useQuery(product?.farmerId || 0, {
    enabled: !!product?.farmerId,
  });

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const createOrderMutation = trpc.orders.create.useMutation();

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (!product) return <div className="p-8">Produit non trouvé</div>;

  const totalPrice = Number(product.pricePerUnit) * quantity;

  const handleOrder = async () => {
    if (!user || user.role !== "grossiste") {
      toast.error("Seuls les grossistes peuvent commander");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        productId,
        quantity,
        notes: notes || undefined,
      });
      toast.success("Commande créée avec succès");
      navigate("/dashboard/grossiste");
    } catch (error) {
      toast.error("Erreur lors de la création de la commande");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-8">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Pas d'image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>

            {/* Farmer Info */}
            {farmerProfile && (
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  {farmerProfile.profilePicture ? (
                    <img
                      src={farmerProfile.profilePicture}
                      alt={farmerProfile.name || "Profil"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-green-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{farmerProfile.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {farmerProfile.province}
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-900 font-semibold">
                        {farmerProfile.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Product Details */}
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Catégorie</p>
                  <p className="font-semibold text-gray-900">{product.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Province</p>
                  <p className="font-semibold text-gray-900">{product.province}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Unité</p>
                  <p className="font-semibold text-gray-900">{product.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Quantité disponible</p>
                  <p className="font-semibold text-gray-900">{product.quantityAvailable}</p>
                </div>
              </div>
              {product.harvestDate && (
                <div>
                  <p className="text-gray-600 text-sm">Date de récolte</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(product.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </Card>

            {/* Order Section */}
            {user?.role === "grossiste" && (
              <Card className="p-6 space-y-4 border-green-200 bg-green-50">
                <h2 className="text-xl font-bold text-gray-900">Passer une commande</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={product.quantityAvailable}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Livraison urgente, préférence de conditionnement..."
                    className="w-full"
                    rows={3}
                    defaultValue=""
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span className="font-semibold text-gray-900">${product.pricePerUnit}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Quantité:</span>
                    <span className="font-semibold text-gray-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleOrder}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {createOrderMutation.isPending ? "Création..." : "Créer la commande"}
                </Button>
              </Card>
            )}

            {user?.role !== "grossiste" && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <p className="text-blue-900">
                  Connectez-vous en tant que grossiste pour commander ce produit.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
