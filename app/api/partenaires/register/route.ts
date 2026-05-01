import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Fail fast if service role key is missing (Vercel env var not configured)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Configuration serveur manquante. Contactez l\'administrateur.' }, { status: 500 });
    }

    const body = await request.json();
    const {
      firstName, lastName, email, password,
      organizationName, siret, organizationType, organizationSubtype,
      territoryScope, territoryCodes, justificationUrl,
    } = body;

    if (!email || !password || !firstName || !lastName || !organizationName || !organizationType) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'partner',
      },
    });

    if (authError) {
      const msg = authError.message ?? '';
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('email address')) {
        return NextResponse.json({ error: 'Cette adresse email est déjà utilisée.' }, { status: 409 });
      }
      return NextResponse.json({ error: msg || 'Erreur lors de la création du compte.' }, { status: 400 });
    }

    if (!authData?.user?.id) {
      console.error('auth.admin.createUser returned no user');
      return NextResponse.json({ error: 'Erreur inattendue lors de la création du compte.' }, { status: 500 });
    }

    const userId = authData.user.id;

    const { error: orgError } = await supabase
      .from('partner_organizations')
      .insert({
        user_id: userId,
        organization_name: organizationName,
        siret: siret || null,
        organization_type: organizationType,
        organization_subtype: organizationSubtype || null,
        territory_scope: territoryScope || null,
        territory_codes: territoryCodes?.length > 0 ? territoryCodes : null,
        justification_url: justificationUrl || null,
        is_validated: false,
      });

    if (orgError) {
      await supabase.auth.admin.deleteUser(userId);
      console.error('partner_organizations insert error:', JSON.stringify(orgError));
      return NextResponse.json({
        error: `Erreur lors de la création du compte partenaire : ${orgError.message}`,
      }, { status: 500 });
    }

    // Email inserts are best-effort — a failure here must not block the registration
    const { error: email1Err } = await supabase.from('email_queue').insert({
      user_id: userId,
      recipient_email: email,
      recipient_name: `${firstName} ${lastName}`,
      email_type: 'partner_application_received',
      template_params: {
        first_name: firstName,
        organization_name: organizationName,
      },
      scheduled_for: new Date().toISOString(),
    });
    if (email1Err) console.error('email_queue insert (partner_application_received) failed:', JSON.stringify(email1Err));

    const { error: email2Err } = await supabase.from('email_queue').insert({
      user_id: userId,
      recipient_email: 'cyril.hugon@gmail.com',
      recipient_name: 'Admin Teriis',
      email_type: 'partner_new_submission_admin',
      template_params: {
        first_name: firstName,
        last_name: lastName,
        email,
        organization_name: organizationName,
        organization_type: organizationType,
        territory_scope: territoryScope || 'national',
        admin_url: 'https://neyota.vercel.app/admin/partner-validations',
      },
      scheduled_for: new Date().toISOString(),
    });
    if (email2Err) console.error('email_queue insert (partner_new_submission_admin) failed:', JSON.stringify(email2Err));

    return NextResponse.json({ userId }, { status: 201 });
  } catch (err) {
    console.error('Partner register unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 });
  }
}
