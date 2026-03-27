const IST_OFFSET_MINUTES = 330;

function getPart(parts, type) {
  return parts.find((part) => part.type === type)?.value || "";
}

function getIstDateParts(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = Number.parseInt(getPart(parts, "year"), 10);
    const month = Number.parseInt(getPart(parts, "month"), 10);
    const day = Number.parseInt(getPart(parts, "day"), 10);

    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return { year, month, day };
    }
  } catch {
    // Fall back to UTC-derived parts below.
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function toNeutralUtcDate(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function fromNeutralUtcDate(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function shiftIstDate(parts, dayOffset) {
  const shifted = toNeutralUtcDate(parts);
  shifted.setUTCDate(shifted.getUTCDate() + dayOffset);
  return fromNeutralUtcDate(shifted);
}

export function getUtcInstantForIstMidnight(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day) - IST_OFFSET_MINUTES * 60 * 1000);
}

export function getIstRangeStarts(date = new Date()) {
  const todayParts = getIstDateParts(date);
  const todayNeutral = toNeutralUtcDate(todayParts);
  const dayOfWeek = todayNeutral.getUTCDay();

  const weekNeutral = new Date(todayNeutral);
  weekNeutral.setUTCDate(todayNeutral.getUTCDate() + ((dayOfWeek === 0 ? -6 : 1) - dayOfWeek));

  return {
    dayStart: getUtcInstantForIstMidnight(todayParts),
    yesterdayStart: getUtcInstantForIstMidnight(shiftIstDate(todayParts, -1)),
    weekStart: getUtcInstantForIstMidnight(fromNeutralUtcDate(weekNeutral)),
    monthStart: getUtcInstantForIstMidnight({ year: todayParts.year, month: todayParts.month, day: 1 }),
    yearStart: getUtcInstantForIstMidnight({ year: todayParts.year, month: 1, day: 1 }),
  };
}

export function getIstRangeForFilter(filter, date = new Date()) {
  const { dayStart, yesterdayStart, weekStart, monthStart, yearStart } = getIstRangeStarts(date);

  switch (String(filter || "all").toLowerCase()) {
    case "today":
      return { from: dayStart, to: null };
    case "yesterday":
      return { from: yesterdayStart, to: dayStart };
    case "week":
      return { from: weekStart, to: null };
    case "month":
      return { from: monthStart, to: null };
    case "year":
      return { from: yearStart, to: null };
    case "all":
    default:
      return { from: null, to: null };
  }
}