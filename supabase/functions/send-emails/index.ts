// Edge Function to send emails via Brevo API
// This function polls the email_queue table and sends pending emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Email templates for different notification types
const EMAIL_TEMPLATES = {
  application_received: (params: any) => ({
    subject: `📨 Nouvelle candidature sur votre projet "${params.project_title}"`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📨 Nouvelle candidature !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.entrepreneur_name}</strong>,</p>
              <p><strong>${params.talent_name}</strong> vient de postuler à votre projet :</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #667eea;">${params.project_title}</h3>
              </div>
              <p>Consultez son profil et sa lettre de motivation pour décider de la suite à donner à cette candidature.</p>
              <div style="text-align: center;">
                <a href="https://neyota.fr/projects/${params.project_id}/applications" class="button">
                  Voir la candidature
                </a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                💡 <strong>Conseil :</strong> Répondez rapidement aux candidatures pour maintenir l'engagement des talents !
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #667eea; text-decoration: none;">Gérer mes préférences</a> •
                <a href="https://neyota.fr/unsubscribe" style="color: #667eea; text-decoration: none;">Se désabonner</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  invitation_received: (params: any) => ({
    subject: `🎯 ${params.entrepreneur_name} vous invite à rejoindre un projet !`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎯 Vous avez une invitation !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.talent_name}</strong>,</p>
              <p>Bonne nouvelle ! <strong>${params.entrepreneur_name}</strong> a identifié votre profil et souhaite vous inviter à rejoindre son projet :</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #f59e0b;">${params.project_title}</h3>
              </div>
              <p>Votre profil a retenu l'attention de cet entrepreneur. C'est le moment de découvrir son projet et de décider si vous souhaitez le rejoindre !</p>
              <div style="text-align: center;">
                <a href="https://neyota.fr/dashboard/invitations" class="button">
                  Voir l'invitation
                </a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                ✨ <strong>Félicitations :</strong> Cette invitation montre que votre profil correspond aux besoins de ce projet.
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #f59e0b; text-decoration: none;">Gérer mes préférences</a> •
                <a href="https://neyota.fr/unsubscribe" style="color: #f59e0b; text-decoration: none;">Se désabonner</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  application_accepted: (params: any) => ({
    subject: `✅ Votre candidature a été acceptée pour "${params.project_title}" !`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Candidature acceptée !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.talent_name}</strong>,</p>
              <p>Excellente nouvelle ! Votre candidature a été <strong style="color: #10b981;">acceptée</strong> pour le projet :</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #10b981;">${params.project_title}</h3>
              </div>
              <p>Félicitations ! L'entrepreneur souhaite travailler avec vous. Vous pouvez maintenant échanger avec lui pour discuter des prochaines étapes.</p>
              <div style="text-align: center;">
                <a href="https://neyota.fr/projects/${params.project_id}" class="button">
                  Accéder au projet
                </a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                🚀 <strong>Prochaine étape :</strong> Prenez contact avec l'entrepreneur pour démarrer la collaboration !
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #10b981; text-decoration: none;">Gérer mes préférences</a> •
                <a href="https://neyota.fr/unsubscribe" style="color: #10b981; text-decoration: none;">Se désabonner</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  application_rejected: (params: any) => ({
    subject: `Mise à jour sur votre candidature pour "${params.project_title}"`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Mise à jour de candidature</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.talent_name}</strong>,</p>
              <p>Nous vous informons que votre candidature pour le projet "${params.project_title}" n'a pas été retenue cette fois-ci.</p>
              <p>Cela ne reflète pas la qualité de votre profil. Chaque entrepreneur a des besoins spécifiques pour son projet.</p>
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0;"><strong>💡 Nos conseils :</strong></p>
                <ul style="margin: 10px 0;">
                  <li>Consultez les autres projets disponibles</li>
                  <li>Complétez votre profil avec vos réalisations</li>
                  <li>Ajoutez plus de compétences à votre profil</li>
                </ul>
              </div>
              <div style="text-align: center;">
                <a href="https://neyota.fr/projects" class="button">
                  Découvrir d'autres projets
                </a>
              </div>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #667eea; text-decoration: none;">Gérer mes préférences</a> •
                <a href="https://neyota.fr/unsubscribe" style="color: #667eea; text-decoration: none;">Se désabonner</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcome_email: (params: any) => ({
    subject: `Bienvenue sur NEYOTA ! 🎉`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            .step { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Bienvenue sur NEYOTA !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.user_name}</strong>,</p>
              <p>Nous sommes ravis de vous accueillir sur <strong>NEYOTA</strong>, la plateforme qui connecte les talents aux projets locaux !</p>

              <h3 style="color: #10b981; margin-top: 30px;">🚀 Pour bien démarrer :</h3>

              ${params.user_role === 'entrepreneur' ? `
                <div class="step">
                  <strong>1️⃣ Complétez votre profil</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Ajoutez votre bio et vos coordonnées pour inspirer confiance.</p>
                </div>
                <div class="step">
                  <strong>2️⃣ Créez votre premier projet</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Décrivez votre projet, les compétences recherchées et votre localisation.</p>
                </div>
                <div class="step">
                  <strong>3️⃣ Recevez des candidatures</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Les talents locaux correspondant à vos besoins seront notifiés !</p>
                </div>
              ` : `
                <div class="step">
                  <strong>1️⃣ Complétez votre profil</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Ajoutez vos compétences, votre bio et votre zone de recherche.</p>
                </div>
                <div class="step">
                  <strong>2️⃣ Explorez les projets</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Découvrez les projets locaux qui correspondent à vos compétences.</p>
                </div>
                <div class="step">
                  <strong>3️⃣ Postulez et soyez recruté</strong>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">Postulez en un clic et recevez des invitations directes !</p>
                </div>
              `}

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://neyota.fr/dashboard" class="button">
                  Accéder à mon tableau de bord
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                💚 <strong>Notre mission :</strong> Faire vivre les territoires en connectant talents locaux et porteurs de projets. 100% gratuit, 100% territorial, 100% impact.
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Ensemble, faisons vivre nos territoires</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #10b981; text-decoration: none;">Gérer mes préférences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  profile_incomplete: (params: any) => ({
    subject: `Complétez votre profil NEYOTA pour recevoir plus d'opportunités ! 📝`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            .progress-bar { background: #e5e7eb; border-radius: 10px; height: 20px; margin: 20px 0; overflow: hidden; }
            .progress-fill { background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); height: 100%; transition: width 0.3s; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📝 Votre profil n'est pas complet</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.user_name}</strong>,</p>
              <p>Votre profil NEYOTA est complété à <strong>${params.completion_percentage}%</strong>.</p>

              <div class="progress-bar">
                <div class="progress-fill" style="width: ${params.completion_percentage}%;"></div>
              </div>

              <p>Un profil complet vous permet de :</p>
              <ul style="margin: 20px 0; padding-left: 20px;">
                <li><strong>Recevoir plus de recommandations</strong> personnalisées</li>
                <li><strong>Inspirer confiance</strong> aux entrepreneurs ou talents</li>
                <li><strong>Améliorer votre visibilité</strong> dans les résultats de recherche</li>
                ${params.user_role === 'talent' ? '<li><strong>Recevoir des invitations</strong> directes sur des projets</li>' : '<li><strong>Attirer les meilleurs talents</strong> locaux</li>'}
              </ul>

              <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>💡 Conseils pour compléter votre profil :</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  ${params.user_role === 'talent' ? `
                    <li>Ajoutez au moins 3 compétences</li>
                    <li>Rédigez une bio attrayante (100-200 mots)</li>
                    <li>Précisez votre zone de recherche</li>
                  ` : `
                    <li>Rédigez une bio inspirante</li>
                    <li>Ajoutez votre localisation</li>
                    <li>Créez votre premier projet</li>
                  `}
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="https://neyota.fr/profile/${params.profile_id}/edit" class="button">
                  Compléter mon profil
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                ⏱️ Cela ne prend que <strong>5 minutes</strong> et augmente considérablement vos chances de succès !
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #f59e0b; text-decoration: none;">Gérer mes préférences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  weekly_digest: (params: any) => ({
    subject: `📬 Votre résumé NEYOTA de la semaine`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            .stat-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
            .recommendation-item { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📬 Votre semaine sur NEYOTA</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${params.user_name}</strong>,</p>
              <p>Voici un résumé de votre activité sur NEYOTA cette semaine :</p>

              ${params.recommendations_count > 0 ? `
                <div class="stat-box">
                  <h3 style="margin: 0 0 10px 0; color: #3b82f6;">🎯 ${params.recommendations_count} ${params.recommendations_count === 1 ? 'nouveau projet' : 'nouveaux projets'} pour vous</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Des projets qui correspondent à votre profil et votre localisation</p>
                </div>
              ` : ''}

              ${params.applications_count > 0 ? `
                <div class="stat-box">
                  <h3 style="margin: 0 0 10px 0; color: #3b82f6;">📨 ${params.applications_count} ${params.applications_count === 1 ? 'nouvelle candidature' : 'nouvelles candidatures'}</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Des talents ont postulé à vos projets</p>
                </div>
              ` : ''}

              ${params.invitations_count > 0 ? `
                <div class="stat-box">
                  <h3 style="margin: 0 0 10px 0; color: #3b82f6;">🎯 ${params.invitations_count} ${params.invitations_count === 1 ? 'invitation' : 'invitations'} reçue${params.invitations_count === 1 ? '' : 's'}</h3>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Des entrepreneurs ont identifié votre profil</p>
                </div>
              ` : ''}

              ${params.recommendations_count === 0 && params.applications_count === 0 && params.invitations_count === 0 ? `
                <div class="stat-box">
                  <h3 style="margin: 0 0 10px 0; color: #6b7280;">📭 Pas d'activité cette semaine</h3>
                  <p style="margin: 0; font-size: 14px;">
                    ${params.user_role === 'talent' ? 'Explorez les projets disponibles ou complétez votre profil pour recevoir plus de recommandations.' : 'Créez un nouveau projet ou invitez des talents à rejoindre vos projets existants.'}
                  </p>
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://neyota.fr/dashboard" class="button">
                  Voir mon tableau de bord
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                📊 <strong>Le saviez-vous ?</strong> Les utilisateurs actifs trouvent en moyenne 3 fois plus d'opportunités !
              </p>
            </div>
            <div class="footer">
              <p>NEYOTA - Connecter les talents aux projets locaux</p>
              <p>
                <a href="https://neyota.fr/settings/email-preferences" style="color: #3b82f6; text-decoration: none;">Gérer mes préférences</a> •
                <a href="https://neyota.fr/settings/email-preferences" style="color: #3b82f6; text-decoration: none;">Changer la fréquence</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

interface EmailQueueItem {
  id: string;
  user_id: string;
  recipient_email: string;
  recipient_name: string;
  email_type: string;
  subject: string;
  template_params: any;
  html_content: string | null;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured');
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pending emails from queue (limit to 50 per execution)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('retry_count', 3) // Don't retry more than 3 times
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingEmails.length} pending emails...`);

    let sentCount = 0;
    let failedCount = 0;

    // Process each email
    for (const email of pendingEmails as EmailQueueItem[]) {
      try {
        // Get email template
        const templateFn = EMAIL_TEMPLATES[email.email_type as keyof typeof EMAIL_TEMPLATES];

        let emailContent;
        if (templateFn) {
          emailContent = templateFn(email.template_params);
        } else if (email.html_content) {
          emailContent = {
            subject: email.subject,
            htmlContent: email.html_content,
          };
        } else {
          throw new Error(`No template found for email type: ${email.email_type}`);
        }

        // Send email via Brevo API
        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: {
              name: 'NEYOTA',
              email: 'notifications@neyota.com', // Configured in Brevo
            },
            to: [
              {
                email: email.recipient_email,
                name: email.recipient_name,
              },
            ],
            subject: emailContent.subject,
            htmlContent: emailContent.htmlContent,
            tags: ['notification', email.email_type],
          }),
        });

        if (!brevoResponse.ok) {
          const errorData = await brevoResponse.json();
          throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
        }

        // Mark email as sent
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        if (updateError) {
          console.error('Error updating email status:', updateError);
        }

        sentCount++;
        console.log(`✓ Sent email ${email.id} to ${email.recipient_email}`);

      } catch (error) {
        console.error(`✗ Failed to send email ${email.id}:`, error);

        // Update error status
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({
            status: email.retry_count >= 2 ? 'failed' : 'pending',
            retry_count: email.retry_count + 1,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', email.id);

        if (updateError) {
          console.error('Error updating email error status:', updateError);
        }

        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Email processing completed',
        sent: sentCount,
        failed: failedCount,
        total: pendingEmails.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-emails function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
