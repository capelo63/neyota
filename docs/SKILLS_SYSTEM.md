# Système de compétences détaillées

## Vue d'ensemble

Le système de compétences de Teriis permet de matcher précisément les **besoins** des porteurs de projets avec les **compétences** des talents.

### Structure

- **11 catégories de besoins** → **44 besoins détaillés** (pour porteurs de projets)
- **7 catégories de compétences** → **~70 compétences détaillées** (pour talents)

## Catégories de compétences

### 1. 🎯 Stratégie / Business / Impact

**Objectif** : Aide à la structuration, au business model et à l'impact

**Compétences** :
- Business model & stratégie
- Étude de marché & positionnement
- Business plan & pitch deck
- Définition de l'offre de valeur
- Priorisation & roadmap
- Mesure d'impact social/environnemental
- Développement de partenariats stratégiques
- Ancrage territorial & écosystème local
- Accompagnement entrepreneurial / mentoring
- Coaching de dirigeant

**Correspond aux besoins** : Structurer le projet, Renforcer l'impact, Accompagnement

---

### 2. 📣 Marketing / Communication

**Objectif** : Marketing digital, communication et visibilité

**Compétences** :
- Stratégie marketing & communication
- Étude de cible & persona
- Positionnement & messaging
- Marketing digital (SEO, SEA, réseaux sociaux)
- SEO / Référencement naturel
- SEA / Publicité en ligne (Google Ads, Meta Ads)
- Social media marketing
- Content marketing & stratégie éditoriale
- Community management
- Email marketing & automation
- Identité visuelle & branding
- Création de supports de communication
- Copywriting & rédaction
- Photographie & vidéo
- Design graphique

**Correspond aux besoins** : Trouver des clients, Créer une image

---

### 3. 💻 Produit / Tech

**Objectif** : Développement produit, web, mobile et tech

**Compétences** :
- Product management
- UX/UI Design
- Prototypage & wireframing
- Tests utilisateurs & validation
- Développement web (sites vitrine, e-commerce)
- Développement d'applications web (SaaS, plateformes)
- Développement front-end (React, Vue, etc.)
- Développement back-end (Node, Python, PHP)
- Développement mobile (iOS, Android)
- Développement mobile cross-platform (React Native, Flutter)
- No-code / Low-code (Webflow, Bubble, Notion)
- Automatisation & workflows (Zapier, Make, n8n)
- Intégration d'outils & API
- Data science / Intelligence Artificielle
- DevOps / Infrastructure cloud

**Correspond aux besoins** : Développer des outils digitaux, Lancer le projet

---

### 4. ⚙️ Opérations / Gestion de projet

**Objectif** : Gestion de projet, organisation et processus

**Compétences** :
- Gestion de projet (Agile, Scrum, Kanban)
- Planification & pilotage de projet
- Coordination d'équipe
- Organisation & productivité
- Gestion du temps & priorisation
- Mise en place de processus & workflows
- Pilotage de la croissance
- Structuration d'équipe
- Change management
- Qualité & amélioration continue

**Correspond aux besoins** : Organisation et collaboration, Lancer le projet, Développer le projet

---

### 5. 💰 Finance / Juridique / RH

**Objectif** : Finance, comptabilité, juridique et ressources humaines

**Compétences** :
- Budget & prévisionnel financier
- Comptabilité & trésorerie
- Analyse financière & rentabilité
- Recherche de financements (subventions, prêts)
- Levée de fonds / Fundraising
- Choix de statut juridique
- Droit des affaires & contrats
- Propriété intellectuelle
- Gestion administrative
- Ressources humaines & recrutement
- Formation & développement des compétences

**Correspond aux besoins** : Gérer les finances, Cadre légal et administratif

---

### 6. 🤝 Commercial / Relation client

**Objectif** : Vente, développement commercial et relation client

**Compétences** :
- Développement commercial B2B
- Développement commercial B2C
- Prospection & génération de leads
- Techniques de vente & négociation
- Stratégie de distribution
- Pricing & politique tarifaire
- Amélioration de la rentabilité
- Relation client & customer success
- Service après-vente & support
- Fidélisation client

