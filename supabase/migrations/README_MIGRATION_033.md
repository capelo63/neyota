# Guide de Migration 033 - Système Besoins/Compétences

## Problème rencontré

Vous avez obtenu l'erreur : `ERROR: 42P07: relation "idx_skills_category" already exists`

Cela signifie que la migration a été partiellement exécutée.

## Solution : 2 options

### Option 1 : Nettoyer et recommencer (RECOMMANDÉ)

**⚠️ ATTENTION : Cette option supprime les données partiellement créées**

1. **Exécutez le script de nettoyage dans l'éditeur SQL Supabase :**
   ```
   supabase/migrations/033_cleanup.sql
   ```
   
2. **Ensuite, exécutez la migration safe :**
   ```
   supabase/migrations/033_refactor_needs_skills_system.sql
   ```
   (Le fichier a été mis à jour avec la version safe)

### Option 2 : Exécuter directement la version safe

Si vous préférez ne pas tout nettoyer :

1. **Exécutez directement :**
   ```
   supabase/migrations/033_refactor_needs_skills_system_safe.sql
   ```
   
   Cette version utilise `IF NOT EXISTS` et `IF EXISTS` pour éviter les erreurs.

   ⚠️ **Note :** Cette option utilisera `TRUNCATE` sur les tables `needs` et `skills` pour réinitialiser les données, mais préservera les anciennes tables en `*_old`.

## Différences entre les versions

### Version safe (`033_refactor_needs_skills_system_safe.sql`)

- ✅ Utilise `CREATE TYPE ... IF NOT EXISTS` (via DO blocks)
- ✅ Utilise `CREATE TABLE IF NOT EXISTS`
- ✅ Utilise `CREATE INDEX IF NOT EXISTS`
- ✅ Vérifie l'existence des tables avant de les renommer
- ✅ Utilise `DROP POLICY IF EXISTS` avant de créer les policies
- ✅ Peut être réexécutée sans erreur

### Version originale (`033_refactor_needs_skills_system_backup.sql`)

- ❌ Échoue si les objets existent déjà
- Sauvegardée pour référence

## Après la migration

Une fois la migration réussie, vous pouvez vérifier que tout fonctionne :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('needs', 'skills', 'need_skill_mapping', 'project_needs', 'user_skills');

-- Vérifier les données
SELECT category, COUNT(*) FROM needs GROUP BY category;
SELECT category, COUNT(*) FROM skills GROUP BY category;

-- Vérifier le mapping
SELECT COUNT(*) FROM need_skill_mapping;
```

## Nettoyage final (optionnel)

Après validation complète, vous pouvez supprimer les anciennes tables :

```sql
DROP TABLE IF EXISTS skills_old CASCADE;
DROP TABLE IF EXISTS project_skills_needed_old CASCADE;
DROP TABLE IF EXISTS user_skills_old CASCADE;
DROP TYPE IF EXISTS skill_category CASCADE;
DROP TYPE IF EXISTS proficiency_level CASCADE;
DROP TYPE IF EXISTS skill_priority CASCADE;
```

## Besoin d'aide ?

Si vous rencontrez d'autres erreurs, vérifiez :
1. Que vous exécutez le script dans le bon ordre
2. Qu'il n'y a pas de contraintes de clés étrangères bloquantes
3. Que votre utilisateur a les permissions nécessaires
