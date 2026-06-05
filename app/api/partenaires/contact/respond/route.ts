import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json();
  const { request_id, response, decline_reason } = body;

  if (!request_id || !response) {
    return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
  }

  if (!['accepted', 'declined'].includes(response)) {
    return NextResponse.json({ error: 'Réponse invalide.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('respond_to_contact_request', {
    p_request_id:     request_id,
    p_response:       response,
    p_decline_reason: decline_reason ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = data as { error?: string; success?: boolean };
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
