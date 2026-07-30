# AgriLien RDC - Document de Conception Complet

## 1. Vue d'ensemble de l'application

### Concept et Problématique

**AgriLien RDC** est une plateforme numérique de mise en relation directe entre les agriculteurs des provinces congolaises, les grossistes urbains et les transporteurs logistiques. La plateforme résout un problème critique dans la chaîne d'approvisionnement agricole en RDC : l'absence d'intermédiaires numériques fiables qui connectent les producteurs aux acheteurs en gros.

Les défis majeurs adressés par AgriLien RDC incluent :

- **Fragmentation du marché** : Les agriculteurs ne disposent pas d'accès direct aux acheteurs en gros, forçant les ventes via des intermédiaires qui prélèvent des commissions excessives.
- **Manque de transparence** : Absence de système centralisé de prix, de disponibilité et de localisation des produits.
- **Logistique inefficace** : Pas de coordination entre producteurs et transporteurs, entraînant des délais et des pertes post-récolte.
- **Absence de traçabilité** : Aucun suivi des commandes, des livraisons ou de la qualité des produits.
- **Risque de crédit** : Les grossistes hésitent à commander sans connaître les antécédents des agriculteurs.

### Proposition de Valeur

AgriLien RDC offre une plateforme intégrée qui :

1. **Pour les agriculteurs** : Accès direct aux acheteurs en gros, augmentation des prix de vente, visibilité nationale, gestion simplifiée des commandes.
2. **Pour les grossistes** : Accès à un catalogue centralisé de produits, prix compétitifs, livraison coordonnée, historique de fiabilité des fournisseurs.
3. **Pour les transporteurs** : Accès à un flux constant de commandes, optimisation des trajets, paiement assuré via la plateforme.
4. **Pour la RDC** : Amélioration de la sécurité alimentaire, augmentation des revenus agricoles, création d'emplois dans la logistique.

---

## 2. Modèle de Données

### Entités Principales

#### 2.1 Users (Utilisateurs)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| openId | VARCHAR(64) | Identifiant OAuth Manus unique |
| name | TEXT | Nom complet de l'utilisateur |
| email | VARCHAR(320) | Adresse email unique |
| role | ENUM | Rôle : `agriculteur`, `grossiste`, `transporteur`, `admin` |
| phone | VARCHAR(20) | Numéro de téléphone |
| province | VARCHAR(100) | Province de résidence (pour localisation) |
| profilePicture | VARCHAR(255) | URL de la photo de profil |
| bio | TEXT | Biographie ou description de l'entreprise |
| isVerified | BOOLEAN | Statut de vérification du compte |
| rating | DECIMAL(3,2) | Note moyenne (0-5) |
| createdAt | TIMESTAMP | Date de création |
| updatedAt | TIMESTAMP | Date de dernière mise à jour |

#### 2.2 Products (Produits/Annonces)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| farmerId | INT | Clé étrangère vers users (agriculteur) |
| name | VARCHAR(255) | Nom du produit |
| description | TEXT | Description détaillée |
| category | VARCHAR(100) | Catégorie (légumes, fruits, céréales, etc.) |
| pricePerUnit | DECIMAL(10,2) | Prix unitaire en USD |
| unit | VARCHAR(50) | Unité (kg, sac, crate, etc.) |
| quantityAvailable | INT | Quantité disponible |
| province | VARCHAR(100) | Province de production |
| location | VARCHAR(255) | Localisation précise (latitude, longitude) |
| harvestDate | DATE | Date de récolte |
| expiryDate | DATE | Date d'expiration estimée |
| imageUrl | VARCHAR(255) | URL de la photo du produit |
| status | ENUM | Statut : `disponible`, `partiellement_vendu`, `épuisé`, `supprimé` |
| isApproved | BOOLEAN | Approuvé par modérateur |
| createdAt | TIMESTAMP | Date de création |
| updatedAt | TIMESTAMP | Date de dernière mise à jour |

