# CLAUDE.md — Teriis (projet Neyota)

## Lis ce fichier EN PREMIER avant toute action

## Projet
- **Nom** : Teriis (TERritoires, Initiatives et Innovation sociale)
- **Repo** : github.com/capelo63/neyota
- **Prod** : https://neyota.vercel.app (déployé depuis `main` via Vercel)
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
- Dernière migration appliquée : **047** (corrections IDOR : REVOKE anon sur profiles/user_skills, auth guard sur find_matching_projects)
- Migration suivante à appliquer : **048** (module B2B : enum partner_organization_type, tables partner_organizations / partner_visibility_settings / partner_profile_views, is_admin sur profiles)
- Fichiers dans `supabase/migrations/`
- Appliquer manuellement via Dashboard Supabase → SQL Editor
- Toujours créer une migration pour chaque changement de schéma

## Système Besoins/Compétences (migration 033+)
- Porteurs de projet → sélectionnent des **Besoins** (table `project_needs`, 11 catégories, 44 items)
- Talents → sélectionnent des **Compétences** (table `user_skills`, 7 catégories, ~70 items)
- Matching via `need_skill_mapping` avec `relevance_score`
- Constantes dans `lib/constants/needs-skills.ts`

## Emails (Brevo)
- Edge Function : `supabase/functions/send-emails/index.ts` (déployée sur Supabase, pas Vercel)
- File d'attente : table `email_queue`
- Cron job : toutes les 10 minutes (`send-pending-emails`)
- Expéditeur : `notifications@neyota.com`
- 7 types d'emails : welcome, application_received, invitation_received, application_accepted, application_rejected, profile_incomplete, weekly_digest

## Bugs connus / en cours
- Page Talents : "Types d'intervention" affiche des propositions incorrectes (bug non corrigé)
- Cron emails de bienvenue : toutes les 10 min (`send-welcome-emails-for-confirmed-users`)

## Pages publiques (sans auth)
/, /login, /signup, /projects, /projects/[id], /talents, /profile/[id],
/about, /charter, /terms, /privacy, /contact, /matching, /faq, /legal
