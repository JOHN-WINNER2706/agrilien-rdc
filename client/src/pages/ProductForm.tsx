import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Légumes",
  "Fruits",
  "Céréales",
  "Tubercules",
  "Oléagineux",
  "Produits laitiers",
  "Viande",
  "Poisson",
  "Autres",
];

const PROVINCES = [
  "Kasai",
  "Kasai Central",
  "Kasai Oriental",
  "Kinshasa",
  "Kongo Central",
  "Kwango",
  "Kwilu",
  "Lomami",
  "Lualaba",
  "Maniema",
  "Mongala",
  "Nord-Kivu",
  "Nord-Ubangi",
  "Sankuru",
  "Sud-Kivu",
  "Sud-Ubangi",
  "Tanganyika",
  "Tshopo",
  "Tshuapa",
];

export default function ProductForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    pricePerUnit: "",
    unit: "",
    quantityAvailable: "",
    province: "",
    location: "",
    harvestDate: "",
    expiryDate: "",
  });

  const createMutation = trpc.products.create.useMutation();

  if (!user || user.role !== "agriculteur") {
    return <div className="p-8">Accès refusé. Seuls les agriculteurs peuvent publier des produits.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.pricePerUnit ||
      !formData.unit ||
      !formData.quantityAvailable ||
      !formData.province
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        unit: formData.unit,
        quantityAvailable: parseInt(formData.quantityAvailable),
        province: formData.province,
        location: formData.location || undefined,
        harvestDate: formData.harvestDate || undefined,
        expiryDate: formData.expiryDate || undefined,
      });

      toast.success("Produit publié avec succès");
      navigate("/dashboard/agriculteur");
    } catch (error) {
      toast.error("Erreur lors de la publication du produit");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Publier un produit</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du produit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Tomates fraîches"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre produit en détail..."
                rows={4}
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prix et Unité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix unitaire ($) *
                </label>
                <Input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité *
                </label>
                <Input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Ex: kg, litre, pièce"
                  required
                />
              </div>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité disponible *
              </label>
              <Input
                type="number"
                name="quantityAvailable"
                value={formData.quantityAvailable}
                onChange={handleChange}
                placeholder="0"
                min="1"
                required
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <Select value={formData.province} onValueChange={(value) => handleSelectChange("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation (village/quartier)
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Kinshasa, quartier Gombe"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de récolte
                </label>
                <Input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration
                </label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/agriculteur")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createMutation.isPending ? "Publication..." : "Publier le produit"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
