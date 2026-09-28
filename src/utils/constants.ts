/** UMN design tokens. Colors live in src/styles.css as semantic tokens. */
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const WIDGET_ORDER = ["academics", "payments", "clubs"] as const;

/** Cache window for pull-to-refresh (ms). */
export const REFRESH_CACHE_MS = 10_000;

/** Languages Goldy can answer in, shown in their own script. Codes are ISO 639. */
export const LANGUAGES = [
  { code: "en", name: "English", english: "English" },
  { code: "es", name: "Español", english: "Spanish" },
  { code: "so", name: "Soomaali", english: "Somali" },
  { code: "hmn", name: "Hmoob", english: "Hmong" },
  { code: "om", name: "Afaan Oromoo", english: "Oromo" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese" },
  { code: "zh", name: "中文", english: "Chinese" },
  { code: "ar", name: "العربية", english: "Arabic" },
] as const;
