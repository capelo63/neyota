-- ============================================
-- Script de test matching — ROLLBACK garanti
-- Aucune donnée persistée en base
-- ============================================
-- Exécuter en entier dans Supabase SQL Editor.
-- Le ROLLBACK final annule toutes les insertions.
-- ============================================

BEGIN;

-- Bypass des contraintes FK pour les données fictives
-- (transaction-scoped : révoqué automatiquement par le ROLLBACK)
SET LOCAL session_replication_role = replica;

-- ============================================
-- 1. Données fictives
-- ============================================

DO $$
BEGIN

  INSERT INTO profiles (id, role, first_name, last_name, postal_code, city, max_distance_km)
  VALUES
    ('ffffffff-0000-0000-0000-000000000001', 'entrepreneur', 'Porteur', 'Test',  '75001', 'Paris', 50),
    ('ffffffff-0000-0000-0000-000000000002', 'talent',       'Talent',  'Alpha', '75002', 'Paris', 100),
    ('ffffffff-0000-0000-0000-000000000003', 'talent',       'Talent',  'Beta',  '75003', 'Paris', 100)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO projects (id, owner_id, title, short_pitch, status, current_phase, city, postal_code, is_remote_possible)
  VALUES (
    'ffffffff-0000-0000-0000-000000000010',
    'ffffffff-0000-0000-0000-000000000001',
    '[TEST] Projet Matching',
    'Projet fictif pour valider les scores de matching',
    'active', 'ideation', 'Paris', '75001', true
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4 besoins variés : 2 Produit/Tech, 1 Marketing, 1 Finance
  INSERT INTO project_needs (project_id, need_id, priority)
  SELECT 'ffffffff-0000-0000-0000-000000000010', n.id, 'essential'
  FROM needs n
  WHERE n.name IN (
    'Créer un site web',
    'Créer une première version (produit/service)',
    'Définir ma cible',
    'Construire un budget'
  )
  ON CONFLICT (project_id, need_id) DO NOTHING;

  -- Talent A : 4 compétences Produit/Tech
  -- Couvre "Créer un site web" (dev web=10, UX/UI=8, prototypage=7)
  --    et "Créer une première version" (product mgmt=10, prototypage=10, UX/UI=9)
  INSERT INTO user_skills (user_id, skill_id)
  SELECT 'ffffffff-0000-0000-0000-000000000002', s.id
  FROM skills s
  WHERE s.name IN (
    'Développement web (sites vitrine, e-commerce)',
    'UX/UI Design',
    'Product management',
    'Prototypage & wireframing'
  )
  ON CONFLICT (user_id, skill_id) DO NOTHING;

  -- Talent B : 4 compétences Marketing/Communication
  -- Couvre "Définir ma cible" (étude de cible=10, stratégie mktg=9)
  INSERT INTO user_skills (user_id, skill_id)
  SELECT 'ffffffff-0000-0000-0000-000000000003', s.id
  FROM skills s
  WHERE s.name IN (
    'Stratégie marketing & communication',
    'SEO / Référencement naturel',
    'Community management',
    'Étude de cible & persona'
  )
  ON CONFLICT (user_id, skill_id) DO NOTHING;

END $$;

-- ============================================
-- 2. Couverture par besoin × talent
-- ============================================

SELECT
  n.name                                                     AS besoin,
  n.category,
  CASE WHEN COUNT(us_a.skill_id) > 0 THEN '✓' ELSE '✗' END AS talent_a,
  CASE WHEN COUNT(us_b.skill_id) > 0 THEN '✓' ELSE '✗' END AS talent_b
FROM project_needs pn
JOIN needs n ON n.id = pn.need_id
JOIN need_skill_mapping nsm ON nsm.need_id = n.id
LEFT JOIN user_skills us_a ON us_a.skill_id = nsm.skill_id
                          AND us_a.user_id   = 'ffffffff-0000-0000-0000-000000000002'
LEFT JOIN user_skills us_b ON us_b.skill_id = nsm.skill_id
                          AND us_b.user_id   = 'ffffffff-0000-0000-0000-000000000003'
WHERE pn.project_id = 'ffffffff-0000-0000-0000-000000000010'
GROUP BY n.name, n.category
ORDER BY n.category;

-- ============================================
-- 3. Résultats find_matching_projects() — projet fictif uniquement
-- ============================================

SELECT
  talent,
  besoins_couverts,
  total_besoins,
  score_pct,
  CASE WHEN score_pct = MAX(score_pct) OVER () THEN '← meilleur match' ELSE '' END AS résultat
FROM (
  SELECT
    'Talent A — Produit/Tech'                  AS talent,
    skills_match_count                         AS besoins_couverts,
    4                                          AS total_besoins,
    ROUND(relevance_score * 100, 1)            AS score_pct
  FROM find_matching_projects('ffffffff-0000-0000-0000-000000000002'::uuid, 50)
  WHERE project_id = 'ffffffff-0000-0000-0000-000000000010'

  UNION ALL

  SELECT
    'Talent B — Marketing'                     AS talent,
    skills_match_count                         AS besoins_couverts,
    4                                          AS total_besoins,
    ROUND(relevance_score * 100, 1)            AS score_pct
  FROM find_matching_projects('ffffffff-0000-0000-0000-000000000003'::uuid, 50)
  WHERE project_id = 'ffffffff-0000-0000-0000-000000000010'
) sub
ORDER BY score_pct DESC;

-- ============================================
-- ROLLBACK — aucune donnée persistée
-- ============================================
ROLLBACK;
