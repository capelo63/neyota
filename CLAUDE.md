# CLAUDE.md — Teriis (projet Neyota)

## Lis ce fichier EN PREMIER avant toute action

## Projet
- **Nom** : Teriis (TERritoires, Initiatives et Impact social)
- **Repo** : github.com/capelo63/neyota
- **Prod** : https://www.teriis.fr (déployé depuis `main` via Vercel)
- **Supabase** : https://rnzezkzsbdvaizpuukec.supabase.co

## Stack
- Next.js 15+ App Router, TypeScript, Tailwind CSS
- Supabase Pro (PostgreSQL + PostGIS)
- Vercel (déploiement auto sur merge vers `main`)
- Brevo (emails via API + SMTP)

## Workflow Git
- Travailler sur une branche feature (ex. `claude/create-claude-md-ZlC7d`)
- Commiter et pusher après chaque groupe de modifications
- Merger vers `main` via PR pour déclencher le déploiement Vercel
- Ne jamais pusher directement sur `main` (branche protégée)

## Conventions critiques — NE PAS SE TROMPER
- Colonne rôle : ENUM `user_role` → valeurs `entrepreneur` | `talent` (en DB, affiché "Porteur d'initiative" dans l'UI)
- Table candidatures : colonne `talent_id` (pas `applicant_id`), `motivation_message` (pas `message`)
- Client Supabase : toujours `@supabase/ssr` (jamais `@supabase/auth-helpers-nextjs`)
- Composants client avec hooks → `'use client'` obligatoire
- `useSearchParams()` → toujours dans `<Suspense>`
- RLS pages publiques : `GRANT SELECT ON table TO anon` EN PLUS du `CREATE POLICY ... TO public`
- **NE PAS** accorder `GRANT SELECT ON profiles TO anon` ni `GRANT SELECT ON user_skills TO anon` (révoqués en 047 — utiliser les vues `profiles_public` / `projects_public`)

## Diagnostic erreurs
- **Quand une page server-side retourne 0 résultats** → vérifier les logs Vercel EN PREMIER
- **Erreur SQL dans le navigateur** → souvent un nom de colonne incorrect, pas un problème RLS
- **Build Vercel échoue** → TypeScript strict, vérifier les types null/undefined

## Migrations Supabase
- Dernière migration appliquée : **059** (système de demandes de contact partenaire→porteur/talent)
- Fichiers dans `supabase/migrations/`
- Appliquer manuellement via Dashboard Supabase → SQL Editor
- Toujours créer une migration pour chaque changement de schéma
- ⚠️ `ALTER TYPE ... ADD VALUE` doit être exécuté SEUL (hors transaction) avant le reste de la migration

### Historique récent (048–059)
- **048** : module B2B — enum `partner_organization_type`, tables `partner_organizations` / `partner_visibility_settings` / `partner_profile_views`, colonne `is_admin` sur `profiles`
- **049** : fonction `get_partner_visible_profiles()` SECURITY DEFINER
- **050** : RLS et GRANT sur `partner_organizations` / `partner_visibility_settings`
- **051** : page `/partenaires/en-attente` — colonnes `is_validated` / `is_rejected` sur `partner_organizations`
- **052** : coordonnées GPS dans `get_partner_visible_profiles()` via `ST_Y`/`ST_X` (PostGIS)
- **053** : vue `profiles_public` recréée avec `ST_Y`/`ST_X` pour `latitude`/`longitude`
- **054** : table `partner_favorites` (RLS, GRANT) + fonction `get_partner_profile_extras(UUID[])`
- **055** : `get_partner_profile_extras` enrichie avec `project_categories TEXT[]`
- **059** : table `partner_contact_requests` (UNIQUE partner/target, statuts pending/accepted/declined), 5 RPCs SECURITY DEFINER, 3 types d'email (partner_contact_request_received/accepted/declined)

## Système Besoins/Compétences (migration 033+)
- Porteurs de projet → sélectionnent des **Besoins** (table `project_needs`, 11 catégories, 44 items)
- Talents → sélectionnent des **Compétences** (table `user_skills`, 7 catégories, ~70 items)
- Matching via `need_skill_mapping` avec `relevance_score`
- Constantes dans `lib/constants/needs-skills.ts`

## Emails (Brevo)
- Edge Function : `supabase/functions/send-emails/index.ts` (déployée sur Supabase, pas Vercel)
- File d'attente : table `email_queue`
- Cron job : toutes les 10 minutes (`send-pending-emails`)
- Expéditeur : `notifications@teriis.fr`
- 10 types d'emails : welcome, application_received, invitation_received, application_accepted, application_rejected, profile_incomplete, weekly_digest, partner_contact_request_received, partner_contact_request_accepted, partner_contact_request_declined
- ⚠️ Redéployer manuellement après toute modification : `supabase functions deploy send-emails --project-ref rnzezkzsbdvaizpuukec`

## Bugs connus / en cours
- Page Talents : "Types d'intervention" affiche des propositions incorrectes (bug non corrigé)
- Cron emails de bienvenue : toutes les 10 min (`send-welcome-emails-for-confirmed-users`)

## Pages publiques (sans auth)
/, /login, /signup, /projects, /projects/[id], /talents, /profile/[id],
/about, /charter, /terms, /privacy, /contact, /matching, /faq, /legal

## Source unique de vérité
- Catégories de compétences : toujours importer depuis `lib/constants/needs-skills.ts`
  → Ne jamais redéfinir `SKILL_CATEGORIES` ou les labels localement dans un composant

  ## Terminologie — NE JAMAIS utiliser "entrepreneur"
- Dans l'UI, les emails et les templates : toujours "porteur d'initiative"
- En base de données : le rôle reste `entrepreneur` (ENUM, ne pas changer)
