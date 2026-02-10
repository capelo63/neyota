-- ============================================
-- SEED DATA: Skills Taxonomy
-- ============================================

-- TECHNICAL SKILLS
INSERT INTO skills (name, category, is_custom) VALUES
  ('Développement Web (React, Vue, Angular)', 'technical', FALSE),
  ('Développement Web (Node.js, Express)', 'technical', FALSE),
  ('Développement Web (PHP, Laravel)', 'technical', FALSE),
  ('Développement Mobile (iOS, Swift)', 'technical', FALSE),
  ('Développement Mobile (Android, Kotlin)', 'technical', FALSE),
  ('Développement Mobile (Flutter, React Native)', 'technical', FALSE),
  ('Data Science / Intelligence Artificielle', 'technical', FALSE),
  ('Machine Learning / Deep Learning', 'technical', FALSE),
  ('DevOps / Infrastructure Cloud', 'technical', FALSE),
  ('Cybersécurité', 'technical', FALSE),
  ('Architecture Logicielle', 'technical', FALSE),
  ('Base de données (SQL, PostgreSQL, MySQL)', 'technical', FALSE),
  ('Base de données (NoSQL, MongoDB)', 'technical', FALSE),
  ('Blockchain / Web3', 'technical', FALSE),
  ('IoT / Systèmes embarqués', 'technical', FALSE);

-- BUSINESS SKILLS
INSERT INTO skills (name, category, is_custom) VALUES
  ('Stratégie Business', 'business', FALSE),
  ('Marketing Digital', 'business', FALSE),
  ('Growth Hacking', 'business', FALSE),
  ('SEO / SEA / SEM', 'business', FALSE),
  ('Vente / Business Development', 'business', FALSE),
  ('Levée de fonds / Fundraising', 'business', FALSE),
  ('Finance / Comptabilité', 'business', FALSE),
  ('Analyse Financière / Business Plan', 'business', FALSE),
  ('E-commerce / Marketplace', 'business', FALSE),
  ('Relation Client / Customer Success', 'business', FALSE),
  ('Pricing / Monétisation', 'business', FALSE),
  ('Stratégie Commerciale', 'business', FALSE);

-- CREATIVE SKILLS
INSERT INTO skills (name, category, is_custom) VALUES
  ('Design UX / UI', 'creative', FALSE),
  ('Design Graphique', 'creative', FALSE),
  ('Branding / Identité Visuelle', 'creative', FALSE),
  ('Illustration / Animation', 'creative', FALSE),
  ('Copywriting / Rédaction', 'creative', FALSE),
  ('Content Marketing', 'creative', FALSE),
  ('Community Management', 'creative', FALSE),
  ('Vidéo / Montage', 'creative', FALSE),
  ('Photographie', 'creative', FALSE),
  ('Design Produit', 'creative', FALSE),
  ('Direction Artistique', 'creative', FALSE);

-- OPERATIONAL SKILLS
INSERT INTO skills (name, category, is_custom) VALUES
  ('Gestion de Projet (Agile, Scrum)', 'operational', FALSE),
  ('Product Management', 'operational', FALSE),
  ('Ressources Humaines / Recrutement', 'operational', FALSE),
  ('Juridique / Droit des Affaires', 'operational', FALSE),
  ('Propriété Intellectuelle', 'operational', FALSE),
  ('Administration / Secrétariat', 'operational', FALSE),
  ('Supply Chain / Logistique', 'operational', FALSE),
  ('Qualité / Process', 'operational', FALSE),
  ('Formation / Coaching', 'operational', FALSE),
  ('Change Management', 'operational', FALSE);

-- EXPERTISE MÉTIER
INSERT INTO skills (name, category, is_custom) VALUES
  ('Santé / Médical', 'expertise', FALSE),
  ('Éducation / Pédagogie', 'expertise', FALSE),
  ('Agriculture / Agroalimentaire', 'expertise', FALSE),
  ('Environnement / Transition écologique', 'expertise', FALSE),
  ('Tourisme / Hôtellerie', 'expertise', FALSE),
  ('Immobilier / Construction', 'expertise', FALSE),
  ('Transport / Mobilité', 'expertise', FALSE),
  ('Industrie / Manufacturing', 'expertise', FALSE),
  ('Retail / Commerce', 'expertise', FALSE),
  ('Finance / Assurance', 'expertise', FALSE),
  ('Énergie / Utilities', 'expertise', FALSE),
  ('Culture / Arts', 'expertise', FALSE),
  ('Sport / Bien-être', 'expertise', FALSE),
  ('Social / Associatif', 'expertise', FALSE);
