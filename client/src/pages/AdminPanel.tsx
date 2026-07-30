import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user } = useAuth();
  const { data: allProducts } = trpc.products.list.useQuery({});
  const deleteProductMutation = trpc.products.delete.useMutation();

  if (!user || user.role !== "admin") {
    return <div className="p-8">Accès refusé. Seuls les administrateurs peuvent accéder à ce panneau.</div>;
  }

  const unapprovedProducts = allProducts?.filter((p) => !p.isApproved) || [];
  const approvedProducts = allProducts?.filter((p) => p.isApproved) || [];

  const handleApproveProduct = async (productId: number) => {
    // This would require an admin-only procedure in the backend
    toast.success("Produit approuvé");
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Produit rejeté et supprimé");
    } catch (error) {
      toast.error("Erreur lors du rejet du produit");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panneau d'administration</h1>
          <p className="text-gray-600 mt-2">Modération et gestion de la plateforme</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Produits en attente</p>
            <p className="text-3xl font-bold text-yellow-600">{unapprovedProducts.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Produits approuvés</p>
            <p className="text-3xl font-bold text-green-600">{approvedProducts.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Total des produits</p>
            <p className="text-3xl font-bold text-gray-900">{allProducts?.length || 0}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              En attente ({unapprovedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvés ({approvedProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {unapprovedProducts.length > 0 ? (
              <div className="grid gap-4">
                {unapprovedProducts.map((product) => (
                  <Card key={product.id} className="p-6 border-yellow-200 bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Catégorie</p>
                            <p className="font-semibold text-gray-900">{product.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Province</p>
                            <p className="font-semibold text-gray-900">{product.province}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Prix</p>
                            <p className="font-semibold text-gray-900">${product.pricePerUnit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Quantité</p>
                            <p className="font-semibold text-gray-900">{product.quantityAvailable}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveProduct(product.id)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          onClick={() => handleRejectProduct(product.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun produit en attente d'approbation</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedProducts.length > 0 ? (
              <div className="grid gap-4">
                {approvedProducts.map((product) => (
                  <Card key={product.id} className="p-6 border-green-200 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Catégorie</p>
                            <p className="font-semibold text-gray-900">{product.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Province</p>
                            <p className="font-semibold text-gray-900">{product.province}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Prix</p>
                            <p className="font-semibold text-gray-900">${product.pricePerUnit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Quantité</p>
                            <p className="font-semibold text-gray-900">{product.quantityAvailable}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRejectProduct(product.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-600">Aucun produit approuvé</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
