/**
 * Traduit une erreur Supabase/PostgREST en message français affichable.
 * Ne jamais afficher error.message directement à l'utilisateur.
 */
export function getUserErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue. Veuillez réessayer.'
): string {
  const e = error as { code?: string; message?: string } | null | undefined;
  const code = e?.code;
  const message = (e?.message ?? '').toLowerCase();

  if (code === '42501' || message.includes('permission denied')) {
    return "Ce contenu n'est accessible qu'aux membres connectés.";
  }
  if (code === 'PGRST116') {
    return 'Ce contenu est introuvable.';
  }
  if (code === 'PGRST301' || message.includes('jwt expired')) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Connexion impossible. Vérifiez votre connexion internet et réessayez.';
  }
  return fallback;
}
