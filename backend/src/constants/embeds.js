const EMBED_PROVIDERS = Object.freeze({
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo',
  TWITTER: 'twitter',
  GITHUB_GIST: 'github_gist',
  CODEPEN: 'codepen',
  SPOTIFY: 'spotify',
  GOOGLE_MAPS: 'google_maps',
  CUSTOM: 'custom',
});

// Host patterns recognized for each provider (used to classify + validate embed URLs)
const PROVIDER_HOST_PATTERNS = {
  [EMBED_PROVIDERS.YOUTUBE]: [/(^|\.)youtube\.com$/, /(^|\.)youtu\.be$/],
  [EMBED_PROVIDERS.VIMEO]: [/(^|\.)vimeo\.com$/, /(^|\.)player\.vimeo\.com$/],
  [EMBED_PROVIDERS.TWITTER]: [/(^|\.)twitter\.com$/, /(^|\.)x\.com$/, /(^|\.)platform\.twitter\.com$/],
  [EMBED_PROVIDERS.GITHUB_GIST]: [/(^|\.)gist\.github\.com$/],
  [EMBED_PROVIDERS.CODEPEN]: [/(^|\.)codepen\.io$/],
  [EMBED_PROVIDERS.SPOTIFY]: [/(^|\.)open\.spotify\.com$/],
  [EMBED_PROVIDERS.GOOGLE_MAPS]: [/(^|\.)google\.com$/, /(^|\.)maps\.google\.com$/],
};

module.exports = { EMBED_PROVIDERS, PROVIDER_HOST_PATTERNS };
