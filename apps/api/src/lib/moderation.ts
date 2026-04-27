const PATTERNS: RegExp[] = [
  /\+?[\d][\d\s\-()]{8,}/g,
  /[\w.-]+@[\w.-]+\.\w+/g,
  /@[\w.]{3,}/g,
  /t\.me\/|wa\.me\/|instagram\.com|facebook\.com|tiktok\.com/gi,
  /\b\d{8,}\b/g,
]

export function containsContactInfo(text: string): boolean {
  return PATTERNS.some(p => {
    p.lastIndex = 0
    return p.test(text)
  })
}
