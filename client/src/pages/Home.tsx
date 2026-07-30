import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Leaf, TrendingUp, MapPin, MessageSquare, Star, Shield } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">AgriLien</span>
          </div>
          <a href={getLoginUrl()}>
            <Button variant="outline">Se connecter</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Connectez producteurs et acheteurs en RDC
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AgriLien RDC est la plateforme qui met en relation directe les agriculteurs des provinces avec les grossistes urbains, sans intermédiaires.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Je suis agriculteur
                </Button>
              </a>
              <a href={getLoginUrl()}>
                <Button size="lg" variant="outline">
                  Je suis grossiste
                </Button>
              </a>
            </div>
          </div>
          <div className="bg-green-100 rounded-lg h-96 flex items-center justify-center">
            <Leaf className="w-32 h-32 text-green-600 opacity-50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Pourquoi AgriLien RDC ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Prix Justes</h3>
              <p className="text-gray-600">
                Éliminez les intermédiaires. Les agriculteurs reçoivent plus, les grossistes paient moins.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <MapPin className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Localisation</h3>
              <p className="text-gray-600">
                Trouvez les producteurs et points de collecte sur une carte interactive par province.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <MessageSquare className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Communication</h3>
              <p className="text-gray-600">
                Négociez directement avec les producteurs via la messagerie intégrée.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Sécurité</h3>
              <p className="text-gray-600">
                Suivi complet des commandes et système de notation pour la confiance.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <Star className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Notation</h3>
              <p className="text-gray-600">
                Évaluez vos partenaires pour construire une communauté fiable.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Croissance</h3>
              <p className="text-gray-600">
                Augmentez vos ventes et votre portée sur tout le territoire congolais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre activité ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'agriculteurs et de grossistes qui utilisent AgriLien RDC.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">
                S'inscrire comme agriculteur
              </Button>
            </a>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                S'inscrire comme grossiste
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-green-500" />
                <span className="font-bold text-white">AgriLien</span>
              </div>
              <p className="text-sm">Plateforme agricole pour la RDC</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>Fonctionnalités</li>
                <li>Tarification</li>
                <li>Sécurité</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li>À propos</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>Conditions</li>
                <li>Confidentialité</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 AgriLien RDC. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