**Correspond aux besoins** : Trouver des clients, Développer le projet

---

### 7. 🔧 Autre expertise

**Objectif** : Autre domaine d'expertise à préciser

**Spécificité** : Champ libre permettant au talent de spécifier une compétence non listée

---

## Implémentation technique

### Migration SQL

**Fichier** : `supabase/migrations/036_seed_detailed_skills.sql`

Insère environ 70 compétences prédéfinies dans la table `skills` avec :
- `name` : nom de la compétence
- `category` : catégorie (strategy, marketing, product, operations, finance_legal_hr, commercial, other)
- `is_custom` : false pour les compétences prédéfinies

### Fichier TypeScript

**Fichier** : `lib/constants/needs-skills.ts`

Export :
- `SKILL_CATEGORIES` : métadonnées des catégories (label, icône, description)
- `SKILLS_BY_CATEGORY` : liste des compétences par catégorie (pour référence)
- `TOTAL_SKILLS` : nombre total de compétences (~70)

### UI Onboarding

**Fichier** : `app/onboarding/OnboardingForm.tsx`

Interface avec accordéons pour chaque catégorie :
- Affichage du nombre de compétences sélectionnées par catégorie
- Checkboxes pour sélection multiple des compétences
- Champ texte libre pour la catégorie "Autre expertise"

### Tables database

**`skills`** : Compétences disponibles
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
category skill_type NOT NULL
is_custom BOOLEAN DEFAULT FALSE
created_by UUID -- Pour compétences custom
```

**`user_skills`** : Compétences des talents
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
skill_id UUID REFERENCES skills(id)
custom_detail TEXT -- Pour "Autre expertise"
```

**`needs`** : Besoins des projets
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
category need_category NOT NULL
```

**`project_needs`** : Besoins d'un projet
```sql
id UUID PRIMARY KEY
project_id UUID REFERENCES projects(id)
need_id UUID REFERENCES needs(id)
priority need_priority -- 'essential' ou 'nice_to_have'
```

**`need_skill_mapping`** : Mapping besoins ↔ compétences
```sql
id UUID PRIMARY KEY
need_id UUID REFERENCES needs(id)
skill_id UUID REFERENCES skills(id)
relevance_score INTEGER -- Score 1-10 pour le matching
```

---

## Avantages du système

### Pour les talents
- **Précision** : Sélection fine des compétences réelles
- **Visibilité** : Meilleur matching avec les projets pertinents
- **Flexibilité** : Possibilité d'ajouter des compétences custom

### Pour les porteurs de projets
- **Clarté** : Expression précise des besoins via 44 options
- **Priorisation** : Distinction essentiel / souhaité
- **Matching** : Algorithme de correspondance besoins ↔ compétences

### Pour la plateforme
- **Qualité** : Matching plus pertinent = meilleure expérience
- **Évolutivité** : Ajout facile de nouvelles compétences
- **Données** : Analytics sur les besoins et compétences les plus demandés

---

## Évolutions futures possibles

1. **Niveaux d'expertise** : Débutant / Intermédiaire / Expert
2. **Validation** : Badges ou certifications pour certaines compétences
3. **Suggestions** : Recommandation de compétences en fonction du profil
4. **Analytics** : Dashboard des compétences les plus demandées/offertes
5. **AI matching** : Amélioration de l'algorithme de matching avec ML

---

## Maintenance

### Ajouter une nouvelle compétence

1. Ajouter dans `SKILLS_BY_CATEGORY` (fichier TypeScript)
2. Créer une migration SQL pour l'insérer dans la table
3. Mettre à jour `TOTAL_SKILLS` si nécessaire

### Modifier une catégorie

1. Modifier dans `SKILL_CATEGORIES` (fichier TypeScript)
2. Si changement de structure : créer migration SQL

### Supprimer une compétence obsolète

1. Créer une migration qui la marque comme `deprecated` ou la supprime
2. Gérer les références existantes dans `user_skills`
