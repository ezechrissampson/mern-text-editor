/**
 * Client-side mirror of backend constants/embeds.js host whitelist.
 * Used for immediate UX feedback before the server does the
 * authoritative validation on save.
 */
export const PROVIDER_HOST_PATTERNS = {
  youtube: [/(^|\.)youtube\.com$/, /(^|\.)youtu\.be$/],
  vimeo: [/(^|\.)vimeo\.com$/, /(^|\.)player\.vimeo\.com$/],
  twitter: [/(^|\.)twitter\.com$/, /(^|\.)x\.com$/, /(^|\.)platform\.twitter\.com$/],
  github_gist: [/(^|\.)gist\.github\.com$/],
  codepen: [/(^|\.)codepen\.io$/],
  spotify: [/(^|\.)open\.spotify\.com$/],
  google_maps: [/(^|\.)google\.com$/],
};

export function detectProvider(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  return Object.entries(PROVIDER_HOST_PATTERNS).find(([, patterns]) =>
    patterns.some((p) => p.test(host))
  )?.[0] || null;
}

export function toEmbedUrl(url, provider) {
  try {
    const u = new URL(url);
    if (provider === 'youtube') {
      const id = u.hostname.includes('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (provider === 'vimeo') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    return url;
  } catch {
    return url;
  }
}
