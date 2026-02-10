# 🚀 Guide de Configuration Supabase pour NEYOTA

Ce guide vous accompagne pas à pas pour configurer votre projet Supabase.

---

## Étape 1: Créer un compte Supabase (5 min)

### 1.1 Inscription

1. Allez sur **https://supabase.com**
2. Cliquez sur **"Start your project"** ou **"Sign Up"**
3. Connectez-vous avec:
   - GitHub (recommandé - plus rapide)
   - OU Email + mot de passe

### 1.2 Vérification email

Si vous utilisez l'email, vérifiez votre boîte de réception et cliquez sur le lien de confirmation.

---

## Étape 2: Créer un nouveau projet (3 min)

### 2.1 Créer l'organisation

1. Après connexion, cliquez sur **"New project"**
2. Si c'est votre premier projet, créez d'abord une organisation:
   - Nom: `NEYOTA` (ou votre nom)
   - Plan: **Free** (gratuit - largement suffisant pour démarrer)

### 2.2 Configurer le projet

Remplissez les informations suivantes:

```
Nom du projet: neyota
(Important: notez ce nom, vous en aurez besoin)

Database Password: [Générer un mot de passe fort]
⚠️ IMPORTANT: Copiez ce mot de passe et sauvegardez-le dans un endroit sûr!
Vous en aurez besoin pour accéder à la base de données.

Region: Europe West (eu-west-1) - Irlande
(Choisissez la région la plus proche de vos utilisateurs)
```

3. Cliquez sur **"Create new project"**
4. ⏱️ Attendez 2-3 minutes que le projet se crée

---

## Étape 3: Récupérer les clés d'API (2 min)

### 3.1 Accéder aux paramètres

1. Une fois le projet créé, cliquez sur l'icône **⚙️ Settings** dans la barre latérale gauche
2. Allez dans **API** dans le menu de gauche

### 3.2 Copier les clés

Vous verrez plusieurs informations importantes:

```
Project URL:
https://xxxxxxxxxxxxxxxxxx.supabase.co

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...

service_role key: (secret)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

⚠️ **IMPORTANT**:
- Copiez le **Project URL**
- Copiez la **anon public** key
- NE partagez JAMAIS la **service_role** key publiquement

---

## Étape 4: Configurer les variables d'environnement (2 min)

### 4.1 Créer le fichier .env.local

Dans votre projet NEYOTA, créez un fichier `.env.local` à la racine:

```bash
# Dans le terminal, à la racine du projet /home/user/neyota
cp .env.local.example .env.local
```

### 4.2 Remplir les variables

Ouvrez `.env.local` et remplacez les valeurs:

```env
# Remplacez par vos vraies valeurs
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Pour l'instant, laissez vide (on ajoutera plus tard)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

⚠️ **IMPORTANT**: Le fichier `.env.local` est déjà dans `.gitignore` - il ne sera jamais commité sur GitHub.

---

## Étape 5: Créer la base de données (10 min)

### 5.1 Activer PostGIS

PostGIS est l'extension PostgreSQL pour la géolocalisation.

1. Dans Supabase, allez dans **SQL Editor** (icône </> dans la barre latérale)
2. Cliquez sur **"New query"**
3. Copiez-collez cette commande:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

4. Cliquez sur **"Run"** (ou F5)
5. Vous devriez voir: ✅ **Success. No rows returned**

### 5.2 Exécuter la migration principale

1. Ouvrez le fichier `/home/user/neyota/supabase/migrations/001_initial_schema.sql`
2. **Copiez TOUT le contenu** du fichier
3. Dans Supabase SQL Editor, créez une **nouvelle query**
4. **Collez** le contenu
5. Cliquez sur **"Run"**

⏱️ Cela va prendre 10-30 secondes.

