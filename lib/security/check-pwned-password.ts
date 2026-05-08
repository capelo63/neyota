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

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // No custom headers: keeps the request a "simple CORS GET" (no preflight OPTIONS).
    // Add-Padding would trigger a preflight that HIBP may reject depending on the
    // client environment, causing a silent network error → pwned: false.
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('[HIBP] API returned status:', res.status);
      return { pwned: false };
    }

    const text = await res.text();
    // Use /\r?\n/ to handle both CRLF (standard) and LF-only responses.
    for (const line of text.split(/\r?\n/)) {
      const sep = line.indexOf(':');
      if (sep === -1) continue;
      if (line.slice(0, sep) === suffix) {
        return { pwned: true, count: parseInt(line.slice(sep + 1), 10) };
      }
    }

    return { pwned: false };
  } catch (err) {
    console.error('[HIBP] Check failed (inscription non bloquée):', err);
    return { pwned: false };
  }
}
