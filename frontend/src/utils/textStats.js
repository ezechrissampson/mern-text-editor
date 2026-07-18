const WORDS_PER_MINUTE = 200;

export function computeReadingStats(plainText = '') {
  const trimmed = plainText.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = trimmed.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return { wordCount, characterCount, readingTimeMinutes };
}
