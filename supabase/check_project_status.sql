-- Vérifier le status réel des projets
SELECT id, title, status, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 5;
