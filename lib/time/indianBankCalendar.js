/**
 * Indian Bank Calendar — date, holiday, and bank-status utility.
 *
 * Rules:
 *  - All Sundays: banks closed.
 *  - 2nd Saturday of every month: banks closed.
 *  - 4th Saturday of every month: banks closed.
 *  - RBI gazetted holidays: banks closed.
 *  - All other days: banks open (regular working day).
 *
 * Holiday list sourced from RBI published holiday calendar for 2025-2026.
 * Updated annually — add next year entries before January.
 */

// ─── RBI Gazetted Bank Holidays ───────────────────────
// key = "YYYY-MM-DD", value = holiday name
const RBI_HOLIDAYS = {
  // 2025
  '2025-01-14': 'Makar Sankranti / Pongal',
  '2025-01-26': 'Republic Day',
  '2025-02-26': 'Maha Shivaratri',
  '2025-03-14': 'Holi',
  '2025-03-31': 'Id-ul-Fitr (Eid)',
  '2025-04-01': 'Annual Closing of Banks',
  '2025-04-06': 'Ram Navami',
  '2025-04-10': 'Mahavir Jayanti',
  '2025-04-14': 'Dr. Ambedkar Jayanti',
  '2025-04-18': 'Good Friday',
  '2025-05-01': 'May Day',
  '2025-05-12': 'Buddha Purnima',
  '2025-06-07': 'Id-ul-Zuha (Bakrid)',
  '2025-07-06': 'Muharram',
  '2025-08-15': 'Independence Day',
  '2025-08-16': 'Parsi New Year',
  '2025-08-27': 'Janmashtami',
  '2025-09-05': 'Milad-un-Nabi',
  '2025-10-02': 'Mahatma Gandhi Jayanti',
  '2025-10-20': 'Dussehra',
  '2025-10-21': 'Dussehra (Additional)',
  '2025-11-05': 'Diwali (Laxmi Pujan)',
  '2025-11-06': 'Diwali (Balipratipada)',
  '2025-11-26': 'Guru Nanak Jayanti',
  '2025-12-25': 'Christmas',
  // 2026
  '2026-01-26': 'Republic Day',
  '2026-02-17': 'Maha Shivaratri',
  '2026-03-04': 'Holi',
  '2026-03-20': 'Id-ul-Fitr (Eid)',
  '2026-03-26': 'Ram Navami',
  '2026-04-01': 'Annual Closing of Banks',
  '2026-04-03': 'Good Friday',
  '2026-04-06': 'Mahavir Jayanti',
  '2026-04-14': 'Dr. Ambedkar Jayanti',
  '2026-05-01': 'May Day / Maharashtra Day',
  '2026-05-27': 'Id-ul-Zuha (Bakrid)',
  '2026-05-31': 'Buddha Purnima',
  '2026-06-26': 'Muharram',
  '2026-08-15': 'Independence Day',
  '2026-08-17': 'Janmashtami',
  '2026-08-25': 'Milad-un-Nabi',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-09': 'Dussehra',
  '2026-10-24': 'Diwali (Laxmi Pujan)',
  '2026-10-25': 'Diwali (Balipratipada)',
  '2026-11-15': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas',
  // 2027 — extend before Jan 2027
};

// ─── Helpers ──────────────────────────────────────────

/**
 * Get current IST Date (works everywhere, not just India).
 * Returns a JS Date whose UTC fields represent IST.
 */
function getIstNow() {
  const utc = new Date();
  // IST = UTC + 5:30
  const istMs = utc.getTime() + (5.5 * 60 * 60 * 1000);
  return new Date(istMs);
}

/** Get ordinal Saturday number (1st, 2nd, 3rd…) for a given date. */
function saturdayOrdinal(date) {
  // date.getUTCDay() === 6 for Saturday (we use UTC fields because getIstNow() stores IST in UTC)
  const day = date.getUTCDay?.() ?? date.getDay();
  if (day !== 6) return 0; // not a Saturday
  const dom = date.getUTCDate?.() ?? date.getDate();
  return Math.ceil(dom / 7);
}

/** Format "YYYY-MM-DD" from a Date whose UTC fields represent IST. */
function toIsoDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ─── Public API ───────────────────────────────────────

/**
 * Returns today's status for display.
 * {
 *   date:        "Thursday, 20 February 2026"
 *   time:        "10:34 AM IST"
 *   bankOpen:    true | false
 *   reason:      "Regular working day" | "Sunday" | "2nd Saturday" | "Republic Day" | …
 *   holiday:     null | "Republic Day"
 *   isSaturday:  false | "1st" | "2nd" | "3rd" | "4th" | "5th"
 *   dayOfWeek:   "Thursday"
 * }
 */
export function getTodayBankStatus() {
  const ist = getIstNow();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayOfWeek = dayNames[ist.getUTCDay()];
  const dateStr = `${dayOfWeek}, ${ist.getUTCDate()} ${monthNames[ist.getUTCMonth()]} ${ist.getUTCFullYear()}`;

  const hh = ist.getUTCHours();
  const mm = String(ist.getUTCMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  const timeStr = `${h12}:${mm} ${ampm} IST`;

  const isoDate = toIsoDate(ist);
  const wDay = ist.getUTCDay(); // 0=Sun … 6=Sat

  // Check gazetted holiday
  const gazetted = RBI_HOLIDAYS[isoDate] || null;

  // Check Saturday type
  let satType = null;
  let isSat = false;
  if (wDay === 6) {
    isSat = true;
    const ord = saturdayOrdinal(ist);
    const ordNames = ['', '1st', '2nd', '3rd', '4th', '5th'];
    satType = ordNames[ord] || `${ord}th`;
  }

  // Determine bank status
  let bankOpen = true;
  let reason = 'Regular working day';

  if (wDay === 0) {
    bankOpen = false;
    reason = 'Sunday';
  } else if (isSat) {
    const ord = saturdayOrdinal(ist);
    if (ord === 2 || ord === 4) {
      bankOpen = false;
      reason = `${satType} Saturday — banks closed`;
    } else {
      reason = `${satType} Saturday — banks open`;
    }
  }

  if (gazetted) {
    bankOpen = false;
    reason = gazetted;
  }

  return {
    date: dateStr,
    time: timeStr,
    bankOpen,
    reason,
    holiday: gazetted,
    isSaturday: isSat ? satType : false,
    dayOfWeek,
  };
}

/**
 * Returns the next upcoming holiday (within 30 days) or null.
 */
export function getNextHoliday() {
  const ist = getIstNow();
  const todayIso = toIsoDate(ist);
  const currentMs = ist.getTime();

  let nearest = null;
  let nearestMs = Infinity;

  for (const [dateStr, name] of Object.entries(RBI_HOLIDAYS)) {
    if (dateStr <= todayIso) continue;
    // Parse YYYY-MM-DD
    const [y, m, d] = dateStr.split('-').map(Number);
    const holMs = Date.UTC(y, m - 1, d);
    const diff = holMs - currentMs;
    if (diff > 0 && diff < 30 * 86400000 && diff < nearestMs) {
      nearestMs = diff;
      const dObj = new Date(holMs);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      nearest = {
        name,
        date: `${dayNames[dObj.getUTCDay()]}, ${dObj.getUTCDate()} ${monthNames[dObj.getUTCMonth()]}`,
        daysAway: Math.ceil(diff / 86400000),
      };
    }
  }
  return nearest;
}
