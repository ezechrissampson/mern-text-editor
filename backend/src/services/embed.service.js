const { PROVIDER_HOST_PATTERNS } = require('../constants/embeds');
const { isWhitelistedIframeSrc } = require('./sanitize.service');
const AppError = require('../utils/AppError');

function detectProvider(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const [provider, patterns] of Object.entries(PROVIDER_HOST_PATTERNS)) {
    if (patterns.some((p) => p.test(host))) return provider;
  }
  return null;
}

/**
 * Validates a URL/iframe-src the client wants to embed and returns the
 * detected provider. Throws if the host isn't recognized/whitelisted.
 * The actual <iframe> tag insertion happens client-side (TipTap embed
 * extension); this is the server-side guard invoked when saving content
 * that contains embeds (via sanitize.service's iframe whitelist check).
 */
function validateEmbedUrl(url) {
  const provider = detectProvider(url);
  if (!provider) {
    throw AppError.badRequest('URL does not match any whitelisted embed provider', { url });
  }
  if (!isWhitelistedIframeSrc(url) && !/^https:\/\//i.test(url)) {
    throw AppError.badRequest('Embed URL must be https and within the allowed host list', { url });
  }
  return { provider, url };
}

module.exports = { detectProvider, validateEmbedUrl };
