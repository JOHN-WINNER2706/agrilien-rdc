import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RateOrder({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const orderId = parseInt(params.id);

  const { data: order, isLoading } = trpc.orders.getById.useQuery(orderId);
  const { data: canRate } = trpc.ratings.canRate.useQuery(orderId);
  const { data: product } = trpc.products.getById.useQuery(order?.productId || 0, {
    enabled: !!order?.productId,
  });
  const { data: farmer } = trpc.users.getProfile.useQuery(product?.farmerId || 0, {
    enabled: !!product?.farmerId,
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createRatingMutation = trpc.ratings.create.useMutation();

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (!order) return <div className="p-8">Commande non trouvée</div>;
  if (!canRate) return <div className="p-8">Vous ne pouvez pas noter cette commande</div>;

  const handleSubmit = async () => {
    if (!farmer) {
      toast.error("Impossible de trouver le producteur");
      return;
    }

    try {
      await createRatingMutation.mutateAsync({
        orderId,
        ratedUserId: farmer.id,
        rating,
        comment: comment || undefined,
      });
      toast.success("Évaluation enregistrée avec succès");
      navigate("/dashboard/grossiste");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'évaluation");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Évaluer cette commande</h1>
          <p className="text-gray-600 mb-8">Commande #{order.id}</p>

          {/* Product Info */}
          {product && (
            <Card className="p-6 mb-8 bg-gray-50">
              <h2 className="font-semibold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm">
                Quantité: {order.quantity} {product.unit} • Total: ${order.totalPrice}
              </p>
            </Card>
          )}

          {/* Farmer Info */}
          {farmer && (
            <Card className="p-6 mb-8 border-green-200 bg-green-50">
              <h2 className="font-semibold text-gray-900 mb-2">Producteur</h2>
              <p className="text-gray-700">{farmer.name}</p>
              <p className="text-gray-600 text-sm">Province: {farmer.province}</p>
            </Card>
          )}

          {/* Rating Form */}
          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Votre évaluation
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Très mauvais"}
                {rating === 2 && "Mauvais"}
                {rating === 3 && "Acceptable"}
                {rating === 4 && "Bon"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce producteur..."
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/grossiste")}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createRatingMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createRatingMutation.isPending ? "Envoi..." : "Envoyer l'évaluation"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
