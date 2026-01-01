/**
 * Input Validation
 * Prevent injection + bad data
 */

export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 1000);
}

export function validateEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(e);
}

export function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(0, 20);
}

export function validatePhone(phone) {
  const digits = normalizePhone(phone);
  // Basic India-style 10 digit mobile check (keep simple)
  return /^[0-9]{10}$/.test(digits);
}

export function validateLeadData(data) {
  const errors = [];
  const name = String(data?.name || "");
  const email = String(data?.email || "");
  const phone = String(data?.phone || "");

  if (!name || name.length < 2) errors.push("Name must be at least 2 characters");
  if (!validateEmail(email)) errors.push("Invalid email address");
  if (phone && !validatePhone(phone)) errors.push("Invalid phone number (must be 10 digits)");

  return { valid: errors.length === 0, errors };
}