#### 2.3 Orders (Commandes)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| buyerId | INT | Clé étrangère vers users (grossiste) |
| productId | INT | Clé étrangère vers products |
| quantity | INT | Quantité commandée |
| totalPrice | DECIMAL(10,2) | Prix total |
| status | ENUM | Statut : `en attente`, `confirmée`, `en transit`, `livrée` |
| orderDate | TIMESTAMP | Date de la commande |
| deliveryDate | TIMESTAMP | Date de livraison prévue |
| actualDeliveryDate | TIMESTAMP | Date de livraison réelle |
| transporterId | INT | Clé étrangère vers users (transporteur) |
| notes | TEXT | Notes additionnelles |
| createdAt | TIMESTAMP | Date de création |
| updatedAt | TIMESTAMP | Date de dernière mise à jour |

#### 2.4 Messages (Messagerie)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| senderId | INT | Clé étrangère vers users |
| recipientId | INT | Clé étrangère vers users |
| content | TEXT | Contenu du message |
| isRead | BOOLEAN | Message lu ou non |
| createdAt | TIMESTAMP | Date de création |

#### 2.5 Ratings (Notations et Avis)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| orderId | INT | Clé étrangère vers orders |
| raterId | INT | Clé étrangère vers users (évaluateur) |
| ratedUserId | INT | Clé étrangère vers users (utilisateur évalué) |
| rating | INT | Note (1-5) |
| comment | TEXT | Commentaire |
| createdAt | TIMESTAMP | Date de création |

#### 2.6 Notifications (Notifications)

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Clé primaire auto-incrémentée |
| userId | INT | Clé étrangère vers users |
| type | VARCHAR(100) | Type : `order_received`, `order_confirmed`, `message_received`, etc. |
| title | VARCHAR(255) | Titre de la notification |
| content | TEXT | Contenu |
| isRead | BOOLEAN | Notification lue ou non |
| createdAt | TIMESTAMP | Date de création |

---

## 3. Architecture Technique

### Stack Technologique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Frontend** | React 19 + TypeScript | Interface moderne, réactive et maintenable |
| **Styling** | Tailwind CSS 4 | Utilitaires CSS pour design rapide et cohérent |
| **Backend** | Express.js 4 + Node.js | Serveur léger et performant |
| **API** | tRPC 11 | Communication type-safe entre frontend et backend |
| **Base de Données** | MySQL/TiDB (Manus) | Stockage relationnel fiable |
| **ORM** | Drizzle ORM | Migrations SQL type-safe et requêtes fluides |
| **Authentification** | Manus OAuth | Gestion d'identité intégrée |
| **Stockage Fichiers** | S3 (Manus) | Hébergement sécurisé des images et documents |
| **Cartographie** | Google Maps API | Localisation et visualisation géographique |
| **Tests** | Vitest | Tests unitaires rapides et modernes |
| **Déploiement** | Manus Platform | Hosting géré avec domaine personnalisé |

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Auth, Dashboard, Catalog, Orders, Admin │   │
│  │ Components: UI, Maps, Chat, Forms                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC + HTTP
┌────────────────────────▼────────────────────────────────────┐
│              Backend (Express.js + tRPC)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routers: auth, products, orders, messages, ratings   │   │
│  │ Procedures: publicProcedure, protectedProcedure      │   │
│  │ Database Layer: Drizzle ORM queries                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌─────▼──────┐ ┌──────▼────────┐
│  MySQL/TiDB    │ │  S3 Storage│ │ Google Maps   │
│  Database      │ │  (Images)  │ │ API           │
└────────────────┘ └────────────┘ └───────────────┘
```

### Flux de Données

1. **Authentification** : L'utilisateur se connecte via Manus OAuth, un token JWT est généré et stocké en cookie.
2. **Requête Frontend** : React appelle une procédure tRPC (ex: `trpc.products.list.useQuery()`).
3. **Validation Backend** : tRPC valide le token et les paramètres, exécute la procédure.
4. **Requête Base de Données** : Drizzle ORM exécute la requête SQL sur MySQL/TiDB.
5. **Réponse** : Les données sont retournées au frontend avec types TypeScript préservés (SuperJSON).
6. **Rendu Frontend** : React met à jour l'UI avec les données reçues.

---

## 4. Diagrammes de Conception

### 4.1 Diagramme de Cas d'Usage

```
                    ┌─────────────────┐
                    │   Agriculteur   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Publier Produit │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐          ┌──────────────┐        ┌──────────────┐
