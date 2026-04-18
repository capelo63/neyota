# Configuration des emails instantanés

## Problème actuel

Les emails (candidatures, invitations) sont mis en file d'attente (`email_queue`) et envoyés par un Cron Job. Si le Cron est configuré pour s'exécuter toutes les 5-10 minutes, l'email peut être reçu avec un délai.

## Solution : Cron Job fréquent (1 minute)

### Dans le Dashboard Supabase

**Database → Cron Jobs → Create a new cron job**

```sql
-- Nom : send-pending-emails-every-minute
-- Schedule : */1 * * * * (toutes les minutes)
-- Command :

SELECT
  net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
```

### Prérequis

1. **Extension `pg_cron`** : Activée par défaut sur Supabase
2. **Extension `pg_net`** : Dashboard → Database → Extensions → Activer `pg_net`
3. **Variables de configuration** :

```sql
-- À exécuter une seule fois dans le SQL Editor
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://YOUR_PROJECT_ID.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

⚠️ **Remplacer** :
- `YOUR_PROJECT_ID` par votre ID de projet Supabase
- `YOUR_SERVICE_ROLE_KEY` par votre clé service role (Settings → API)

---

## Alternative : Database Webhooks (recommandé)

Plus fiable que pg_cron pour un envoi instantané.

### Configuration

**Database → Webhooks → Create a new webhook**

- **Table** : `email_queue`
- **Events** : `INSERT`
- **Type** : `HTTP Request`
- **Method** : `POST`
- **URL** : `https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-emails`
- **HTTP Headers** :
  ```
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  Content-Type: application/json
  ```
- **Conditions** : `NEW.status = 'pending'`

Avec cette config, chaque insertion dans `email_queue` déclenche immédiatement `send-emails`.

---

## Vérification

Pour tester que les emails sont bien envoyés :

```sql
-- Voir les emails en attente
SELECT * FROM email_queue WHERE status = 'pending';

-- Voir les emails envoyés récemment
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;

-- Voir les emails en erreur
SELECT * FROM email_queue WHERE status = 'failed';
```

---

## Notes

- **Cron Job** : Plus simple mais peut avoir un délai (1-2 minutes max)
- **Webhook** : Instantané mais nécessite que `pg_net` fonctionne correctement
- Les deux solutions peuvent coexister (le Cron rattrape les emails manqués)
