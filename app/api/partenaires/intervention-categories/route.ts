import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

  const { error } = await supabase
    .from('partner_organizations')
    .update({ intervention_categories: interventionCategories })
    .eq('user_id', user.id);

  if (error) {
    console.error('intervention_categories update error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
