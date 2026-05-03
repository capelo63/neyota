-- ============================================
-- Migration 058 : Enrichissement get_partner_analytics()
-- ============================================
-- Ajoute la colonne intervention_category_counts JSON :
-- pour chaque domaine déclaré par le partenaire, nombre de
-- projets actifs visibles dans son périmètre.
-- ============================================

CREATE OR REPLACE FUNCTION get_partner_analytics()
RETURNS TABLE (
  total_views                  BIGINT,
  unique_profiles_viewed       BIGINT,
  favorites_count              BIGINT,
  visible_profiles_count       BIGINT,
  views_by_day                 JSON,
  recent_views                 JSON,
  top_categories               JSON,
  intervention_category_counts JSON
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_uid               UUID  := auth.uid();
  v_org_type          TEXT;
  v_is_support        BOOLEAN;
  v_intervention_cats TEXT[];
BEGIN
  -- Vérifie que l'appelant est un partenaire validé, récupère ses domaines
  SELECT organization_type::TEXT,
         COALESCE(intervention_categories, '{}')
  INTO   v_org_type, v_intervention_cats
  FROM   partner_organizations
  WHERE  user_id      = v_uid
    AND  is_validated = true
    AND  (is_rejected IS NOT TRUE);

  IF v_org_type IS NULL THEN
    RETURN;
  END IF;

  v_is_support := v_org_type IN (
    'public_collectivity', 'public_support', 'consular_chamber',
    'nonprofit_network', 'incubator_accelerator', 'foundation'
  );

  RETURN QUERY
  SELECT
    -- 1. Nombre total de consultations
    (SELECT COUNT(*)
     FROM partner_profile_views
     WHERE partner_user_id = v_uid)::BIGINT,

    -- 2. Profils uniques consultés
    (SELECT COUNT(DISTINCT viewed_profile_id)
     FROM partner_profile_views
     WHERE partner_user_id = v_uid)::BIGINT,

    -- 3. Favoris
    (SELECT COUNT(*)
     FROM partner_favorites
     WHERE partner_user_id = v_uid)::BIGINT,

    -- 4. Profils visibles dans le périmètre
    (SELECT COUNT(*)
     FROM profiles p
     JOIN partner_visibility_settings pvs ON pvs.user_id = p.id
     WHERE p.role IN ('entrepreneur', 'talent')
       AND (
         (v_is_support      AND pvs.visible_to_support_partners    = true)
         OR (NOT v_is_support AND pvs.visible_to_commercial_partners = true)
       ))::BIGINT,

    -- 5. Consultations par jour sur les 30 derniers jours
    (SELECT json_agg(row_to_json(t))
     FROM (
       SELECT
         gs.d::DATE::TEXT AS day,
         COALESCE(v.cnt, 0) AS count
       FROM (
         SELECT d::DATE
         FROM generate_series(
           NOW()::DATE - INTERVAL '29 days',
           NOW()::DATE,
           '1 day'::INTERVAL
         ) AS gs(d)
       ) gs
       LEFT JOIN (
         SELECT viewed_at::DATE AS d, COUNT(*)::INT AS cnt
         FROM partner_profile_views
         WHERE partner_user_id = v_uid
           AND viewed_at >= NOW() - INTERVAL '30 days'
         GROUP BY 1
       ) v ON v.d = gs.d
       ORDER BY gs.d
     ) t),

    -- 6. 10 derniers profils uniques consultés (date la plus récente par profil)
    (SELECT json_agg(row_to_json(r))
     FROM (
       SELECT
         ppv.viewed_profile_id::TEXT AS profile_id,
         p.first_name,
         p.last_name,
         p.city,
         p.role::TEXT                AS role,
         p.avatar_url,
         ppv.last_viewed::TEXT       AS viewed_at
       FROM (
         SELECT viewed_profile_id, MAX(viewed_at) AS last_viewed
         FROM partner_profile_views
         WHERE partner_user_id = v_uid
         GROUP BY viewed_profile_id
       ) ppv
       JOIN profiles p ON p.id = ppv.viewed_profile_id
       ORDER BY ppv.last_viewed DESC
       LIMIT 10
     ) r),

    -- 7. Top 5 thématiques parmi les projets actifs visibles dans le périmètre
    (SELECT json_agg(row_to_json(c))
     FROM (
       SELECT
         pc.category::TEXT             AS category,
         COUNT(DISTINCT pr.id)::INT    AS count
       FROM project_categories pc
       JOIN projects pr  ON pr.id  = pc.project_id
       JOIN profiles  p  ON p.id   = pr.owner_id
       JOIN partner_visibility_settings pvs ON pvs.user_id = p.id
       WHERE pr.status = 'active'
         AND (
           (v_is_support      AND pvs.visible_to_support_partners    = true)
           OR (NOT v_is_support AND pvs.visible_to_commercial_partners = true)
         )
       GROUP BY pc.category
       ORDER BY COUNT(DISTINCT pr.id) DESC
       LIMIT 5
     ) c),

    -- 8. Projets actifs par domaine d'intervention déclaré par le partenaire
    (SELECT json_agg(row_to_json(ic))
     FROM (
       SELECT
         cat::TEXT AS category,
         COALESCE(
           (SELECT COUNT(DISTINCT pr.id)::INT
            FROM project_categories pc2
            JOIN projects pr ON pr.id  = pc2.project_id
            JOIN profiles  p ON p.id   = pr.owner_id
            JOIN partner_visibility_settings pvs ON pvs.user_id = p.id
            WHERE pr.status        = 'active'
              AND pc2.category::TEXT = cat
              AND (
                (v_is_support      AND pvs.visible_to_support_partners    = true)
                OR (NOT v_is_support AND pvs.visible_to_commercial_partners = true)
              )),
           0
         ) AS count
       FROM unnest(v_intervention_cats) AS cat
       ORDER BY count DESC, cat
     ) ic);
END;
$$;

GRANT EXECUTE ON FUNCTION get_partner_analytics() TO authenticated;

DO $$ BEGIN
  RAISE NOTICE '✓ Migration 058 : get_partner_analytics() enrichie avec intervention_category_counts.';
END $$;
