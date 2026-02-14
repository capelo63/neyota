# 📅 Configuration des Cron Jobs pour les Emails

Ce guide explique comment configurer les cron jobs pour les emails automatiques.

## 🎯 Cron Jobs à Créer

| Cron Job | Fréquence | Fonction | Description |
|----------|-----------|----------|-------------|
| `send-pending-emails` | */5 * * * * | Envoi emails en queue | ✅ **Déjà créé** |
| `send-incomplete-profile-reminders` | 0 9 * * * | Profil incomplet | Quotidien à 9h |
| `send-weekly-digest` | 0 8 * * 1 | Digest hebdomadaire | Lundi à 8h |

---

## ✅ 1. Cron Job : Envoi des Emails en Queue (DÉJÀ CRÉÉ)

**Statut** : ✅ Opérationnel

```sql
-- Déjà créé - Envoie les emails toutes les 5 minutes
SELECT cron.schedule(
  'send-pending-emails',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer VOTRE_CLE_ANON'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 📝 2. Cron Job : Email Profil Incomplet

**Fréquence** : Quotidien à 9h
**Fonction** : `send_incomplete_profile_reminders()`

### **Créer le Cron Job**

```sql
-- Cron job quotidien pour rappeler les profils incomplets
SELECT cron.schedule(
  'send-incomplete-profile-reminders',
  '0 9 * * *', -- Tous les jours à 9h00 UTC
  $$
  SELECT send_incomplete_profile_reminders();
  $$
);
```

### **Vérifier**

```sql
-- Vérifier que le cron job est créé
SELECT * FROM cron.job WHERE jobname = 'send-incomplete-profile-reminders';

-- Tester manuellement (sans attendre 9h)
SELECT send_incomplete_profile_reminders();
```

---

## 📬 3. Cron Job : Digest Hebdomadaire

**Fréquence** : Lundi à 8h
**Fonction** : `send_weekly_digest()`

### **Créer le Cron Job**

```sql
-- Cron job hebdomadaire pour le digest (lundi matin)
SELECT cron.schedule(
  'send-weekly-digest',
  '0 8 * * 1', -- Tous les lundis à 8h00 UTC
  $$
  SELECT send_weekly_digest();
  $$
);
```

### **Vérifier**

```sql
-- Vérifier que le cron job est créé
SELECT * FROM cron.job WHERE jobname = 'send-weekly-digest';

-- Tester manuellement
SELECT send_weekly_digest();
```

---

## 🔍 Monitoring des Cron Jobs

### **Lister tous les cron jobs**

```sql
SELECT
  jobid,
  jobname,
  schedule,
  active,
  created_at
FROM cron.job
ORDER BY jobid;
```

### **Voir l'historique d'exécution**

```sql
-- Historique du cron job profil incomplet
SELECT
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-incomplete-profile-reminders')
ORDER BY start_time DESC
LIMIT 10;

-- Historique du cron job digest hebdomadaire
SELECT
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-weekly-digest')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🧪 Tester les Fonctions

### **Tester l'email de profil incomplet**

```sql
-- Créer un profil test incomplet
INSERT INTO profiles (id, first_name, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  'talent',
  NOW() - INTERVAL '24 hours'
);

-- Tester la fonction
SELECT send_incomplete_profile_reminders();

-- Vérifier les emails créés
SELECT * FROM email_queue WHERE email_type = 'profile_incomplete' ORDER BY created_at DESC;
```

### **Tester le digest hebdomadaire**

```sql
-- Créer des préférences pour un utilisateur
INSERT INTO email_preferences (user_id, digest_frequency, emails_enabled)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'weekly',
  true
)
ON CONFLICT (user_id) DO UPDATE SET digest_frequency = 'weekly';

-- Créer quelques notifications pour l'utilisateur
-- (À adapter selon vos données)

-- Tester la fonction
SELECT send_weekly_digest();

-- Vérifier les emails créés
SELECT * FROM email_queue WHERE email_type = 'weekly_digest' ORDER BY created_at DESC;
```

---

## ⏰ Comprendre la Syntaxe Cron

Format : `minute heure jour_du_mois mois jour_de_la_semaine`

| Expression | Signification |
|------------|---------------|
| `*/5 * * * *` | Toutes les 5 minutes |
| `0 9 * * *` | Tous les jours à 9h00 |
| `0 8 * * 1` | Tous les lundis à 8h00 |
| `30 17 * * 5` | Tous les vendredis à 17h30 |
| `0 0 1 * *` | Le 1er de chaque mois à minuit |

**Note** : Les heures sont en UTC. Pour 9h en France (CET/CEST), utilisez 8h UTC en hiver ou 7h UTC en été.

---

## 🛠️ Gestion des Cron Jobs

### **Désactiver un cron job**

```sql
SELECT cron.unschedule('send-incomplete-profile-reminders');
```

### **Modifier un cron job**

```sql
-- 1. Supprimer l'ancien
SELECT cron.unschedule('send-weekly-digest');

-- 2. Recréer avec nouveau schedule
SELECT cron.schedule(
  'send-weekly-digest',
  '0 7 * * 1', -- Changé à 7h au lieu de 8h
  $$
  SELECT send_weekly_digest();
  $$
);
```

---

## 📊 Statistiques

### **Emails par type dans les dernières 24h**

```sql
SELECT
  email_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM email_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY email_type
ORDER BY total DESC;
```

---

## ✅ Checklist de Configuration

- [x] Migration 020 appliquée
- [x] Edge Function mise à jour avec nouveaux templates
- [ ] Cron job `send-incomplete-profile-reminders` créé
- [ ] Cron job `send-weekly-digest` créé
- [ ] Tests réalisés
- [ ] Monitoring configuré

---

## 🆘 Troubleshooting

### **Le cron job ne s'exécute pas**

1. Vérifier que le cron job existe : `SELECT * FROM cron.job;`
2. Vérifier que `active = true`
3. Vérifier l'historique : `SELECT * FROM cron.job_run_details;`

### **La fonction retourne 0 emails**

C'est normal si :
- Aucun profil incomplet depuis 24h
- Aucun utilisateur avec digest_frequency = 'weekly'
- Aucune activité cette semaine

### **Erreur dans les logs**

Vérifiez le message d'erreur dans `return_message` de `cron.job_run_details`.

---

**Une fois les cron jobs créés, votre système d'emails sera 100% automatique !** 🎉
