-- ============================================
-- MIGRATION 020: Email de Bienvenue, Profil Incomplet, et Digest Hebdomadaire
-- ============================================

-- ============================================
-- 1. EMAIL DE BIENVENUE
-- ============================================
-- Envoyé immédiatement après création du compte

CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur depuis auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Créer l'email de bienvenue
  PERFORM queue_email(
    NEW.id,
    'welcome_email',
    'Bienvenue sur NEYOTA ! 🎉',
    jsonb_build_object(
      'user_name', NEW.first_name,
      'user_role', NEW.role,
      'profile_id', NEW.id
    ),
    NULL, -- project_id
    NULL, -- application_id
    NULL, -- notification_id
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger : Envoyer email de bienvenue à la création du profil
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON profiles;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- ============================================
-- 2. CALCUL DE COMPLÉTION DU PROFIL
-- ============================================
-- Fonction pour calculer le pourcentage de complétion d'un profil

CREATE OR REPLACE FUNCTION calculate_profile_completion(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_data RECORD;
  skills_count INTEGER;
BEGIN
  -- Récupérer les données du profil
  SELECT * INTO profile_data
  FROM profiles
  WHERE id = p_profile_id;

  -- Champs de base (40 points total)
  IF profile_data.first_name IS NOT NULL AND profile_data.first_name != '' THEN
    completion_score := completion_score + 10;
  END IF;

  IF profile_data.last_name IS NOT NULL AND profile_data.last_name != '' THEN
    completion_score := completion_score + 10;
  END IF;

  IF profile_data.city IS NOT NULL AND profile_data.city != '' THEN
    completion_score := completion_score + 10;
  END IF;

  IF profile_data.bio IS NOT NULL AND profile_data.bio != '' THEN
    completion_score := completion_score + 10;
  END IF;

  -- Compétences (30 points)
  SELECT COUNT(*) INTO skills_count
  FROM user_skills
  WHERE user_id = p_profile_id;

  IF skills_count >= 1 THEN
    completion_score := completion_score + 10;
  END IF;

  IF skills_count >= 3 THEN
    completion_score := completion_score + 10;
  END IF;

  IF skills_count >= 5 THEN
    completion_score := completion_score + 10;
  END IF;

  -- Localisation (20 points)
  IF profile_data.latitude IS NOT NULL AND profile_data.longitude IS NOT NULL THEN
    completion_score := completion_score + 20;
  END IF;

  -- Distance max pour talents (10 points)
  IF profile_data.role = 'talent' AND profile_data.max_distance_km IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;

  RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. EMAIL PROFIL INCOMPLET
-- ============================================
-- Envoyé 24h après création si profil < 70% complété

CREATE OR REPLACE FUNCTION send_incomplete_profile_reminders()
RETURNS INTEGER AS $$
DECLARE
  profile_record RECORD;
  completion_percentage INTEGER;
  emails_sent INTEGER := 0;
  user_email TEXT;
BEGIN
  -- Trouver les profils créés il y a ~24h et incomplets
  FOR profile_record IN
    SELECT p.*
    FROM profiles p
    WHERE p.created_at >= NOW() - INTERVAL '25 hours'
      AND p.created_at <= NOW() - INTERVAL '23 hours'
      -- Éviter de renvoyer un email si déjà envoyé
      AND NOT EXISTS (
        SELECT 1 FROM email_queue
        WHERE user_id = p.id
          AND email_type = 'profile_incomplete'
          AND created_at > NOW() - INTERVAL '48 hours'
      )
  LOOP
    -- Calculer le taux de complétion
    completion_percentage := calculate_profile_completion(profile_record.id);

    -- Si profil < 70% complété
    IF completion_percentage < 70 THEN
      -- Récupérer l'email
      SELECT email INTO user_email
      FROM auth.users
      WHERE id = profile_record.id;

      -- Envoyer l'email de rappel
      PERFORM queue_email(
        profile_record.id,
        'profile_incomplete',
        'Complétez votre profil NEYOTA pour recevoir plus d''opportunités ! 📝',
        jsonb_build_object(
          'user_name', profile_record.first_name,
          'user_role', profile_record.role,
          'completion_percentage', completion_percentage,
          'profile_id', profile_record.id
        ),
        NULL,
        NULL,
        NULL,
        NOW()
      );

      emails_sent := emails_sent + 1;
    END IF;
  END LOOP;

  RETURN emails_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. DIGEST HEBDOMADAIRE
-- ============================================
-- Envoyé chaque lundi matin avec résumé de la semaine

CREATE OR REPLACE FUNCTION send_weekly_digest()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  emails_sent INTEGER := 0;
  user_email TEXT;
  recommendations_count INTEGER;
  applications_count INTEGER;
  invitations_count INTEGER;
  recommendations_list JSONB;
BEGIN
  -- Pour chaque utilisateur ayant activé le digest hebdomadaire
  FOR user_record IN
    SELECT p.*
    FROM profiles p
    JOIN email_preferences ep ON p.id = ep.user_id
    WHERE ep.emails_enabled = true
      AND ep.digest_frequency = 'weekly'
  LOOP
    -- Compter les recommandations de la semaine
    SELECT COUNT(*) INTO recommendations_count
    FROM notifications n
    WHERE n.user_id = user_record.id
      AND n.type = 'new_matching_project'
      AND n.created_at > NOW() - INTERVAL '7 days'
      AND n.read = false;

    -- Compter les candidatures reçues (pour entrepreneurs)
    IF user_record.role = 'entrepreneur' THEN
      SELECT COUNT(*) INTO applications_count
      FROM applications a
      JOIN projects pr ON a.project_id = pr.id
      WHERE pr.owner_id = user_record.id
        AND a.created_at > NOW() - INTERVAL '7 days'
        AND a.invited_by IS NULL; -- Candidatures (pas invitations)

      SELECT COUNT(*) INTO invitations_count
      FROM 0; -- Pas d'invitations pour entrepreneurs
    ELSE
      -- Pour talents : compter les invitations reçues
      SELECT COUNT(*) INTO invitations_count
      FROM applications a
      WHERE a.talent_id = user_record.id
        AND a.invited_by IS NOT NULL
        AND a.created_at > NOW() - INTERVAL '7 days';

      SELECT COUNT(*) INTO applications_count
      FROM 0; -- Pas de candidatures reçues pour talents
    END IF;

    -- Si aucune activité, ne pas envoyer le digest
    IF recommendations_count = 0 AND applications_count = 0 AND invitations_count = 0 THEN
      CONTINUE;
    END IF;

    -- Récupérer l'email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_record.id;

    -- Récupérer les détails des recommandations (top 5)
    SELECT jsonb_agg(
      jsonb_build_object(
        'project_id', related_project_id,
        'title', message,
        'created_at', created_at
      )
      ORDER BY created_at DESC
    ) INTO recommendations_list
    FROM (
      SELECT related_project_id, message, created_at
      FROM notifications
      WHERE user_id = user_record.id
        AND type = 'new_matching_project'
        AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 5
    ) sub;

    -- Envoyer le digest
    PERFORM queue_email(
      user_record.id,
      'weekly_digest',
      '📬 Votre résumé NEYOTA de la semaine',
      jsonb_build_object(
        'user_name', user_record.first_name,
        'user_role', user_record.role,
        'recommendations_count', recommendations_count,
        'applications_count', applications_count,
        'invitations_count', invitations_count,
        'recommendations_list', COALESCE(recommendations_list, '[]'::jsonb),
        'profile_id', user_record.id
      ),
      NULL,
      NULL,
      NULL,
      NOW()
    );

    emails_sent := emails_sent + 1;
  END LOOP;

  RETURN emails_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION send_welcome_email IS
  'Trigger qui envoie un email de bienvenue immédiatement après création du profil.';

COMMENT ON FUNCTION calculate_profile_completion IS
  'Calcule le pourcentage de complétion d''un profil (0-100%). Critères : nom, prénom, ville, bio, compétences, localisation.';

COMMENT ON FUNCTION send_incomplete_profile_reminders IS
  'Fonction appelée quotidiennement pour envoyer des rappels aux utilisateurs avec profil < 70% complété depuis 24h.';

COMMENT ON FUNCTION send_weekly_digest IS
  'Fonction appelée chaque lundi matin pour envoyer un résumé hebdomadaire aux utilisateurs ayant activé cette option.';
