-- Add project category system (many-to-many relationship)

-- Create enum for project categories
CREATE TYPE project_category AS ENUM (
  'agriculture',          -- 🌾 Agriculture / Agroalimentaire
  'mobility',             -- 🚗 Mobilité / Transport
  'industry',             -- 🏭 Industrie / Manufacturing
  'tech',                 -- 💻 Tech / Digital
  'health',               -- 🏥 Santé / Bien-être
  'education',            -- 🎓 Éducation / Formation
  'real_estate',          -- 🏠 Immobilier / Construction
  'environment',          -- 🌍 Environnement / Écologie
  'culture',              -- 🎨 Culture / Créatif
  'services',             -- 💼 Services / Consulting
  'commerce',             -- 🛒 Commerce / Retail
  'hospitality',          -- 🍽️ Restauration / Hôtellerie
  'finance',              -- 💰 Finance / Fintech
  'energy',               -- ⚡ Énergie
  'entertainment',        -- 🎮 Divertissement / Loisirs
  'social'                -- 🤝 Social / Solidaire
);

-- Create junction table for project categories (many-to-many)
CREATE TABLE project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category project_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure no duplicates
  UNIQUE(project_id, category)
);

-- Create index for faster category filtering
CREATE INDEX idx_project_categories_category ON project_categories(category);
CREATE INDEX idx_project_categories_project_id ON project_categories(project_id);

-- Enable RLS
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_categories
CREATE POLICY "Anyone can view project categories"
  ON project_categories
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

CREATE POLICY "Project owners can manage their project categories"
  ON project_categories
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );
