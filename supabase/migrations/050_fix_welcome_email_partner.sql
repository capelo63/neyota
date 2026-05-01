-- ============================================
-- Migration 050: Corriger welcome_email pour les partenaires
-- ============================================
-- 1. Corrige le sujet du welcome_email : "NEYOTA" → "Teriis"
-- 2. Exclut les comptes avec role = 'partner' de la file welcome_email
--    (ils reçoivent partner_application_received à la place)
-- ============================================

CREATE OR REPLACE FUNCTION check_and_send_welcome_emails()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile RECORD;
  v_sent_count INTEGER := 0;
BEGIN
  FOR v_profile IN
    SELECT p.id, p.first_name, p.role, p.created_at, au.email, au.email_confirmed_at
    FROM profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE
      p.created_at >= NOW() - INTERVAL '7 days'
      AND au.email_confirmed_at IS NOT NULL
      AND p.role != 'partner'                    -- exclure les comptes partenaires
      AND NOT EXISTS (
        SELECT 1 FROM email_queue
        WHERE user_id = p.id
        AND email_type = 'welcome_email'
        AND status IN ('sent', 'pending')
      )
  LOOP
    PERFORM queue_email(
      p_user_id        := v_profile.id,
      p_email_type     := 'welcome_email',
      p_subject        := 'Bienvenue sur Teriis ! 🎉',
      p_template_params := jsonb_build_object(
        'user_name',   COALESCE(v_profile.first_name, 'nouveau membre'),
        'user_role',   v_profile.role,
        'profile_id',  v_profile.id
      )
    );

    v_sent_count := v_sent_count + 1;
  END LOOP;

  RETURN v_sent_count;
END;
$$;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 050 : welcome_email corrigé (Teriis), partenaires exclus.';
END $$;
