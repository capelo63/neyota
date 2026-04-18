-- ============================================
-- MIGRATION 037: Mise à jour des libellés des besoins
-- ============================================
-- Met à jour les noms des besoins dans la table needs
-- pour correspondre aux nouveaux libellés validés

-- Lancer le projet
UPDATE needs SET name = 'Formaliser mon offre'            WHERE category = 'launching'       AND name = 'Structurer mon offre';

-- Trouver des clients
UPDATE needs SET name = 'Gagner en visibilité'            WHERE category = 'finding_clients' AND name = 'Améliorer ma visibilité';
UPDATE needs SET name = 'Déployer ma communication'       WHERE category = 'finding_clients' AND name = 'Développer ma communication';

-- Branding
UPDATE needs SET name = 'Renforcer mon image de marque'   WHERE category = 'branding'        AND name = 'Améliorer mon image de marque';

-- Outils digitaux
UPDATE needs SET name = 'Concevoir une application'       WHERE category = 'digital_tools'   AND name = 'Développer une application';

-- Cadre légal
UPDATE needs SET name = 'Protéger mon projet (marque, propriété intellectuelle)'
                                                          WHERE category = 'legal'           AND name = 'Protéger mon projet';

-- Organisation
UPDATE needs SET name = 'Organiser mon fonctionnement'    WHERE category = 'organization'    AND name = 'Structurer mon organisation';

-- Croissance
UPDATE needs SET name = 'Structurer ma croissance'        WHERE category = 'growth'          AND name = 'Structurer mon développement';

-- Impact
UPDATE needs SET name = 'Clarifier mon impact social / environnemental'
                                                          WHERE category = 'impact'          AND name = 'Clarifier mon impact';

DO $$
DECLARE updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✓ Migration 037 complète';
END $$;
