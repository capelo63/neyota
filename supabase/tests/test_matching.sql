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

-- UUIDs fixes pour faciliter la lecture des résultats
DO $$
BEGIN

  INSERT INTO profiles (id, role, first_name, last_name, postal_code, city, max_distance_km)
  VALUES
    ('ffffffff-0000-0000-0000-000000000001', 'entrepreneur', 'Porteur', 'Test',    '75001', 'Paris', 50),
    ('ffffffff-0000-0000-0000-000000000002', 'talent',       'Talent',  'Alpha',   '75002', 'Paris', 100),
    ('ffffffff-0000-0000-0000-000000000003', 'talent',       'Talent',  'Beta',    '75003', 'Paris', 100);

  INSERT INTO projects (id, owner_id, title, short_pitch, status, current_phase, city, postal_code, is_remote_possible)
  VALUES (
    'ffffffff-0000-0000-0000-000000000010',
    'ffffffff-0000-0000-0000-000000000001',
    '[TEST] Projet Matching',
    'Projet fictif pour valider les scores de matching',
    'active', 'ideation', 'Paris', '75001', true
  );

  -- 4 besoins variés : 2 Produit/Tech, 1 Marketing, 1 Finance
  INSERT INTO project_needs (project_id, need_id, priority)
  SELECT 'ffffffff-0000-0000-0000-000000000010', n.id, 'essential'
  FROM needs n
  WHERE n.name IN (
    'Créer un site web',                         -- digital_tools
    'Créer une première version (produit/service)', -- launching
    'Définir ma cible',                          -- finding_clients
    'Construire un budget'                        -- finance
  );

  -- Talent A : 4 compétences Produit/Tech
  INSERT INTO user_skills (user_id, skill_id)
  SELECT 'ffffffff-0000-0000-0000-000000000002', s.id
  FROM skills s
  WHERE s.name IN (
    'Développement web (sites vitrine, e-commerce)',
    'UX/UI Design',
    'Product management',
    'Prototypage & wireframing'
  );

  -- Talent B : 4 compétences Marketing/Communication
  INSERT INTO user_skills (user_id, skill_id)
  SELECT 'ffffffff-0000-0000-0000-000000000003', s.id
  FROM skills s
  WHERE s.name IN (
    'Stratégie marketing & communication',
    'SEO / Référencement naturel',
    'Community management',
    'Étude de cible & persona'
  );

END $$;

-- ============================================
-- 2. Vérifications intermédiaires
-- ============================================

-- Besoins du projet fictif et nombre de compétences mappées
SELECT
  n.category                            AS catégorie,
  n.name                                AS besoin,
  COUNT(nsm.id)                         AS nb_compétences_mappées
FROM project_needs pn
JOIN needs n             ON n.id  = pn.need_id
JOIN need_skill_mapping nsm ON nsm.need_id = n.id
WHERE pn.project_id = 'ffffffff-0000-0000-0000-000000000010'
GROUP BY n.category, n.name
ORDER BY n.category;

-- Couverture par besoin et par talent
SELECT
  n.name                                                    AS besoin,
  'Talent A (Produit/Tech)'                                 AS talent,
  MAX(nsm.relevance_score)                                  AS meilleur_score_mapping,
  CASE WHEN COUNT(us.skill_id) > 0 THEN '✓ couvert'
       ELSE '✗ non couvert' END                            AS couverture
FROM project_needs pn
JOIN needs n             ON n.id       = pn.need_id
JOIN need_skill_mapping nsm ON nsm.need_id = n.id
LEFT JOIN user_skills us ON us.skill_id = nsm.skill_id
                        AND us.user_id  = 'ffffffff-0000-0000-0000-000000000002'
WHERE pn.project_id = 'ffffffff-0000-0000-0000-000000000010'
GROUP BY n.name

UNION ALL

SELECT
  n.name                                                    AS besoin,
  'Talent B (Marketing)'                                    AS talent,
  MAX(nsm.relevance_score)                                  AS meilleur_score_mapping,
  CASE WHEN COUNT(us.skill_id) > 0 THEN '✓ couvert'
       ELSE '✗ non couvert' END                            AS couverture
FROM project_needs pn
JOIN needs n             ON n.id       = pn.need_id
JOIN need_skill_mapping nsm ON nsm.need_id = n.id
LEFT JOIN user_skills us ON us.skill_id = nsm.skill_id
                        AND us.user_id  = 'ffffffff-0000-0000-0000-000000000003'
WHERE pn.project_id = 'ffffffff-0000-0000-0000-000000000010'
GROUP BY n.name

ORDER BY besoin, talent;

-- ============================================
-- 3. Appel de find_matching_projects()
-- ============================================

-- Talent A
SELECT
  'Talent A — Produit/Tech'                AS talent,
  project_title,
  skills_match_count                       AS besoins_couverts,
  4                                        AS total_besoins,
  ROUND(relevance_score::numeric * 100, 1) AS score_pct
FROM find_matching_projects('ffffffff-0000-0000-0000-000000000002'::uuid, 5);

-- Talent B
SELECT
  'Talent B — Marketing'                   AS talent,
  project_title,
  skills_match_count                       AS besoins_couverts,
  4                                        AS total_besoins,
  ROUND(relevance_score::numeric * 100, 1) AS score_pct
FROM find_matching_projects('ffffffff-0000-0000-0000-000000000003'::uuid, 5);

-- ============================================
-- 4. Comparaison finale
-- ============================================

SELECT
  talent,
  besoins_couverts,
  total_besoins,
  score_pct,
  CASE WHEN score_pct = MAX(score_pct) OVER () THEN '← meilleur match' ELSE '' END AS résultat
FROM (
  SELECT
    'Talent A — Produit/Tech'                AS talent,
    skills_match_count                       AS besoins_couverts,
    4                                        AS total_besoins,
    ROUND(relevance_score::numeric * 100, 1) AS score_pct
  FROM find_matching_projects('ffffffff-0000-0000-0000-000000000002'::uuid, 5)

  UNION ALL

  SELECT
    'Talent B — Marketing'                   AS talent,
    skills_match_count                       AS besoins_couverts,
    4                                        AS total_besoins,
    ROUND(relevance_score::numeric * 100, 1) AS score_pct
  FROM find_matching_projects('ffffffff-0000-0000-0000-000000000003'::uuid, 5)
) sub
ORDER BY score_pct DESC;

-- ============================================
-- ROLLBACK — aucune donnée persistée
-- ============================================
ROLLBACK;