│ Gérer   │          │ Recevoir     │        │ Voir Revenus │
│Annonces │          │ Commandes    │        │              │
└─────────┘          └──────────────┘        └──────────────┘

                    ┌─────────────────┐
                    │   Grossiste     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Rechercher      │
                    │ Produits        │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐          ┌──────────────┐        ┌──────────────┐
│ Passer  │          │ Suivre       │        │ Noter        │
│Commande │          │ Commandes    │        │ Agriculteur  │
└─────────┘          └──────────────┘        └──────────────┘

                    ┌─────────────────┐
                    │   Transporteur  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Voir Commandes  │
                    │ à Livrer        │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐          ┌──────────────┐        ┌──────────────┐
│ Mettre  │          │ Communiquer  │        │ Confirmer    │
│à jour   │          │ avec Parties  │        │ Livraison    │
│Statut   │          │              │        │              │
└─────────┘          └──────────────┘        └──────────────┘

                    ┌─────────────────┐
                    │   Administrateur│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Modérer         │
                    │ Contenu         │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐          ┌──────────────┐        ┌──────────────┐
│ Approuver│          │ Gérer        │        │ Voir         │
│Annonces │          │ Utilisateurs │        │ Statistiques │
└─────────┘          └──────────────┘        └──────────────┘
```

### 4.2 Diagramme de Flux de Commande

```
┌─────────────────────────────────────────────────────────────┐
│                    Flux de Commande                         │
└─────────────────────────────────────────────────────────────┘

Grossiste visualise produit
         │
         ▼
Grossiste clique "Commander"
         │
         ▼
Formulaire de commande (quantité, notes)
         │
         ▼
Grossiste confirme
         │
         ▼
Commande créée: Status = "en attente"
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
Agriculteur reçoit notification    Transporteur voit commande
         │                                     │
         ▼                                     ▼
Agriculteur accepte/refuse         Transporteur accepte
         │                                     │
    Acceptée ─────────────────────────────────┘
         │
         ▼
Status = "confirmée"
         │
         ▼
Transporteur collecte produit
         │
         ▼
Status = "en transit"
         │
         ▼
Transporteur livre au grossiste
         │
         ▼
Status = "livrée"
         │
         ▼
Grossiste confirme réception
         │
         ▼
Notification: Évaluer agriculteur
         │
         ▼
Grossiste soumet note (1-5 étoiles + commentaire)
         │
         ▼
Note sauvegardée, agriculteur reçoit feedback
```

### 4.3 Diagramme d'Entités-Relations (ER)

```
┌──────────────────┐
│     Users        │
├──────────────────┤
│ id (PK)          │
│ openId (UNIQUE)  │
│ name             │
│ email            │
│ role             │
│ phone            │
│ province         │
│ profilePicture   │
│ bio              │
│ isVerified       │
│ rating           │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │          │          │          │
    │1         │1         │1         │
    ▼ N        ▼ N        ▼ N        ▼ N
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Products │ │ Orders │ │Messages│ │Ratings │
├──────────┤ ├────────┤ ├────────┤ ├────────┤
│ id (PK)  │ │ id(PK) │ │ id(PK) │ │ id(PK) │
│farmerId  │ │buyerId │ │senderId│ │orderId │
│(FK)      │ │(FK)    │ │(FK)    │ │(FK)    │
│ name     │ │product │ │recipnt │ │raterId │
│category  │ │ Id(FK) │ │ Id(FK) │ │(FK)    │
│ price    │ │quantity│ │content │ │ratedId │
│ quantity │ │ total  │ │ isRead │ │(FK)    │
│ province │ │ status │ │created │ │ rating │
│ location │ │ order  │ │ At     │ │comment │
│ harvest  │ │ Date   │ └────────┘ │created │
│ Date     │ │deliver │            │ At     │
│ imageUrl │ │ yDate  │            └────────┘
│ status   │ │transId │
│isApproved│ │(FK)    │
│createdAt │ │ notes  │
│updatedAt │ │created │
└──────────┘ │ At     │
             │updated │
             │ At     │
             └────────┘
