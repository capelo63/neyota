-- ============================================
-- MIGRATION 036: Skills détaillées par catégorie
-- ============================================
-- Remplace les 7 skills génériques de la migration 033 par des
-- compétences détaillées. Correspond aux 44 besoins des porteurs.
-- Total: environ 70 skills prédéfinies

-- Supprimer les 7 skills génériques insérées par la migration 033
-- (CASCADE supprime aussi les entrées user_skills et need_skill_mapping associées)
DELETE FROM skills WHERE is_custom = FALSE AND name IN (
  'Stratégie / Business / Impact',
  'Marketing / Communication',
  'Produit / Tech',
  'Opérations / Gestion de projet',
  'Finance / Juridique / RH',
  'Commercial / Relation client',
  'Autre expertise (à préciser)'
);

-- ============================================
-- STRATEGY / BUSINESS / IMPACT (🎯)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Structuration & stratégie
  ('Business model & stratégie', 'strategy', FALSE),
  ('Étude de marché & positionnement', 'strategy', FALSE),
  ('Business plan & pitch deck', 'strategy', FALSE),
  ('Définition de l''offre de valeur', 'strategy', FALSE),
  ('Priorisation & roadmap', 'strategy', FALSE),

  -- Impact & ancrage territorial
  ('Mesure d''impact social/environnemental', 'strategy', FALSE),
  ('Développement de partenariats stratégiques', 'strategy', FALSE),
  ('Ancrage territorial & écosystème local', 'strategy', FALSE),

  -- Accompagnement
  ('Accompagnement entrepreneurial / mentoring', 'strategy', FALSE),
  ('Coaching de dirigeant', 'strategy', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- MARKETING / COMMUNICATION (📣)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Stratégie marketing
  ('Stratégie marketing & communication', 'marketing', FALSE),
  ('Étude de cible & persona', 'marketing', FALSE),
  ('Positionnement & messaging', 'marketing', FALSE),

  -- Marketing digital
  ('Marketing digital (SEO, SEA, réseaux sociaux)', 'marketing', FALSE),
  ('SEO / Référencement naturel', 'marketing', FALSE),
  ('SEA / Publicité en ligne (Google Ads, Meta Ads)', 'marketing', FALSE),
  ('Social media marketing', 'marketing', FALSE),
  ('Content marketing & stratégie éditoriale', 'marketing', FALSE),
  ('Community management', 'marketing', FALSE),
  ('Email marketing & automation', 'marketing', FALSE),

  -- Branding & création
  ('Identité visuelle & branding', 'marketing', FALSE),
  ('Création de supports de communication', 'marketing', FALSE),
  ('Copywriting & rédaction', 'marketing', FALSE),
  ('Photographie & vidéo', 'marketing', FALSE),
  ('Design graphique', 'marketing', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUIT / TECH (💻)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Product management
  ('Product management', 'product', FALSE),
  ('UX/UI Design', 'product', FALSE),
  ('Prototypage & wireframing', 'product', FALSE),
  ('Tests utilisateurs & validation', 'product', FALSE),

  -- Développement web
  ('Développement web (sites vitrine, e-commerce)', 'product', FALSE),
  ('Développement d''applications web (SaaS, plateformes)', 'product', FALSE),
  ('Développement front-end (React, Vue, etc.)', 'product', FALSE),
  ('Développement back-end (Node, Python, PHP)', 'product', FALSE),

  -- Développement mobile
  ('Développement mobile (iOS, Android)', 'product', FALSE),
  ('Développement mobile cross-platform (React Native, Flutter)', 'product', FALSE),

  -- No-code & automation
  ('No-code / Low-code (Webflow, Bubble, Notion)', 'product', FALSE),
  ('Automatisation & workflows (Zapier, Make, n8n)', 'product', FALSE),
  ('Intégration d''outils & API', 'product', FALSE),

  -- Tech avancée
  ('Data science / Intelligence Artificielle', 'product', FALSE),
  ('DevOps / Infrastructure cloud', 'product', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- OPÉRATIONS / GESTION DE PROJET (⚙️)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Gestion de projet
  ('Gestion de projet (Agile, Scrum, Kanban)', 'operations', FALSE),
  ('Planification & pilotage de projet', 'operations', FALSE),
  ('Coordination d''équipe', 'operations', FALSE),

  -- Organisation
  ('Organisation & productivité', 'operations', FALSE),
  ('Gestion du temps & priorisation', 'operations', FALSE),
  ('Mise en place de processus & workflows', 'operations', FALSE),

  -- Croissance & structuration
  ('Pilotage de la croissance', 'operations', FALSE),
  ('Structuration d''équipe', 'operations', FALSE),
  ('Change management', 'operations', FALSE),
  ('Qualité & amélioration continue', 'operations', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- FINANCE / JURIDIQUE / RH (💰)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Finance
  ('Budget & prévisionnel financier', 'finance_legal_hr', FALSE),
  ('Comptabilité & trésorerie', 'finance_legal_hr', FALSE),
  ('Analyse financière & rentabilité', 'finance_legal_hr', FALSE),
  ('Recherche de financements (subventions, prêts)', 'finance_legal_hr', FALSE),
  ('Levée de fonds / Fundraising', 'finance_legal_hr', FALSE),

  -- Juridique
  ('Choix de statut juridique', 'finance_legal_hr', FALSE),
  ('Droit des affaires & contrats', 'finance_legal_hr', FALSE),
  ('Propriété intellectuelle', 'finance_legal_hr', FALSE),
  ('Gestion administrative', 'finance_legal_hr', FALSE),

  -- RH
  ('Ressources humaines & recrutement', 'finance_legal_hr', FALSE),
  ('Formation & développement des compétences', 'finance_legal_hr', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMERCIAL / RELATION CLIENT (🤝)
-- ============================================
INSERT INTO skills (name, category, is_custom) VALUES
  -- Vente & développement commercial
  ('Développement commercial B2B', 'commercial', FALSE),
  ('Développement commercial B2C', 'commercial', FALSE),
  ('Prospection & génération de leads', 'commercial', FALSE),
  ('Techniques de vente & négociation', 'commercial', FALSE),

  -- Stratégie commerciale
  ('Stratégie de distribution', 'commercial', FALSE),
  ('Pricing & politique tarifaire', 'commercial', FALSE),
  ('Amélioration de la rentabilité', 'commercial', FALSE),

  -- Relation client
  ('Relation client & customer success', 'commercial', FALSE),
  ('Service après-vente & support', 'commercial', FALSE),
  ('Fidélisation client', 'commercial', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================
-- STATISTIQUES
-- ============================================
DO $$
DECLARE
  skill_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO skill_count FROM skills WHERE is_custom = FALSE;
  RAISE NOTICE '✓ Migration 036 complète: % compétences prédéfinies insérées', skill_count;
END $$;
