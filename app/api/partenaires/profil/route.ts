import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const { organizationName, territoryScope, territoryCodes, interventionCategories } = body;

  if (!organizationName?.trim()) {
    return NextResponse.json({ error: 'Le nom de l\'organisation est requis.' }, { status: 400 });
  }
  if (!['national', 'regional', 'departmental'].includes(territoryScope)) {
    return NextResponse.json({ error: 'Périmètre invalide.' }, { status: 400 });
  }
  if ((territoryScope === 'regional' || territoryScope === 'departmental') && (!Array.isArray(territoryCodes) || territoryCodes.length === 0)) {
    return NextResponse.json({ error: 'Sélectionnez au moins un territoire.' }, { status: 400 });
  }
  if (!Array.isArray(interventionCategories) || interventionCategories.length === 0) {
    return NextResponse.json({ error: 'Sélectionnez au moins un domaine d\'intervention.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('partner_organizations')
    .update({
      organization_name:       organizationName.trim(),
      territory_scope:         territoryScope,
      territory_codes:         territoryScope === 'national' ? null : territoryCodes,
      intervention_categories: interventionCategories,
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('partner profil update error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
