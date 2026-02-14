# 📧 Edge Function: send-emails

Edge Function Supabase pour envoyer des emails via l'API Brevo.

## 🎯 Fonctionnalité

Cette fonction :
- ✅ Récupère les emails en attente dans `email_queue`
- ✅ Envoie jusqu'à 50 emails par exécution
- ✅ Utilise des templates HTML intégrés
- ✅ Met à jour le statut des emails envoyés
- ✅ Gère les erreurs avec retry automatique (max 3 tentatives)

## 🔧 Configuration

### 1. Obtenir la clé API Brevo

1. Connectez-vous sur [Brevo](https://app.brevo.com)
2. Allez dans **Settings** > **API Keys**
3. Créez une nouvelle clé API (ou utilisez celle existante)
4. Copiez la clé (format: `xkeysib-...`)

### 2. Configurer le domaine d'envoi

1. Dans Brevo, allez dans **Senders & IP**
2. Ajoutez votre domaine d'envoi : `notifications@neyota.fr`
3. Vérifiez le domaine (configuration DNS SPF/DKIM)

Si vous n'avez pas de domaine personnalisé, vous pouvez utiliser une adresse email vérifiée temporairement.

### 3. Déployer l'Edge Function

```bash
# Installer Supabase CLI (si ce n'est pas déjà fait)
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login
supabase link --project-ref rnzezkzsbdvaizpuukec

# Configurer la clé API Brevo
supabase secrets set BREVO_API_KEY=xkeysib-votre-cle-api

# Déployer la fonction
supabase functions deploy send-emails
```

### 4. Configurer le Cron Job (optionnel)

Pour envoyer les emails automatiquement toutes les 5 minutes :

```sql
-- Via le SQL Editor de Supabase
SELECT cron.schedule(
  'send-pending-emails',
  '*/5 * * * *', -- Toutes les 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 5. Test Manuel

Vous pouvez tester l'envoi d'emails manuellement :

```bash
# Via curl
curl -X POST https://rnzezkzsbdvaizpuukec.supabase.co/functions/v1/send-emails \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Ou via le Dashboard Supabase :
1. **Edge Functions** > **send-emails**
2. Cliquez sur **Invoke**

## 📨 Types d'emails supportés

| Type | Déclencheur | Destinataire |
|------|-------------|--------------|
| `application_received` | Candidature reçue | Entrepreneur |
| `invitation_received` | Invitation reçue | Talent |
| `application_accepted` | Candidature acceptée | Talent |
| `application_rejected` | Candidature refusée | Talent |

## 🔍 Monitoring

### Vérifier les emails envoyés

```sql
-- Emails envoyés aujourd'hui
SELECT COUNT(*), email_type
FROM email_queue
WHERE status = 'sent'
  AND sent_at > NOW() - INTERVAL '24 hours'
GROUP BY email_type;

-- Emails en échec
SELECT *
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Dashboard Brevo

1. Allez sur [Brevo Dashboard](https://app.brevo.com)
2. **Statistics** > **Email** pour voir :
   - Taux d'ouverture
   - Taux de clic
   - Bounces
   - Désabonnements

## 🛠️ Développement Local

Pour tester localement :

```bash
# Démarrer Supabase localement
supabase start

# Servir les fonctions localement
supabase functions serve send-emails --env-file .env.local

# Créer .env.local avec :
BREVO_API_KEY=xkeysib-votre-cle-api
```

## 📝 Templates d'emails

Les templates HTML sont définis dans `index.ts` dans l'objet `EMAIL_TEMPLATES`.

Pour modifier un template :
1. Éditez le template dans `EMAIL_TEMPLATES`
2. Redéployez la fonction : `supabase functions deploy send-emails`

## ⚠️ Limites

- **Brevo gratuit** : 300 emails/jour (9 000/mois)
- **Edge Function** : 50 emails par exécution (limite volontaire)
- **Retry** : Max 3 tentatives par email

## 🔐 Sécurité

- ✅ La clé API Brevo est stockée dans les secrets Supabase
- ✅ Seul le service role peut appeler cette fonction
- ✅ RLS protège la table email_queue
- ✅ Les utilisateurs peuvent gérer leurs préférences

## 🆘 Troubleshooting

### Les emails ne sont pas envoyés

1. Vérifiez les logs de l'Edge Function
2. Vérifiez que `BREVO_API_KEY` est configuré
3. Vérifiez la table `email_queue` pour le statut

### Emails marqués comme spam

1. Configurez SPF/DKIM dans Brevo
2. Ajoutez un lien de désabonnement
3. Évitez les mots spam dans les sujets
