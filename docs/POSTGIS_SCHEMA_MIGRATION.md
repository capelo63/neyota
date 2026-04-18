# Migration PostGIS vers le schéma `extensions`

## Contexte

Le linter Supabase signale le warning `rls_disabled_in_public` sur la table
`public.spatial_ref_sys`. Cette table est créée par l'extension PostGIS et
appartient à `supabase_admin` : **aucun rôle utilisateur ne peut activer RLS
dessus**, même depuis le SQL Editor.

Les migrations `031_enable_rls_spatial_ref_sys.sql` et
`035_robust_enable_rls_spatial_ref_sys.sql` ont confirmé cette limitation :
elles s'exécutent sans erreur mais sans effet (`owner=supabase_admin,
rls_enabled=false`).

## Pourquoi pas de migration automatique ?

Une migration autonome qui ferait `DROP EXTENSION postgis CASCADE` puis
`CREATE EXTENSION postgis WITH SCHEMA extensions` est techniquement faisable,
mais **elle supprimerait toutes les fonctions qui utilisent PostGIS** :

| Fonction                                                | Source        | Version courante |
| ------------------------------------------------------- | ------------- | ---------------- |
| `update_location_from_coordinates`                      | 003           | 003              |
| `update_profile_location` / `update_project_location`   | 007           | 007              |
| `calculate_distance`                                    | 003           | 003              |
| `get_talent_profile_with_coords`                        | 008           | 008              |
| `get_nearby_projects`                                   | 009           | 009              |
| `calculate_match_score`                                 | 018           | 018              |
| `find_matching_projects`                                | 003 → **034** | **034**          |
| `find_matching_talents`                                 | 003           | 003              |
| `notify_matching_talents_of_new_project`                | 018 → **034** | **034**          |
| `notify_matching_projects_of_new_talent_internal`       | 018 → **034** | **034**          |
| `notify_matching_projects_of_new_talent`                | 018           | 018 (obsolète)   |
| `notify_projects_on_skill_added`                        | 018           | 018 (obsolète)   |

Le risque : deux fonctions de 018 (`notify_matching_projects_of_new_talent`
et `notify_projects_on_skill_added`) référencent encore
`project_skills_needed`, table renommée en `project_skills_needed_old` par
la migration 033. Les recréer "telles quelles" produirait soit des
fonctions cassées (si la table _old a été supprimée), soit des
comportements incorrects (notifications sur des données obsolètes).

Consolider tout cela dans une seule migration reviendrait à réécrire une
partie significative du back-office métier, ce qui est hors de scope.

## Options disponibles

### Option A (recommandée) — Accepter le warning

`spatial_ref_sys` contient les systèmes de référence géodésique (SRID EPSG),
des **données publiques universelles** (les mêmes dans tous les projets
PostGIS au monde). Il n'y a objectivement rien à protéger.

**Action :** aucune. Le warning reste listé dans le linter mais n'indique
pas une vulnérabilité réelle.

**Référence :** [Splinter — RLS Disabled in Public](https://supabase.github.io/splinter/0013_rls_disabled_in_public/)

### Option B — Demander à Supabase Support de relocaliser PostGIS

La [procédure officielle Supabase](https://supabase.com/docs/guides/database/extensions/postgis)
existe mais nécessite des privilèges `supabase_admin` inaccessibles depuis
l'interface utilisateur. Elle utilise une astuce sur `pg_extension` :

```sql
BEGIN;
UPDATE pg_extension SET extrelocatable = true WHERE extname = 'postgis';
ALTER EXTENSION postgis SET SCHEMA extensions;
ALTER EXTENSION postgis UPDATE TO "<POSTGIS_VERSION>next";
ALTER EXTENSION postgis UPDATE;
UPDATE pg_extension SET extrelocatable = false WHERE extname = 'postgis';
COMMIT;
```

Cette procédure **préserve les colonnes, index et fonctions** existants —
contrairement au `DROP ... CASCADE`.

**Action :** ouvrir un ticket de support Supabase en copiant le script
ci-dessus. La version de PostGIS peut être récupérée via
`SELECT extversion FROM pg_extension WHERE extname = 'postgis';`.

### Option C — Reset complet en local puis republication

Uniquement pertinent si le projet n'est pas en production (c'est le cas
aujourd'hui : 7 profils + 1 projet avec coordonnées).

1. Exporter les données (`pg_dump` ou export CSV depuis le Dashboard)
2. Créer un nouveau projet Supabase
3. Dans le nouveau projet, s'assurer que PostGIS est créé dans
   `extensions` : Dashboard → Database → Extensions → rechercher postgis
   → activer dans le schéma `extensions` (par défaut)
4. Rejouer les migrations dans l'ordre
5. Réimporter les données

Cette option est longue mais produit une base de données "propre" dès le
départ. Elle est rarement nécessaire.

## Décision actuelle

**Option A retenue** tant que le site n'est pas officiellement lancé.

Les migrations 031 et 035 sont conservées car elles documentent les
tentatives et sont inoffensives (elles échouent proprement via des
`EXCEPTION` handlers).

Si la décision change, ce document servira de point de départ pour
l'Option B ou C.

## Références

- [Cannot enable RLS for spatial_ref_sys table — Supabase Discussion #26302](https://github.com/orgs/supabase/discussions/26302)
- [PostGIS extension docs — Supabase](https://supabase.com/docs/guides/database/extensions/postgis)
- [Move PostGIS extension to a different schema — PostGIS docs](https://postgis.net/documentation/tips/tip-move-postgis-schema/)
- [Splinter rule 0013 — RLS Disabled in Public](https://supabase.github.io/splinter/0013_rls_disabled_in_public/)
