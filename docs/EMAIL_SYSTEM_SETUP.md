# 📧 Guide de Mise en Place du Système d'Emails avec Brevo

Ce guide vous accompagne étape par étape pour configurer le système de notifications par email avec Brevo.

## 🎯 Vue d'ensemble

Le système d'emails NEYOTA permet d'envoyer :
- ✅ **Emails instantanés** pour les actions critiques (candidatures, invitations, acceptations/refus)
- ✅ **Résumés périodiques** (quotidiens ou hebdomadaires) pour les recommandations
- ✅ **Préférences utilisateur** complètes avec opt-out facile

## 📋 Prérequis

- [x] Compte Brevo créé (déjà fait ✓)
- [ ] Clé API Brevo
- [ ] Supabase CLI installé
- [ ] Migration 019 appliquée

---

## 🚀 Étape 1 : Configuration de Brevo

### 1.1 Obtenir la clé API Brevo

1. Connectez-vous sur [app.brevo.com](https://app.brevo.com)
2. Allez dans **Settings** (roue crantée en haut à droite)
3. Cliquez sur **SMTP & API** dans le menu de gauche
4. Onglet **API Keys**
5. Cliquez sur **Create a new API key**
   - Nom : `NEYOTA Production`
   - Permissions : Cochez `Send Emails`
6. Copiez la clé (format : `xkeysib-xxxxx...`)

⚠️ **Conservez cette clé en sécurité !** Elle ne sera affichée qu'une seule fois.

### 1.2 Configurer l'adresse d'expéditeur

#### Option A : Avec domaine personnalisé (recommandé)

1. Dans Brevo, allez dans **Senders & IP**
2. Cliquez sur **Add a sender**
3. Remplissez :
   - Email : `notifications@teriis.fr`
   - Nom : `NEYOTA`
4. Vérifiez votre domaine :
   - Ajoutez les enregistrements DNS (SPF, DKIM, DMARC)
   - Attendez la validation (peut prendre 24-48h)

#### Option B : Avec email personnel (temporaire)

1. Utilisez votre email personnel vérifié
2. Modifiez `supabase/functions/send-emails/index.ts` ligne 365 :
   ```typescript
   sender: {
     name: 'NEYOTA',
     email: 'votre-email@gmail.com', // Changez ici
   },
   ```

---

## 🔧 Étape 2 : Appliquer la Migration 019

### 2.1 Via le Dashboard Supabase

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `neyota`
3. Cliquez sur **SQL Editor** dans le menu
4. Cliquez sur **New query**
5. Copiez le contenu de `supabase/migrations/019_email_notification_system.sql`
6. Collez et cliquez sur **Run**

### 2.2 Vérifier que la migration a réussi

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('email_preferences', 'email_queue');

-- Devrait retourner 2 lignes
```

---

## 🚀 Étape 3 : Déployer l'Edge Function

### 3.1 Installer Supabase CLI (si nécessaire)

```bash
# Sur macOS
brew install supabase/tap/supabase

# Sur Windows
scoop install supabase

# Ou via npm
npm install -g supabase
```

### 3.2 Se connecter et lier le projet

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref rnzezkzsbdvaizpuukec
```

### 3.3 Configurer les secrets

```bash
# Configurer la clé API Brevo
supabase secrets set BREVO_API_KEY=xkeysib-votre-cle-api-brevo

# Vérifier que le secret est configuré
supabase secrets list
```

### 3.4 Déployer la fonction

```bash
# Déployer l'Edge Function
supabase functions deploy send-emails

# La fonction sera disponible à :
# https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails
```

---

## ⏰ Étape 4 : Configurer l'Envoi Automatique

### 4.1 Créer un Cron Job (recommandé)

Via le **SQL Editor** de Supabase :

```sql
-- Installer l'extension pg_cron si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le job pour envoyer les emails toutes les 5 minutes
SELECT cron.schedule(
  'send-pending-emails-every-5min',
  '*/5 * * * *', -- Toutes les 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### 4.2 Vérifier que le Cron Job fonctionne

```sql
-- Lister les jobs cron
SELECT * FROM cron.job;

-- Vérifier l'historique d'exécution
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-pending-emails-every-5min')
ORDER BY start_time DESC
LIMIT 10;
```

---

## ✅ Étape 5 : Tester le Système

### 5.1 Test manuel de l'Edge Function

Via curl :

```bash
curl -X POST https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Ou via le Dashboard Supabase :
1. **Edge Functions** > **send-emails**
2. Cliquez sur **Invoke function**

### 5.2 Test de bout en bout

1. **Créer un compte talent** sur NEYOTA
2. **Créer un compte entrepreneur**
3. **Créer un projet** avec l'entrepreneur
4. **Postuler au projet** avec le talent
5. **Vérifier** :
   - Notification in-app créée
   - Email ajouté à la queue :
     ```sql
     SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;
     ```
   - Email envoyé après 5 min (ou après invocation manuelle)
   - Email reçu dans la boîte mail de l'entrepreneur

### 5.3 Vérifier les préférences par défaut

```sql
-- Voir les préférences email d'un utilisateur
SELECT * FROM email_preferences
WHERE user_id = 'UUID_DU_USER';

-- Si aucune ligne, les préférences par défaut seront créées automatiquement
```

---

## 📊 Étape 6 : Monitoring et Maintenance

### 6.1 Surveiller les emails envoyés

```sql
-- Emails envoyés dans les dernières 24h
SELECT
  email_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM email_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY email_type;
```

### 6.2 Dashboard Brevo

1. Allez sur [app.brevo.com](https://app.brevo.com)
2. **Statistics** > **Email**
3. Consultez :
   - Emails envoyés
   - Taux d'ouverture
   - Taux de clic
   - Bounces / Spam complaints

### 6.3 Gérer les emails en échec

```sql
-- Voir les emails en échec
SELECT
  id,
  recipient_email,
  email_type,
  error_message,
  retry_count,
  created_at
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Réessayer un email spécifique
UPDATE email_queue
SET status = 'pending', retry_count = 0
WHERE id = 'UUID_DE_L_EMAIL';
```

---

## 🎨 Étape 7 : Personnalisation (Optionnel)

### 7.1 Modifier les templates d'emails

Les templates sont dans `supabase/functions/send-emails/index.ts` :

```typescript
const EMAIL_TEMPLATES = {
  application_received: (params: any) => ({
    subject: `...`, // Modifier le sujet
    htmlContent: `...`, // Modifier le HTML
  }),
  // ...
};
```

Après modification :
```bash
supabase functions deploy send-emails
```

### 7.2 Ajouter un nouveau type d'email

1. Modifier la migration 019 pour ajouter le type dans les enums
2. Ajouter le template dans `EMAIL_TEMPLATES`
3. Créer un trigger ou appeler `queue_email()` manuellement

---

## 📈 Limites et Quotas

| Service | Limite Gratuite | Action si dépassée |
|---------|----------------|-------------------|
| Brevo | 300 emails/jour (9 000/mois) | Passer au plan payant ou limiter les envois |
| Edge Functions | 500K invocations/mois | Très peu probable d'atteindre |
| Supabase Storage | Illimité pour les données | - |

---

## ❓ FAQ et Troubleshooting

### Les emails ne sont pas envoyés

1. **Vérifier les logs de l'Edge Function** :
   - Dashboard Supabase > Edge Functions > send-emails > Logs
2. **Vérifier la table email_queue** :
   ```sql
   SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10;
   ```
3. **Vérifier la clé API Brevo** :
   ```bash
   supabase secrets list
   ```

### Les emails arrivent dans les spams

1. Configurer **SPF, DKIM, DMARC** dans Brevo
2. Réchauffer votre IP (envoyer progressivement)
3. Demander aux utilisateurs d'ajouter `notifications@teriis.fr` à leurs contacts

### Erreur "BREVO_API_KEY not configured"

```bash
# Reconfigurer la clé
supabase secrets set BREVO_API_KEY=xkeysib-votre-cle

# Redéployer
supabase functions deploy send-emails
```

### Trop d'emails en queue

```sql
-- Voir le nombre d'emails en attente
SELECT COUNT(*) FROM email_queue WHERE status = 'pending';

-- Augmenter la fréquence du cron job (de 5 min à 2 min)
SELECT cron.schedule(
  'send-pending-emails-every-2min',
  '*/2 * * * *', -- Toutes les 2 minutes
  -- ... (même SQL)
);
```

---

## 📞 Support

- **Documentation Brevo** : [help.brevo.com](https://help.brevo.com)
- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Github NEYOTA** : [github.com/capelo63/neyota](https://github.com/capelo63/neyota)

---

## ✅ Checklist de Mise en Production

- [ ] Clé API Brevo configurée dans les secrets Supabase
- [ ] Domaine d'envoi vérifié (SPF, DKIM)
- [ ] Migration 019 appliquée avec succès
- [ ] Edge Function déployée
- [ ] Cron Job configuré (5 min)
- [ ] Test de bout en bout réussi
- [ ] Monitoring configuré (dashboard Brevo)
- [ ] Page de préférences accessible aux utilisateurs
- [ ] Lien de désabonnement fonctionnel

---

🎉 **Félicitations !** Votre système d'emails est maintenant opérationnel !
