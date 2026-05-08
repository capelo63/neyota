export async function checkPwnedPassword(
  password: string
): Promise<{ pwned: boolean; count?: number }> {
  try {
    const encoded = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoded);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    console.log('[HIBP] Hash SHA-1:', hashHex);

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    console.log('[HIBP] Prefix envoyé:', prefix);
    console.log('[HIBP] Suffix recherché:', suffix);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    console.log('[HIBP] Status réponse:', res.status);

    if (!res.ok) {
      console.warn('[HIBP] API non-ok, inscription non bloquée');
      return { pwned: false };
    }

    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.includes(':'));

    console.log('[HIBP] Nombre de lignes:', lines.length);

    let match = false;
    let matchCount: number | undefined;
    for (const line of lines) {
      const sep = line.indexOf(':');
      if (line.slice(0, sep) === suffix) {
        match = true;
        matchCount = parseInt(line.slice(sep + 1), 10);
        break;
      }
    }

    console.log('[HIBP] Match trouvé:', match);

    const result = match ? { pwned: true, count: matchCount } : { pwned: false };
    console.log('[HIBP] Résultat final:', result);

    return result;
  } catch (err) {
    console.error('[HIBP] Check failed (inscription non bloquée):', err);
    return { pwned: false };
  }
}
