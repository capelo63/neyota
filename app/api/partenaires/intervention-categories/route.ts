import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Auth check via session client (reads cookies)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const { interventionCategories } = body;

  if (!Array.isArray(interventionCategories) || interventionCategories.length === 0) {
    return NextResponse.json({ error: 'Sélectionnez au moins un domaine d\'intervention.' }, { status: 400 });
  }

  // Use admin client to bypass RLS for the update
  const admin = createAdminClient();
  const { error } = await admin
    .from('partner_organizations')
    .update({ intervention_categories: interventionCategories })
    .eq('user_id', user.id);

  if (error) {
    console.error('intervention_categories update error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
