-- ============================================
-- Migration 043: Recréation de need_skill_mapping
-- pour les 70 compétences détaillées (migration 036)
-- ============================================
-- Migration 036 a supprimé les 7 compétences génériques avec CASCADE,
-- vidant need_skill_mapping. Cette migration recrée des mappings
-- granulaires avec des scores différenciés (5–10).
-- Scores : 10 = correspondance directe, 7-8 = forte, 5-6 = partielle
-- Filet "other" (catégorie other, score 3) en dernier.
-- ============================================

TRUNCATE TABLE need_skill_mapping;

-- ============================================
-- STRUCTURING — Clarifier et cadrer mon projet
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Business model & stratégie',               10),
  ('Définition de l''offre de valeur',         10),
  ('Étude de marché & positionnement',          9),
  ('Business plan & pitch deck',                7),
  ('Accompagnement entrepreneurial / mentoring',7),
  ('Coaching de dirigeant',                     6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Clarifier mon idée';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Business model & stratégie',               10),
  ('Définition de l''offre de valeur',          9),
  ('Business plan & pitch deck',                8),
  ('Étude de marché & positionnement',          8),
  ('Pricing & politique tarifaire',             7),
  ('Analyse financière & rentabilité',          7),
  ('Budget & prévisionnel financier',           6),
  ('Stratégie de distribution',                 6),
  ('Accompagnement entrepreneurial / mentoring',6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Définir mon modèle économique';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Business plan & pitch deck',               10),
  ('Business model & stratégie',               9),
  ('Budget & prévisionnel financier',           8),
  ('Analyse financière & rentabilité',          8),
  ('Définition de l''offre de valeur',          7),
  ('Étude de marché & positionnement',          7),
  ('Accompagnement entrepreneurial / mentoring',6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Construire un business plan';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Priorisation & roadmap',                   10),
  ('Gestion de projet (Agile, Scrum, Kanban)',  8),
  ('Planification & pilotage de projet',        8),
  ('Organisation & productivité',               7),
  ('Gestion du temps & priorisation',           7),
  ('Coaching de dirigeant',                     6),
  ('Accompagnement entrepreneurial / mentoring',6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Prioriser mes actions';

-- ============================================
-- LAUNCHING — Passer à l'action
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Accompagnement entrepreneurial / mentoring',9),
  ('Business model & stratégie',               8),
  ('Gestion de projet (Agile, Scrum, Kanban)',  8),
  ('Planification & pilotage de projet',        8),
  ('Priorisation & roadmap',                   7),
  ('Définition de l''offre de valeur',          7),
  ('Coaching de dirigeant',                     7),
  ('Mise en place de processus & workflows',    6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Me lancer concrètement';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Définition de l''offre de valeur',         10),
  ('Business model & stratégie',               9),
  ('Positionnement & messaging',               8),
  ('Stratégie marketing & communication',      8),
  ('Copywriting & rédaction',                  7),
  ('Étude de marché & positionnement',         6),
  ('Développement commercial B2B',             6),
  ('Développement commercial B2C',             6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Formaliser mon offre';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Product management',                                      10),
  ('Prototypage & wireframing',                               10),
  ('UX/UI Design',                                            9),
  ('Tests utilisateurs & validation',                         9),
  ('No-code / Low-code (Webflow, Bubble, Notion)',            8),
  ('Développement web (sites vitrine, e-commerce)',           8),
  ('Développement d''applications web (SaaS, plateformes)',   8),
  ('Développement front-end (React, Vue, etc.)',              7),
  ('Développement back-end (Node, Python, PHP)',              7),
  ('Développement mobile (iOS, Android)',                     6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Créer une première version (produit/service)';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Tests utilisateurs & validation',          10),
  ('Étude de cible & persona',                 9),
  ('Étude de marché & positionnement',         9),
  ('Prototypage & wireframing',                8),
  ('Product management',                       8),
  ('UX/UI Design',                             7),
  ('Business model & stratégie',              6),
  ('Accompagnement entrepreneurial / mentoring',6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Tester mon idée';

-- ============================================
-- FINDING_CLIENTS — Attirer mes premiers utilisateurs
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Étude de cible & persona',                 10),
  ('Étude de marché & positionnement',          9),
  ('Stratégie marketing & communication',       9),
  ('Positionnement & messaging',               8),
  ('Business model & stratégie',              7),
  ('Développement commercial B2B',             6),
  ('Développement commercial B2C',             6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Définir ma cible';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Développement commercial B2B',                      10),
  ('Développement commercial B2C',                      10),
  ('Prospection & génération de leads',                 10),
  ('Techniques de vente & négociation',                  9),
  ('Stratégie marketing & communication',                8),
  ('Marketing digital (SEO, SEA, réseaux sociaux)',      7),
  ('SEA / Publicité en ligne (Google Ads, Meta Ads)',    7),
  ('Email marketing & automation',                       6),
  ('Relation client & customer success',                 6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Trouver mes premiers clients';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('SEO / Référencement naturel',                        10),
  ('Marketing digital (SEO, SEA, réseaux sociaux)',      10),
  ('Social media marketing',                             9),
  ('SEA / Publicité en ligne (Google Ads, Meta Ads)',    9),
  ('Content marketing & stratégie éditoriale',           8),
  ('Community management',                               8),
  ('Stratégie marketing & communication',                8),
  ('Email marketing & automation',                       7),
  ('Copywriting & rédaction',                            6),
  ('Photographie & vidéo',                               6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Gagner en visibilité';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Stratégie marketing & communication',      10),
  ('Content marketing & stratégie éditoriale',  9),
  ('Social media marketing',                    9),
  ('Copywriting & rédaction',                   9),
  ('Community management',                      8),
  ('Email marketing & automation',              8),
  ('Création de supports de communication',     8),
  ('Photographie & vidéo',                      7),
  ('SEO / Référencement naturel',               7)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Déployer ma communication';

-- ============================================
-- BRANDING — Construire mon image
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Identité visuelle & branding',             10),
  ('Design graphique',                         10),
  ('Création de supports de communication',     8),
  ('UX/UI Design',                              7),
  ('Photographie & vidéo',                      7),
  ('Stratégie marketing & communication',       6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Créer une identité visuelle';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Création de supports de communication',    10),
  ('Design graphique',                         10),
  ('Identité visuelle & branding',              8),
  ('Copywriting & rédaction',                   8),
  ('Photographie & vidéo',                      8),
  ('UX/UI Design',                              6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Concevoir des supports de communication';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Identité visuelle & branding',             10),
  ('Stratégie marketing & communication',       9),
  ('Positionnement & messaging',               9),
  ('Content marketing & stratégie éditoriale',  8),
  ('Community management',                      7),
  ('Social media marketing',                    7),
  ('Copywriting & rédaction',                   7),
  ('Design graphique',                          6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Renforcer mon image de marque';

-- ============================================
-- DIGITAL_TOOLS — Solutions numériques
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Développement web (sites vitrine, e-commerce)',          10),
  ('No-code / Low-code (Webflow, Bubble, Notion)',            9),
  ('Développement front-end (React, Vue, etc.)',              9),
  ('Développement back-end (Node, Python, PHP)',              8),
  ('UX/UI Design',                                           8),
  ('Prototypage & wireframing',                              7),
  ('Développement d''applications web (SaaS, plateformes)',  7),
  ('Intégration d''outils & API',                            6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Créer un site web';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Développement d''applications web (SaaS, plateformes)',          10),
  ('Développement mobile (iOS, Android)',                             10),
  ('Développement mobile cross-platform (React Native, Flutter)',     10),
  ('Product management',                                             10),
  ('UX/UI Design',                                                    9),
  ('Prototypage & wireframing',                                       9),
  ('Tests utilisateurs & validation',                                 8),
  ('Développement front-end (React, Vue, etc.)',                      8),
  ('Développement back-end (Node, Python, PHP)',                      8),
  ('Data science / Intelligence Artificielle',                        6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Concevoir une application';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('No-code / Low-code (Webflow, Bubble, Notion)',  10),
  ('Intégration d''outils & API',                   9),
  ('Automatisation & workflows (Zapier, Make, n8n)', 8),
  ('Mise en place de processus & workflows',         7),
  ('Développement web (sites vitrine, e-commerce)',  6),
  ('DevOps / Infrastructure cloud',                  6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Mettre en place des outils numériques';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Automatisation & workflows (Zapier, Make, n8n)', 10),
  ('No-code / Low-code (Webflow, Bubble, Notion)',    9),
  ('Intégration d''outils & API',                    9),
  ('Mise en place de processus & workflows',          7),
  ('Data science / Intelligence Artificielle',        7),
  ('DevOps / Infrastructure cloud',                   6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Automatiser certaines tâches';

-- ============================================
-- FINANCE — Piloter mes finances
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Budget & prévisionnel financier',  10),
  ('Comptabilité & trésorerie',         9),
  ('Analyse financière & rentabilité',  8),
  ('Business plan & pitch deck',        7),
  ('Business model & stratégie',       6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Construire un budget';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Recherche de financements (subventions, prêts)', 10),
  ('Levée de fonds / Fundraising',                   10),
  ('Business plan & pitch deck',                      8),
  ('Analyse financière & rentabilité',                7),
  ('Budget & prévisionnel financier',                 7),
  ('Accompagnement entrepreneurial / mentoring',      6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Trouver des financements';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Analyse financière & rentabilité',  10),
  ('Amélioration de la rentabilité',    10),
  ('Pricing & politique tarifaire',      9),
  ('Budget & prévisionnel financier',    8),
  ('Comptabilité & trésorerie',          7),
  ('Business model & stratégie',        7),
  ('Stratégie de distribution',          6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Améliorer la rentabilité';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Comptabilité & trésorerie',         10),
  ('Budget & prévisionnel financier',    9),
  ('Analyse financière & rentabilité',   8),
  ('Gestion administrative',             6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Suivre ma trésorerie';

-- ============================================
-- LEGAL — Sécuriser mon cadre légal
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Choix de statut juridique',                  10),
  ('Droit des affaires & contrats',               8),
  ('Gestion administrative',                      7),
  ('Accompagnement entrepreneurial / mentoring',  6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Choisir un statut juridique';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Gestion administrative',              10),
  ('Choix de statut juridique',            7),
  ('Droit des affaires & contrats',        6),
  ('Ressources humaines & recrutement',    6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Gérer les aspects administratifs';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Propriété intellectuelle',                   10),
  ('Droit des affaires & contrats',               9),
  ('Choix de statut juridique',                   6),
  ('Accompagnement entrepreneurial / mentoring',  5)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Protéger mon projet (marque, propriété intellectuelle)';

-- ============================================
-- ORGANIZATION — Mieux m'organiser et collaborer
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Organisation & productivité',               10),
  ('Mise en place de processus & workflows',    10),
  ('Gestion de projet (Agile, Scrum, Kanban)',   9),
  ('Planification & pilotage de projet',         8),
  ('Qualité & amélioration continue',            7),
  ('Change management',                          6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Organiser mon fonctionnement';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Gestion du temps & priorisation',            10),
  ('Organisation & productivité',                10),
  ('Priorisation & roadmap',                      7),
  ('Coaching de dirigeant',                       7),
  ('Accompagnement entrepreneurial / mentoring',  6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Mieux gérer mon temps';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Gestion de projet (Agile, Scrum, Kanban)',   10),
  ('Planification & pilotage de projet',         10),
  ('Mise en place de processus & workflows',      9),
  ('Coordination d''équipe',                      8),
  ('Organisation & productivité',                 8),
  ('Qualité & amélioration continue',             7),
  ('No-code / Low-code (Webflow, Bubble, Notion)', 6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Mettre en place une gestion de projet';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Coordination d''équipe',                     10),
  ('Structuration d''équipe',                     8),
  ('Gestion de projet (Agile, Scrum, Kanban)',    8),
  ('Ressources humaines & recrutement',           7),
  ('Change management',                           7),
  ('Formation & développement des compétences',   7),
  ('Planification & pilotage de projet',          6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Travailler en équipe';

-- ============================================
-- GROWTH — Faire évoluer mon activité
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Pilotage de la croissance',                  10),
  ('Développement commercial B2B',                9),
  ('Développement commercial B2C',                9),
  ('Business model & stratégie',                 8),
  ('Stratégie de distribution',                   7),
  ('Prospection & génération de leads',           7),
  ('Stratégie marketing & communication',         7),
  ('Marketing digital (SEO, SEA, réseaux sociaux)', 7)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Faire grandir mon activité';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Pilotage de la croissance',                  10),
  ('Structuration d''équipe',                    10),
  ('Business model & stratégie',                  9),
  ('Change management',                           8),
  ('Planification & pilotage de projet',          8),
  ('Ressources humaines & recrutement',           7),
  ('Mise en place de processus & workflows',      7),
  ('Gestion de projet (Agile, Scrum, Kanban)',    7)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Structurer ma croissance';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Pilotage de la croissance',                       10),
  ('Structuration d''équipe',                          9),
  ('Change management',                                9),
  ('Business model & stratégie',                       8),
  ('Levée de fonds / Fundraising',                     8),
  ('Recherche de financements (subventions, prêts)',    7),
  ('Développement de partenariats stratégiques',        7),
  ('Stratégie de distribution',                         7)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Changer d''échelle';

-- ============================================
-- IMPACT — Amplifier mon impact
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Mesure d''impact social/environnemental',    10),
  ('Business model & stratégie',                  7),
  ('Ancrage territorial & écosystème local',       7),
  ('Accompagnement entrepreneurial / mentoring',   6),
  ('Développement de partenariats stratégiques',   6),
  ('Coaching de dirigeant',                        6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Clarifier mon impact social / environnemental';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Ancrage territorial & écosystème local',       10),
  ('Développement de partenariats stratégiques',    9),
  ('Mesure d''impact social/environnemental',       7),
  ('Community management',                          6),
  ('Accompagnement entrepreneurial / mentoring',    6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'M''ancrer sur mon territoire';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Développement de partenariats stratégiques',   10),
  ('Ancrage territorial & écosystème local',         8),
  ('Développement commercial B2B',                   7),
  ('Techniques de vente & négociation',              6),
  ('Stratégie marketing & communication',            6),
  ('Mesure d''impact social/environnemental',        5)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Développer des partenariats';

-- ============================================
-- MENTORING — Bénéficier d'un accompagnement
-- ============================================

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Accompagnement entrepreneurial / mentoring',  10),
  ('Coaching de dirigeant',                       10),
  ('Business model & stratégie',                   7),
  ('Étude de marché & positionnement',             6),
  ('Développement de partenariats stratégiques',   6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Être conseillé / mentoré';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Coaching de dirigeant',                       10),
  ('Accompagnement entrepreneurial / mentoring',  10),
  ('Business model & stratégie',                   6),
  ('Ancrage territorial & écosystème local',        5)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Prendre du recul';

INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, v.score
FROM needs n
JOIN (VALUES
  ('Formation & développement des compétences',   10),
  ('Accompagnement entrepreneurial / mentoring',   9),
  ('Coaching de dirigeant',                        8),
  ('Qualité & amélioration continue',              6),
  ('Gestion de projet (Agile, Scrum, Kanban)',     6)
) AS v(skill_name, score) ON true
JOIN skills s ON s.name = v.skill_name
WHERE n.name = 'Monter en compétences';

-- ============================================
-- FILET DE SÉCURITÉ : compétences catégorie "other" → tous les besoins (score 3)
-- Note : migration 036 n'a pas réinséré de compétence prédéfinie en
-- catégorie 'other'. Cette instruction insère 0 ligne sans erreur si
-- aucune compétence is_custom=FALSE de catégorie 'other' n'existe.
-- ============================================
INSERT INTO need_skill_mapping (need_id, skill_id, relevance_score)
SELECT n.id, s.id, 3
FROM needs n
CROSS JOIN skills s
WHERE s.category = 'other' AND s.is_custom = FALSE;

-- ============================================
-- Vérification finale
-- ============================================
DO $$
DECLARE
  mapping_count    INTEGER;
  uncovered_count  INTEGER;
BEGIN
  SELECT COUNT(*) INTO mapping_count FROM need_skill_mapping;
  SELECT COUNT(*) INTO uncovered_count
  FROM needs n
  WHERE NOT EXISTS (
    SELECT 1 FROM need_skill_mapping nsm WHERE nsm.need_id = n.id
  );
  RAISE NOTICE '✓ Migration 043 : % mappings créés, % besoins sans mapping', mapping_count, uncovered_count;
END $$;
