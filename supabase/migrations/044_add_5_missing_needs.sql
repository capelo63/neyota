-- ============================================
-- Migration 044: Ajout des 5 besoins manquants
-- ============================================
-- Le commentaire "44 items" dans needs-skills.ts était anticipé mais
-- seuls 39 besoins avaient été insérés (033 + 037).
-- Cette migration ajoute 1 besoin dans chacune des 5 catégories
-- qui n'en avaient que 3 : branding, legal, growth, impact, mentoring.
-- ============================================

INSERT INTO needs (category, name, sort_order) VALUES
  ('branding',  'Définir mon positionnement de marque', 4),
  ('legal',     'Mettre mon activité en conformité',    4),
  ('growth',    'Diversifier mes sources de revenus',   4),
  ('impact',    'Communiquer sur mon impact',           4),
  ('mentoring', 'Renforcer ma posture de dirigeant',    4);

-- ============================================
-- Mappings need_skill_mapping
-- ============================================

-- branding: Définir mon positionnement de marque
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Positionnement & messaging',           10),
  ('Stratégie marketing & communication',   9),
  ('Étude de marché & positionnement',      8),
  ('Identité visuelle & branding',          8),
  ('Étude de cible & persona',              7),
  ('Business model & stratégie',           6),
  ('Copywriting & rédaction',               6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Définir mon positionnement de marque';

-- legal: Mettre mon activité en conformité
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Droit des affaires & contrats',         10),
  ('Gestion administrative',                10),
  ('Choix de statut juridique',              7),
  ('Propriété intellectuelle',               6),
  ('Ressources humaines & recrutement',      5)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Mettre mon activité en conformité';

-- growth: Diversifier mes sources de revenus
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Business model & stratégie',                  10),
  ('Stratégie de distribution',                    9),
  ('Pricing & politique tarifaire',                9),
  ('Développement commercial B2B',                 8),
  ('Développement commercial B2C',                 8),
  ('Analyse financière & rentabilité',             7),
  ('Accompagnement entrepreneurial / mentoring',   6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Diversifier mes sources de revenus';

-- impact: Communiquer sur mon impact
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Mesure d''impact social/environnemental',  10),
  ('Stratégie marketing & communication',        9),
  ('Content marketing & stratégie éditoriale',   8),
  ('Community management',                       7),
  ('Copywriting & rédaction',                    7),
  ('Social media marketing',                     7),
  ('Ancrage territorial & écosystème local',      6),
  ('Identité visuelle & branding',               6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Communiquer sur mon impact';

-- mentoring: Renforcer ma posture de dirigeant
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Coaching de dirigeant',                       10),
  ('Accompagnement entrepreneurial / mentoring',   9),
  ('Gestion du temps & priorisation',              7),
  ('Change management',                            7),
  ('Formation & développement des compétences',    6),
  ('Business model & stratégie',                  5)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Renforcer ma posture de dirigeant';

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 044 : 5 besoins insérés, 33 mappings ajoutés. Total needs : 44.';
END $$;
