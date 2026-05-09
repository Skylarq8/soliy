// Trusted CDN hosts — a message that is *exactly* one of these URLs is never blocked
const TRUSTED_HOSTS = new Set(['res.cloudinary.com', 'storage.googleapis.com'])

function isTrustedCdnUrl(text: string): boolean {
  const t = text.trim()
  // Must be a single token — no spaces or newlines
  if (/\s/.test(t)) return false
  try {
    const u = new URL(t)
    return u.protocol === 'https:' && TRUSTED_HOSTS.has(u.hostname)
  } catch {
    return false
  }
}

const PATTERNS: RegExp[] = [
  // Mongolian mobile numbers — exactly 8 digits starting with 6–9.
  // \b ensures the digits are not embedded mid-word (e.g. v99001234 in a URL has no \b before 9).
  /\b[6-9]\d{7}\b/g,

  // International / formatted phone numbers (≥9 chars including spaces or dashes).
  // Lookbehind/lookahead prevent matching digit runs inside URL paths like /v1715000000/
  /(?<![/\d\w])\+?[\d][\d\s\-().]{7,}\d(?![/\d\w])/g,

  // Email addresses
  /[\w.+\-]+@[\w.\-]+\.[a-zA-Z]{2,}/g,

  // @handle mentions — excluded when directly inside a URL path (after / or :)
  /(?<![/:])[@@][\w.]{3,}/g,

  // Direct links to messaging / social platforms
  /(?:t(?:elegram)?\.me|wa\.me|instagram\.com|facebook\.com|fb\.(?:com|me)|tiktok\.com|snapchat\.com|signal\.group|viber\.com|line\.me)\/[\w@%+.\-]{1,}/gi,

  // "platform : username" patterns — someone telling the other to add them elsewhere
  // Covers Mongolian keywords (утас, дугаар, нэмэх) and Latin social platform names
  /(?:phone|утас|дугаар|нэмэх|ig|insta(?:gram)?|fb|facebook|telegram|tg|viber|signal|snap(?:chat)?|tiktok|вайбер|телеграм|фейсбүүк)\s*[:：]\s*[\w@+.\-]{3,}/gi,
]

export function containsContactInfo(text: string): boolean {
  // Image URLs from trusted CDNs must never be blocked
  if (isTrustedCdnUrl(text)) return false

  return PATTERNS.some(p => {
    p.lastIndex = 0
    return p.test(text)
  })
}
