import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { partnerId, rejectionReason } = await request.json();
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId requis.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: org, error: fetchError } = await adminSupabase
      .from('partner_organizations')
      .select('user_id, organization_name')
      .eq('id', partnerId)
      .single();

    if (fetchError || !org) {
      return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 });
    }

    const { error: updateError } = await adminSupabase
      .from('partner_organizations')
      .update({
        is_rejected: true,
        rejection_reason: rejectionReason || null,
      })
      .eq('id', partnerId);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors du rejet.' }, { status: 500 });
    }

    // Get partner email
    const { data: authUser } = await adminSupabase.auth.admin.getUserById(org.user_id);
    const email = authUser?.user?.email;
    const firstName = authUser?.user?.user_metadata?.first_name ?? '';

    if (email) {
      await adminSupabase.from('email_queue').insert({
        user_id: org.user_id,
        recipient_email: email,
        recipient_name: firstName || org.organization_name,
        email_type: 'partner_rejected',
        template_params: {
          first_name: firstName,
          organization_name: org.organization_name,
          rejection_reason: rejectionReason || null,
        },
        scheduled_for: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('partner-reject error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue.' }, { status: 500 });
  }
}
