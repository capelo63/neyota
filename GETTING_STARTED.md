# 🚀 Guide de Démarrage Rapide - TERRII

Bienvenue! Ce guide vous aide à démarrer rapidement avec TERRII.

---

## ⚡ Démarrage en 4 étapes

### Étape 1: Configuration Supabase (15 min)

📖 **Suivez le guide détaillé**: `docs/SUPABASE_SETUP_GUIDE.md`

**Résumé rapide**:
1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet `neyota`
3. Récupérez vos clés API (Project URL + anon key)
4. Créez `.env.local` avec vos clés
5. Exécutez les migrations SQL dans le SQL Editor

---

### Étape 2: Configurer les variables d'environnement (2 min)

```bash
# Copiez le template
cp .env.local.example .env.local

# Éditez .env.local et ajoutez vos clés Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

### Étape 3: Tester la connexion (1 min)

```bash
# Testez que Supabase est bien configuré
npm run test:supabase
```

✅ **Résultat attendu**:
```
🎉 Tous les tests sont passés avec succès!
✅ Votre configuration Supabase est prête!
```

❌ **Si ça ne fonctionne pas**:
- Vérifiez que `.env.local` contient les bonnes clés
- Assurez-vous d'avoir exécuté les migrations SQL
- Consultez le guide détaillé `docs/SUPABASE_SETUP_GUIDE.md`

---

### Étape 4: Lancer l'application (30 sec)

```bash
# Démarrez le serveur de développement
npm run dev
```

Ouvrez **http://localhost:3000** dans votre navigateur.

🎉 Vous devriez voir la landing page TERRII!

---

## 📁 Structure du projet

```
neyota/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Layout global
│   └── globals.css        # Styles globaux
│
├── components/            # Composants React (à venir)
│
├── lib/
│   ├── supabase/         # Configuration Supabase
│   │   ├── client.ts     # Client browser
│   │   ├── server.ts     # Client server
│   │   └── middleware.ts # Auth middleware
│   └── test-supabase-connection.ts  # Script de test
│
├── supabase/
│   └── migrations/       # Migrations SQL
│       ├── 001_initial_schema.sql   # Tables + RLS
│       └── 002_seed_skills.sql      # Compétences
│
├── docs/                 # Documentation
│   ├── SUPABASE_SETUP_GUIDE.md      # Guide Supabase détaillé
│   └── *.docx           # Cahier des charges
│
├── .env.local           # Variables d'environnement (à créer)
├── .env.local.example   # Template des variables
├── package.json         # Dépendances npm
└── README.md            # Documentation principale
```

---

## 🧪 Scripts disponibles

```bash
# Développement
npm run dev              # Lance le serveur de dev (localhost:3000)

# Tests
npm run test:supabase    # Teste la connexion Supabase

# Production
npm run build           # Build pour production
npm run start           # Lance la version production

# Qualité de code
npm run lint            # Vérification ESLint
```

---

## 🗄️ Base de données Supabase

### Tables créées (11 tables)

- **profiles** - Profils utilisateurs (entrepreneurs + talents)
- **skills** - Taxonomie de 60+ compétences
- **user_skills** - Compétences des talents
- **projects** - Projets des entrepreneurs
- **project_skills_needed** - Compétences recherchées
- **applications** - Candidatures
- **user_charter_acceptances** - Acceptation charte éthique
- **reports** - Signalements
- **project_views_log** - Traçabilité des consultations
- **user_badges** - Badges de gamification
- **user_impact_stats** - Statistiques d'impact

### Fonctionnalités spéciales

✅ **PostGIS** - Géolocalisation avec calcul de distance
✅ **Row Level Security** - Sécurité au niveau des lignes
✅ **Phases de projet** - 5 phases (idéation → scaling)
✅ **Compétences structurées** - 5 catégories prédéfinies
✅ **Visibilité progressive** - Protection des idées
✅ **Gamification** - 6 types de badges

---

## 🎯 Prochaines étapes de développement

Maintenant que la base est configurée, voici ce qu'il faut développer:

### Phase 1: Authentification (1-2 jours)
- [ ] Page d'inscription avec choix du rôle
- [ ] Charte éthique à accepter
- [ ] Page de connexion
- [ ] Middleware de protection des routes
- [ ] Page de déconnexion

### Phase 2: Onboarding (2-3 jours)
- [ ] Formulaire entrepreneur (projet + compétences)
- [ ] Formulaire talent (compétences + préférences)
- [ ] Géolocalisation automatique via code postal
- [ ] Upload photo de profil

### Phase 3: Profils & Projets (3-4 jours)
- [ ] Dashboard entrepreneur
- [ ] Dashboard talent
- [ ] Création/édition de projet
- [ ] Sélection de compétences (autocomplete)
- [ ] Système de recherche avec filtres

### Phase 4: Matching & Candidatures (3-4 jours)
- [ ] Algorithme de matching (compétences + géo + phase)
- [ ] Page de recherche de projets
- [ ] Suggestions personnalisées
- [ ] Système de candidature
- [ ] Gestion des candidatures (accepter/refuser)

---

## 🐛 Résolution de problèmes

### Le serveur ne démarre pas

```bash
# Vérifiez les erreurs
npm run dev

# Si erreur de dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur "Invalid API key"

1. Vérifiez que `.env.local` existe
2. Vérifiez les clés Supabase (Settings > API)
3. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### Les tables n'existent pas

1. Allez sur https://supabase.com/dashboard
2. SQL Editor > New query
3. Exécutez `001_initial_schema.sql`
4. Puis `002_seed_skills.sql`
5. Relancez `npm run test:supabase`

### PostGIS non activé

Dans Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 📞 Besoin d'aide?

1. **Guide détaillé Supabase**: `docs/SUPABASE_SETUP_GUIDE.md`
2. **Documentation complète**: `README.md`
3. **Documentation Supabase**: https://supabase.com/docs
4. **Documentation Next.js**: https://nextjs.org/docs

---

## 🎉 Tout fonctionne?

Félicitations! Vous êtes prêt à développer les fonctionnalités de TERRII.

**Prochaine étape recommandée**: Développer l'authentification

```bash
# Créez une nouvelle branche
git checkout -b feature/authentication

# Commencez à coder! 🚀
```

---

**Ensemble, faisons vivre nos territoires! 🌱**
