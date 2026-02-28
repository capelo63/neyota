# 🌱 Teriis - Ensemble, faisons vivre nos territoires

Plateforme de mise en relation entre porteurs de projets et talents locaux.

**100% gratuit • 100% local • 100% impact**

---

## 📋 Vue d'ensemble

Teriis est une plateforme web qui connecte les porteurs de projets à la recherche de talents avec des personnes motivées souhaitant s'investir dans des projets locaux. L'objectif est de dynamiser les territoires en favorisant l'entrepreneuriat de proximité.

### 🎯 Fonctionnalités principales

- **Matching territorial** : Rapprochement basé sur la proximité géographique
- **Profils détaillés** : Entrepreneurs et talents avec compétences structurées
- **Phases de projet** : Idéation, MVP, Lancement, Croissance, Structuration
- **Protection des idées** : Charte éthique, visibilité progressive, système de signalement
- **Gamification** : Badges, impact score, reconnaissance de l'engagement citoyen
- **100% gratuit** : Pour les porteurs de projets et les talents

---

## 🛠 Stack Technique

- **Frontend** : Next.js 15+ (App Router), React 19, TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Géolocalisation** : PostGIS (PostgreSQL extension)
- **Hébergement** : Vercel (Frontend) + Supabase Cloud (Backend)

---

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit : https://supabase.com)
- Git

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/neyota.git
cd neyota
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

#### a. Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez votre **Project URL** et **anon public key**

#### b. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.local.example .env.local
```

Éditez `.env.local` et ajoutez vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

#### c. Exécuter les migrations de base de données

1. Installez la CLI Supabase :

```bash
npm install -g supabase
```

2. Connectez-vous à votre projet :

```bash
supabase login
supabase link --project-ref votre-project-ref
```

3. Exécutez les migrations :

**Option 1 : Via Supabase Dashboard (Recommandé pour débuter)**

- Allez dans votre projet Supabase → **SQL Editor**
- Copiez le contenu de `supabase/migrations/001_initial_schema.sql`
- Exécutez le SQL
- Faites de même avec `supabase/migrations/002_seed_skills.sql`

**Option 2 : Via CLI**

```bash
supabase db push
```

#### d. Activer PostGIS (pour la géolocalisation)

Dans le **SQL Editor** de Supabase, exécutez :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📂 Structure du projet

```
neyota/
├── app/                          # Next.js App Router
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Landing page
├── components/                   # Composants React
│   └── ui/                      # Composants UI (futurs : shadcn/ui)
├── lib/
│   ├── supabase/                # Configuration Supabase
│   │   ├── client.ts            # Client côté navigateur
│   │   ├── server.ts            # Client côté serveur
│   │   └── middleware.ts        # Middleware auth
│   └── utils/                   # Utilitaires
├── supabase/
│   └── migrations/              # Migrations SQL
│       ├── 001_initial_schema.sql
│       └── 002_seed_skills.sql
├── docs/                        # Documentation projet
│   ├── CAHIER DES CHARGES FONCTIONNEL.docx
│   ├── FICHE DE PRÉSENTATION DE PROJET.docx
│   └── MAQUETTE FONCTIONNELLE.docx
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🗄 Schéma de base de données

### Tables principales

- **profiles** : Profils utilisateurs (entrepreneurs et talents)
- **skills** : Taxonomie de compétences (prédéfinies + custom)
- **user_skills** : Compétences des talents
- **projects** : Projets créés par les entrepreneurs
- **project_skills_needed** : Compétences recherchées pour chaque projet
- **applications** : Candidatures des talents aux projets

### Fonctionnalités spéciales

- **Géolocalisation** : Champs `latitude`, `longitude`, `location` (PostGIS)
- **Phases de projet** : `ideation`, `mvp_development`, `launch`, `growth`, `scaling`
- **Badges** : Système de gamification pour valoriser l'engagement
- **Visibilité progressive** : `short_pitch` (public) vs `full_description` (privé)
- **Charte éthique** : Table `user_charter_acceptances`

---

## 🔐 Sécurité & Éthique

### Row Level Security (RLS)

Toutes les tables sont protégées par RLS. Exemples :

- Les utilisateurs peuvent uniquement modifier leur propre profil
- Les projets actifs sont visibles par tous
- Les détails complets d'un projet ne sont visibles qu'après candidature acceptée
- Les candidatures ne sont visibles que par le talent et le porteur de projet

### Charte éthique

Avant de candidater, les talents doivent accepter une charte incluant :

- Respect de la confidentialité des projets
- Interdiction de copier/voler des idées
- Engagement de bonne foi

### Système de signalement

Les utilisateurs peuvent signaler :

- Vol d'idée
- Spam
- Harcèlement
- Contenu inapproprié

---

## 🎯 Roadmap MVP (Phase 1)

- [x] Setup Next.js + Supabase + Tailwind
- [x] Schéma de base de données complet
- [x] Landing page avec positionnement territorial
- [ ] Système d'authentification avec charte éthique
- [ ] Onboarding (choix du rôle : entrepreneur/talent)
- [ ] Profils entrepreneurs avec création de projet
- [ ] Profils talents avec sélection de compétences
- [ ] Système de géolocalisation automatique
- [ ] Page de recherche avec filtres (distance, compétences, phase)
- [ ] Algorithme de matching (compétences + géo + phase)
- [ ] Système de candidature simple
- [ ] Dashboard entrepreneur (gestion candidatures)
- [ ] Dashboard talent (projets suggérés)

---

## 🚀 Phase 2 (Futures fonctionnalités)

- Chat temps réel (Supabase Realtime)
- OAuth LinkedIn
- Notifications push
- Carte interactive (Google Maps / Mapbox)
- NDA électronique optionnel
- Événements territoriaux
- Système de rating/reviews
- Version PWA mobile
- Programme partenaires (incubateurs, écoles)

---

## 📊 Modèle Économique

Teriis est **100% gratuit** pour les porteurs de projets et les talents.

Revenus provenant de :

1. **Subventions publiques** (Régions, BPI, FEDER)
2. **Partenaires B2B** (incubateurs, écoles, cabinets)
3. **Mécénat d'entreprises** (RSE, innovation territoriale)
4. **Services premium optionnels** (boost visibilité, analytics)
5. **Événements** (job dating, masterclass sponsorisés)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 License

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

---

## 📞 Contact

**Porteur de projet** : [Votre nom]

**Email** : contact@neyota.fr (à configurer)

**Site web** : https://neyota.fr (à venir)

---

## 🙏 Remerciements

- Tous les talents qui croient au potentiel de leur territoire
- Les entrepreneurs qui osent créer localement
- Les partenaires institutionnels qui soutiennent l'écosystème

---

**Ensemble, faisons vivre nos territoires ! 🌱**
