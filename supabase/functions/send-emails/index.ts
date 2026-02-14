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
              email: 'notifications@neyota.fr', // Configure this in Brevo
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
