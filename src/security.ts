// FitTrack — Frontend Security & Anti-XSS Sanitizer Layer
// Hardens all dynamic data rendering against HTML injection and Cross-Site Scripting (XSS)

/**
 * Escapes characters that are dangerous when interpolated into HTML or attribute strings.
 */
export function escapeHtml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and sanitizes avatar image URLs to prevent `javascript:` or `data:text/html` pseudo-protocols.
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = ''): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  // Strictly allow only http, https, and safe image data URLs
  if (/^(https?:\/\/|data:image\/(png|jpe?g|webp|svg\+xml);base64,)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }

  return fallback;
}

/**
 * Strips HTML tags from input strings (defense-in-depth for form inputs).
 */
export function stripHtml(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

