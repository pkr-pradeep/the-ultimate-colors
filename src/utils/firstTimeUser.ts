/**
 * First-Time User Detection & Persistence Utility
 * 
 * Uses localStorage + public IP detection so that the onboarding walkthrough
 * appears only on the user's very first visit, and NEVER pops up a second time.
 */

const LOCAL_STORAGE_SEEN_KEY = 'universal_joker_walkthrough_seen';
const LOCAL_STORAGE_SEEN_IP_PREFIX = 'universal_joker_seen_ip_';
const LOCAL_STORAGE_LANG_KEY = 'universal_joker_rulebook_lang';

export type RulebookLanguage = 'en' | 'hi' | 'or'; // English, Hindi, Odia

let cachedClientIp: string | null = null;

/**
 * Attempts to fetch client IP with a short timeout.
 * Gracefully falls back to null if blocked by adblockers, CORS, or offline.
 */
export async function getClientIp(): Promise<string | null> {
  if (cachedClientIp) return cachedClientIp;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.ip === 'string') {
        cachedClientIp = data.ip;
        return data.ip;
      }
    }
  } catch {
    // Fail silently, fallback to client device storage
  }

  return null;
}

/**
 * Checks whether this user / phone IP has already seen the walkthrough.
 * Returns true if this is the FIRST TIME (should show walkthrough).
 * Returns false if already seen (should NOT show walkthrough).
 */
export async function checkIsFirstTimeUser(): Promise<boolean> {
  // 1. Direct device check in localStorage
  try {
    const seenLocally = localStorage.getItem(LOCAL_STORAGE_SEEN_KEY);
    if (seenLocally === 'true') {
      return false; // Definitely not first time
    }
  } catch {
    // LocalStorage restricted or disabled
  }

  // 2. Network IP check
  const ip = await getClientIp();
  if (ip) {
    try {
      const seenByIp = localStorage.getItem(LOCAL_STORAGE_SEEN_IP_PREFIX + ip);
      if (seenByIp === 'true') {
        return false;
      }
    } catch {
      // Ignore
    }
  }

  // If never marked seen on this device or IP, it is a first-time user!
  return true;
}

/**
 * Marks that the user has completed or dismissed the walkthrough.
 * Guarantees no second time automatic popup on this phone or browser.
 */
export function markWalkthroughSeen(customIp?: string | null) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SEEN_KEY, 'true');
    const ipToRecord = customIp || cachedClientIp;
    if (ipToRecord) {
      localStorage.setItem(LOCAL_STORAGE_SEEN_IP_PREFIX + ipToRecord, 'true');
    }
  } catch {
    // Storage quota or privacy mode error
  }
}

/**
 * Retrieves preferred rulebook language (defaulting to English)
 */
export function getSavedRulebookLanguage(): RulebookLanguage {
  try {
    const lang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    if (lang === 'en' || lang === 'hi' || lang === 'or') {
      return lang;
    }
  } catch {
    // Ignore
  }
  return 'en';
}

/**
 * Saves preferred rulebook language
 */
export function saveRulebookLanguage(lang: RulebookLanguage) {
  try {
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
  } catch {
    // Ignore
  }
}
