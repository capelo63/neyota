# Guide d'application : Migration 025 - Fix Project Status ENUM

## 🎯 Objectif

Convertir le champ `status` de la table `projects` de type **TEXT** vers un **ENUM PostgreSQL** strict.

## ⚠️ Problème rencontré

PostgreSQL refuse de modifier le type d'une colonne utilisée dans des politiques RLS (Row Level Security), même indirectement. Plusieurs politiques peuvent exister sur votre base de données :

- `"Anyone can view active projects"` ✅ (utilise status)
- `"Users can view active projects"` ✅ (utilise status)
- `"Active projects are viewable by everyone"` ✅ (utilise status)
- `"Entrepreneurs can create projects"` (n'utilise pas status mais bloque quand même)
- `"Project owners can update their projects"` (idem)
- `"Project owners can delete their projects"` (idem)

## ✅ Solution : Migration Dynamique V2

J'ai créé une migration **dynamique et idempotente** qui :
- ✅ Détecte automatiquement TOUTES les politiques existantes
- ✅ Les supprime dynamiquement (quelle que soit leur nom)
- ✅ Fait la conversion de type
- ✅ Recrée les 4 politiques standard
- ✅ Peut être exécutée plusieurs fois sans erreur

## 📋 Instructions d'application

### Option A : Migration automatique (RECOMMANDÉ)

1. Ouvrez **SQL Editor** dans Supabase Dashboard
2. Copiez le contenu de `supabase/migrations/025_fix_project_status_enum_v2.sql`
3. Collez et exécutez le script
4. Vérifiez les messages de succès

### Option B : Nettoyage manuel puis migration

Si l'option A échoue, procédez en 2 étapes :

**Étape 1 : Nettoyage**
```sql
-- Exécutez: supabase/drop_all_project_policies.sql
-- Cela supprime TOUTES les politiques sur projects
```

**Étape 2 : Migration**
```sql
-- Exécutez ensuite: supabase/migrations/025_fix_project_status_enum_v2.sql
-- Cela fait la conversion et recrée les politiques
```

### Option C : Diagnostic puis action

Si vous voulez d'abord voir l'état actuel :

1. Exécutez `supabase/diagnostic_project_policies.sql` pour lister toutes les politiques
2. Notez les noms de toutes les politiques
3. Utilisez l'option A ou B

## 🔍 Vérification post-migration

Exécutez ces requêtes pour vérifier que tout fonctionne :

```sql
-- 1. Vérifier que le type ENUM existe
SELECT typname, enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname = 'project_status'
ORDER BY enumsortorder;
-- Résultat attendu: active, closed, archived

-- 2. Vérifier que la colonne utilise le bon type
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'status';
-- Résultat attendu: data_type = 'USER-DEFINED'

-- 3. Vérifier les politiques RLS
SELECT policyname, cmd, pg_get_expr(polqual, polrelid) AS using_expr
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
WHERE relname = 'projects'
ORDER BY policyname;
-- Résultat attendu: 4 politiques

-- 4. Tester une requête
SELECT id, title, status FROM projects WHERE status = 'active';
-- Doit fonctionner sans erreur
```

## 🚨 En cas de problème

### Erreur : "type project_status already exists"
➡️ **Normal si vous avez déjà exécuté la migration**. La migration V2 est idempotente, elle gère ce cas.

### Erreur : "policy already exists"
➡️ Exécutez d'abord le script de nettoyage : `drop_all_project_policies.sql`

### Erreur : "cannot alter type... policy depends on column"
➡️ Il reste des politiques non supprimées. Options :
1. Utilisez `drop_all_project_policies.sql` pour tout nettoyer
2. Identifiez la politique manquante avec `diagnostic_project_policies.sql`
3. Supprimez-la manuellement puis réessayez

### L'application échoue complètement
➡️ **Rollback manuel** :
```sql
-- Si l'ENUM a été créé
DROP TYPE IF EXISTS project_status CASCADE;

-- Recréer les politiques manuellement
-- (voir la migration 010 pour les définitions originales)
```

## 📊 Impact attendu

- ✅ Type safety : Seules les valeurs 'active', 'closed', 'archived' sont acceptées
- ✅ Validation automatique : PostgreSQL rejette les valeurs invalides
- ✅ Pas de breaking change : Les données existantes sont conservées
- ✅ Sécurité maintenue : Les mêmes politiques RLS sont recréées

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide, vérifiez :
1. Les logs PostgreSQL dans Supabase Dashboard
2. L'état actuel des politiques avec `diagnostic_project_policies.sql`
3. Les migrations précédentes qui auraient pu créer des politiques custom
