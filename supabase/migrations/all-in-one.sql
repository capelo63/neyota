-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation

-- ============================================
-- ENUMS
-- ============================================

-- User role
CREATE TYPE user_role AS ENUM ('entrepreneur', 'talent');

-- Project phase
CREATE TYPE project_phase AS ENUM (
  'ideation',           -- Idée / Concept
  'mvp_development',    -- Développement MVP
  'launch',             -- Lancement
  'growth',             -- Croissance
  'scaling'             -- Structuration
);

-- Application status
CREATE TYPE application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'more_info'
);

-- Skill category
CREATE TYPE skill_category AS ENUM (
  'technical',          -- Technique
  'business',           -- Business
  'creative',           -- Créatif
  'operational',        -- Opérationnel
  'expertise'           -- Expertise métier
);

-- Proficiency level
CREATE TYPE proficiency_level AS ENUM (
  'beginner',           -- Débutant
  'intermediate',       -- Intermédiaire
  'expert'              -- Expert
);

-- Skill priority
CREATE TYPE skill_priority AS ENUM (
  'essential',          -- Essentielle
  'nice_to_have'        -- Souhaitée
);

-- Report reason
CREATE TYPE report_reason AS ENUM (
  'idea_theft',         -- Vol d'idée
  'spam',
  'harassment',
  'inappropriate',
  'other'
);

-- Badge type
CREATE TYPE badge_type AS ENUM (
  'local_ambassador',   -- Ambassadeur Local
  'territory_builder',  -- Bâtisseur Territorial
  'territory_pillar',   -- Pilier du Territoire
  'citizen_mentor',     -- Mentor Citoyen
  'recognized_expert',  -- Expert Reconnu
  'local_legend'        -- Légende Locale
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,

  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,

  -- Location (territorial dimension)
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  country TEXT DEFAULT 'France',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(Point, 4326), -- PostGIS point for spatial queries
  max_distance_km INTEGER DEFAULT 50, -- Preferred search radius

  -- Charter acceptance (ethical dimension)
  charter_accepted_at TIMESTAMP WITH TIME ZONE,
  charter_version TEXT,
  charter_ip_address INET,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills taxonomy
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category skill_category NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id), -- If custom skill

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills (for talents)
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level proficiency_level NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, skill_id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Project info
  title TEXT NOT NULL,
  short_pitch TEXT NOT NULL, -- Public (visible in list)
  full_description TEXT,     -- Private (visible after application accepted)

  -- Project phase
  current_phase project_phase NOT NULL,
  phase_objectives TEXT,
  phase_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Location
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(Point, 4326),
  is_remote_possible BOOLEAN DEFAULT FALSE,
  preferred_radius_km INTEGER DEFAULT 30,

  -- Status
  status TEXT DEFAULT 'active', -- active, closed, archived
  views_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project skills needed
CREATE TABLE project_skills_needed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  priority skill_priority NOT NULL DEFAULT 'essential',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id, skill_id)
);

-- Applications (candidatures - Phase 1: no real-time chat)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Application content
  motivation_message TEXT NOT NULL,
  status application_status DEFAULT 'pending',

  -- Entrepreneur response
  entrepreneur_response TEXT,

  -- Privacy control (progressive disclosure)
  full_details_unlocked BOOLEAN DEFAULT FALSE,
  contact_shared_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id, talent_id) -- One application per talent per project
);

-- ============================================
-- ETHICAL & MODERATION TABLES
-- ============================================

-- Charter acceptances log
CREATE TABLE user_charter_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charter_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET NOT NULL,

  UNIQUE(user_id, charter_version)
);

-- Reports (signalements)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  reason report_reason NOT NULL,
  description TEXT NOT NULL,

  -- Moderation
  status TEXT DEFAULT 'pending', -- pending, reviewed, action_taken, dismissed
  moderator_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project views log (for watermarking & traceability)
CREATE TABLE project_views_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Analytics
  user_agent TEXT,
  ip_address INET
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, badge_type)
);

-- User impact stats (for gamification)
CREATE TABLE user_impact_stats (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- For talents
  projects_helped INTEGER DEFAULT 0,
  hours_contributed INTEGER DEFAULT 0,
  impact_score INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,

  -- For entrepreneurs
  projects_created INTEGER DEFAULT 0,
  talents_recruited INTEGER DEFAULT 0,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_postal_code ON profiles(postal_code);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location); -- Spatial index

-- Projects
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects(current_phase);
CREATE INDEX idx_projects_location ON projects USING GIST(location); -- Spatial index
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Applications
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_talent ON applications(talent_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Skills
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_project_skills_project ON project_skills_needed(project_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS INTEGER AS $$
BEGIN
  RETURN ROUND(
    ST_Distance(
      ST_MakePoint(lon1, lat1)::geography,
      ST_MakePoint(lon2, lat2)::geography
    ) / 1000
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update location point from lat/long
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic location point update
CREATE TRIGGER update_profiles_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

CREATE TRIGGER update_projects_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_location_point();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills_needed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impact_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects: Everyone can view active projects
CREATE POLICY "Active projects are viewable by everyone"
  ON projects FOR SELECT
  USING (status = 'active');

CREATE POLICY "Entrepreneurs can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Applications: Talents and project owners can view their applications
CREATE POLICY "Users can view applications they're involved in"
  ON applications FOR SELECT
  USING (
    auth.uid() = talent_id OR
    auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id)
  );

CREATE POLICY "Talents can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = talent_id);

CREATE POLICY "Project owners can update application status"
  ON applications FOR UPDATE
  USING (auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id));

-- Skills: Everyone can read, authenticated users can insert custom skills
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create custom skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- User skills: Users can manage their own skills
CREATE POLICY "Users can view their own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Project skills: Project owners manage their project skills
CREATE POLICY "Everyone can view project skills"
  ON project_skills_needed FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage project skills"
  ON project_skills_needed FOR ALL
  USING (auth.uid() IN (SELECT owner_id FROM projects WHERE id = project_id));

-- User badges: Public view, system-managed
CREATE POLICY "Badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- User impact stats: Public view
CREATE POLICY "Impact stats are viewable by everyone"
  ON user_impact_stats FOR SELECT
  USING (true);

-- Reports: Users can create reports, only view their own
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
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
