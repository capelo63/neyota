# Guide de Migration 033 - Système Besoins/Compétences

## Problèmes possibles

Vous pouvez rencontrer ces erreurs :
- `ERROR: 42P07: relation "idx_skills_category" already exists`
- `ERROR: 42P01: relation "project_needs" does not exist`  
- `ERROR: 22P02: invalid input value for enum skill_category: "strategy"`

Cela signifie que la migration a été partiellement exécutée ou que l'ancien système interfère.

## ✅ Solution recommandée : Nettoyage complet

**⚠️ ATTENTION : Cette option supprime TOUT (ancien et nouveau système)**

### Étape 1 : Nettoyage complet

**Exécutez dans l'éditeur SQL Supabase :**
```
supabase/migrations/033_cleanup_complete.sql
```

Ce script supprime :
- ✅ Toutes les policies
- ✅ Toutes les fonctions  
- ✅ Toutes les tables (nouvelles, anciennes, et `*_old`)
- ✅ Tous les types ENUM (anciens `skill_category` ET nouveaux `skill_type`)

### Étape 2 : Migration propre

**Ensuite, exécutez :**
```
supabase/migrations/033_refactor_needs_skills_system.sql
```

---

## Alternative : Migration safe (si vous savez ce que vous faites)

Si vous préférez ne pas tout nettoyer :

1. **Exécutez directement :**
   ```
   supabase/migrations/033_refactor_needs_skills_system_safe.sql
   ```
   
   ⚠️ **Note :** Cette option peut échouer si l'ancien système interfère. Utilisez le nettoyage complet si vous avez des erreurs.

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