✅ **Résultat attendu**: "Success. No rows returned" (c'est normal!)

### 5.3 Insérer les compétences prédéfinies

1. Ouvrez le fichier `/home/user/neyota/supabase/migrations/002_seed_skills.sql`
2. **Copiez tout le contenu**
3. Dans Supabase SQL Editor, créez une **nouvelle query**
4. **Collez** le contenu
5. Cliquez sur **"Run"**

✅ **Résultat attendu**: "Success. X rows inserted" (environ 60 compétences)

---

## Étape 6: Vérifier que tout fonctionne (5 min)

### 6.1 Vérifier les tables créées

1. Dans Supabase, allez dans **Table Editor** (icône tableau dans la barre latérale)
2. Vous devriez voir toutes ces tables:

```
✅ profiles
✅ skills
✅ user_skills
✅ projects
✅ project_skills_needed
✅ applications
✅ user_charter_acceptances
✅ reports
✅ project_views_log
✅ user_badges
✅ user_impact_stats
```

### 6.2 Vérifier les compétences

1. Cliquez sur la table **skills**
2. Vous devriez voir environ **60 compétences** avec leurs catégories

Exemples:
- Développement Web (React, Vue, Angular) - Category: technical
- Marketing Digital - Category: business
- Design UX / UI - Category: creative
- etc.

### 6.3 Vérifier les Row Level Security (RLS)

1. Dans la **Table Editor**, cliquez sur une table (ex: `profiles`)
2. En haut à droite, vous devriez voir un badge **"RLS enabled"** (avec un cadenas vert)
3. Cliquez dessus pour voir les **policies** (règles de sécurité)

✅ Si vous voyez des policies (ex: "Public profiles are viewable by everyone"), c'est bon!

---

## Étape 7: Configurer l'authentification (2 min)

### 7.1 Paramètres Email

1. Allez dans **Authentication** > **Providers** (dans la barre latérale)
2. Vérifiez que **Email** est activé (par défaut)

### 7.2 Configuration URL du site

1. Allez dans **Authentication** > **URL Configuration**
2. Dans **Site URL**, mettez:
   ```
   http://localhost:3000
   ```

3. Dans **Redirect URLs**, ajoutez:
   ```
   http://localhost:3000/**
   ```

4. Cliquez sur **Save**

---

## Étape 8: Tester la connexion depuis Next.js (5 min)

### 8.1 Vérifier que .env.local est bien configuré

Dans le terminal:

```bash
# Vérifiez que le fichier existe
cat .env.local
```

Vous devriez voir vos clés Supabase.

### 8.2 Lancer le serveur de développement

```bash
npm run dev
```

### 8.3 Ouvrir l'application

Ouvrez **http://localhost:3000** dans votre navigateur.

✅ Vous devriez voir la landing page NEYOTA sans erreur!

### 8.4 Vérifier les erreurs de console

1. Ouvrez les **DevTools** du navigateur (F12)
2. Allez dans l'onglet **Console**
3. Vérifiez qu'il n'y a **pas d'erreurs Supabase**

---

## 🎉 Récapitulatif

Si tout s'est bien passé, vous avez maintenant:

✅ Un projet Supabase créé
✅ Base de données PostgreSQL avec PostGIS activé
✅ 11 tables créées avec RLS
✅ 60+ compétences prédéfinies
✅ Variables d'environnement configurées
✅ Next.js connecté à Supabase

---

## ⚠️ Résolution de problèmes

### Problème: "Invalid API key"

**Solution**: Vérifiez que vous avez bien copié:
- La bonne **Project URL** (doit finir par `.supabase.co`)
- La bonne **anon public key** (commence par `eyJhbG...`)
- Redémarrez le serveur Next.js (`npm run dev`)

### Problème: "relation does not exist"

**Solution**: Les migrations SQL n'ont pas été exécutées correctement.
- Allez dans **SQL Editor**
- Ré-exécutez `001_initial_schema.sql`
- Puis `002_seed_skills.sql`

### Problème: "PostGIS extension not found"

**Solution**:
- Exécutez `CREATE EXTENSION IF NOT EXISTS postgis;`
- Puis ré-exécutez les migrations

### Problème: Les tables sont créées mais RLS n'est pas activé

**Solution**:
- Vérifiez que la fin du fichier `001_initial_schema.sql` a bien été exécutée
- Recherchez "ALTER TABLE ... ENABLE ROW LEVEL SECURITY" dans le fichier

---

## 📞 Prochaines étapes

Une fois Supabase configuré, vous êtes prêt pour:

1. **Développer l'authentification** (inscription/connexion)
2. **Créer les formulaires de profils**
3. **Implémenter le matching territorial**

---

## 🔗 Ressources utiles

- Documentation Supabase: https://supabase.com/docs
- Dashboard Supabase: https://supabase.com/dashboard
- Supabase Auth Guide: https://supabase.com/docs/guides/auth
- PostGIS Documentation: https://postgis.net/documentation/

---

**Bon courage! Si vous rencontrez un problème, n'hésitez pas à demander de l'aide.** 🚀