```

---

## 5. Fonctionnalités Détaillées

### 5.1 Authentification et Profils

**Flux d'inscription** :
1. Utilisateur clique sur "S'inscrire" (agriculteur, grossiste ou transporteur).
2. Redirection vers Manus OAuth.
3. Après authentification, formulaire de profil avec sélection du rôle.
4. Sauvegarde du profil en base de données.
5. Redirection vers le tableau de bord approprié.

**Gestion de profil** :
- Photo de profil avec upload vers S3.
- Bio/description de l'entreprise.
- Localisation (province).
- Numéro de téléphone.
- Historique de notation visible publiquement.

### 5.2 Catalogue de Produits

**Publication d'annonce** (agriculteur) :
- Formulaire avec champs : nom, description, catégorie, prix, quantité, unité, date de récolte, date d'expiration, localisation, photo.
- Upload de photo vers S3.
- Validation des données.
- Soumission pour approbation (modérateur).

**Recherche et filtrage** (grossiste) :
- Recherche par nom, catégorie, province.
- Filtres : prix min/max, quantité min, date de récolte.
- Tri : prix croissant/décroissant, plus récent, plus vendu.
- Affichage sur carte interactive.

### 5.3 Système de Commandes

**Passage de commande** (grossiste) :
- Sélection de quantité.
- Notes additionnelles (ex: "Livraison urgente").
- Confirmation et paiement (intégration future avec Mobile Money).
- Statut initial : "en attente".

**Gestion de commande** (agriculteur) :
- Notification de nouvelle commande.
- Acceptation/refus avec raison.
- Statut passe à "confirmée".
- Notification au transporteur.

**Suivi de livraison** (transporteur) :
- Liste des commandes à livrer.
- Mise à jour du statut : "en transit" → "livrée".
- Confirmation de livraison avec photo (optionnel).

**Historique** :
- Tous les utilisateurs voient l'historique des commandes.
- Filtrage par statut, date, partenaire.

### 5.4 Carte Interactive

**Affichage** :
- Localisation des agriculteurs par province.
- Points de collecte des transporteurs.
- Clusters pour les zones denses.

**Interactivité** :
- Clic sur marqueur → profil de l'agriculteur.
- Filtrage par province.
- Recherche par localisation.

### 5.5 Messagerie Interne

**Conversation** :
- Chat direct entre agriculteur et grossiste.
- Historique des messages.
- Notifications en temps réel.

**Contexte** :
- Lien vers la commande ou le produit en discussion.

### 5.6 Système de Notation

**Activation** :
- Après livraison confirmée.
- Grossiste note l'agriculteur (et vice-versa optionnellement).

**Éléments** :
- Note (1-5 étoiles).
- Commentaire.
- Critères : qualité, ponctualité, communication.

**Affichage** :
- Note moyenne sur le profil.
- Historique des avis.

### 5.7 Panneau d'Administration

**Modération** :
- Liste des annonces en attente d'approbation.
- Approbation/rejet avec raison.
- Suppression d'annonces non conformes.

**Gestion des utilisateurs** :
- Liste des utilisateurs avec rôle et statut.
- Suspension/bannissement.
- Vérification manuelle des comptes.

**Statistiques** :
- Nombre d'utilisateurs par rôle.
- Nombre de commandes et revenus.
- Produits les plus populaires.
- Provinces les plus actives.

---

## 6. Outils et Dépendances

### Frontend

- **react@19** : Framework UI.
- **typescript** : Typage statique.
- **tailwindcss@4** : Styling CSS utilitaire.
- **lucide-react** : Icônes.
- **react-hook-form** : Gestion de formulaires.
- **zod** : Validation de schémas.
- **wouter** : Routage léger.
- **@tanstack/react-query** : Gestion du cache côté client.
- **framer-motion** : Animations fluides.
- **recharts** : Graphiques pour les statistiques.
- **date-fns** : Manipulation de dates.

### Backend

- **express@4** : Serveur HTTP.
- **@trpc/server** : Framework RPC type-safe.
- **drizzle-orm** : ORM SQL type-safe.
- **mysql2** : Driver MySQL.
- **jose** : Gestion JWT.
- **@aws-sdk/client-s3** : Stockage S3.

### Base de Données

- **MySQL/TiDB** : Stockage relationnel (fourni par Manus).
- **drizzle-kit** : Migrations et introspection.

### Cartographie

- **@types/google.maps** : Types TypeScript pour Google Maps.
- **Google Maps JavaScript API** : Rendu de cartes interactives.

### Tests

- **vitest** : Framework de test unitaire.
- **@testing-library/react** : Utilitaires de test React.

---

## 7. Considérations de Conception UX/UI

### Principes de Design

1. **Élégance et Clarté** : Interface épurée avec hiérarchie visuelle claire.
2. **Accessibilité** : Contraste suffisant, textes lisibles, navigation au clavier.
3. **Responsivité** : Adaptation fluide sur mobile, tablette et desktop.
4. **Cohérence** : Palette de couleurs, typographie et composants uniformes.
5. **Performance** : Chargement rapide, animations fluides, optimisation des images.

### Palette de Couleurs

- **Primaire** : Vert agricole (#2d5016) pour la confiance et la croissance.
- **Secondaire** : Orange doré (#d97706) pour l'énergie et l'optimisme.
- **Accent** : Bleu ciel (#0ea5e9) pour les actions principales.
- **Neutre** : Gris clair (#f3f4f6) pour les arrière-plans.
- **Texte** : Gris foncé (#1f2937) pour la lisibilité.

### Typographie

- **Titres** : Poppins Bold (24-32px).
- **Sous-titres** : Poppins SemiBold (16-20px).
- **Corps** : Inter Regular (14-16px).
- **Petits textes** : Inter Regular (12px).

### Composants Clés

- **Boutons** : Arrondis, ombre légère, transition smooth.
- **Cartes** : Bordure subtile, ombre douce, hover effect.
- **Formulaires** : Champs clairs, labels explicites, validation en temps réel.
- **Modales** : Backdrop semi-transparent, animation d'entrée fluide.
- **Notifications** : Toast en bas à droite, auto-dismiss après 5s.

---

## 8. Sécurité et Conformité

### Authentification

- OAuth Manus pour sécurité des identifiants.
- JWT pour sessions sécurisées.
- HTTPS obligatoire.

### Autorisation

- Vérification du rôle sur chaque procédure tRPC.
- Utilisateurs ne peuvent voir que leurs propres données (sauf profils publics).
- Admins ont accès à tous les données.

### Données Sensibles

- Pas de stockage de mots de passe (OAuth).
- Numéros de téléphone chiffrés en base.
- Images stockées sur S3 avec accès contrôlé.

### Validation

- Validation côté serveur de tous les inputs.
- Sanitisation des contenus utilisateur.
- Rate limiting sur les API sensibles.

---

## 9. Plan de Déploiement

### Environnements

- **Développement** : Sandbox Manus avec hot reload.
- **Production** : Manus Platform avec domaine personnalisé.

### Étapes de Déploiement

1. Créer checkpoint final après tests complets.
2. Cliquer "Publish" dans l'interface Manus.
3. Domaine auto-généré ou domaine personnalisé.
4. Monitoring et logs disponibles dans le dashboard.

---

## 10. Roadmap Future

### Court Terme (3-6 mois)

- Intégration paiement Mobile Money (Airtel Money, Orange Money).
- Notifications push mobile.
- Application mobile native (React Native).

### Moyen Terme (6-12 mois)

- Système de crédit/financement pour agriculteurs.
- Prévisions de prix basées sur IA.
- Assurance récolte intégrée.

### Long Terme (12+ mois)

- Marketplace d'équipements agricoles.
- Plateforme de formation agricole.
- Intégration avec coopératives agricoles.
- Expansion à d'autres pays africains.

---

## Conclusion

AgriLien RDC est une plateforme ambitieuse et bien structurée qui transformera la chaîne d'approvisionnement agricole en RDC. Avec une architecture technique solide, une interface utilisateur élégante et des fonctionnalités complètes, elle offre une solution viable et scalable aux défis identifiés. Le succès dépendra de l'adoption utilisateur, de la qualité du service et de l'engagement continu envers l'amélioration de la plateforme.
