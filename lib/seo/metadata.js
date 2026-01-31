/**
 * SEO Metadata Helper
 * Centralized metadata building for canonical, OpenGraph, Twitter Cards
 */

function normalizeMainSiteUrl(input) {
  const raw = String(input || '').trim() || 'https://www.bmwealth.co.in';
  let url;
  try {
    url = new URL(raw);
  } catch {
    url = new URL('https://www.bmwealth.co.in');
  }

  // Force HTTPS.
  url.protocol = 'https:';

  // Force www for the main site.
  const h = url.hostname.toLowerCase();
  if (h === 'bmwealth.co.in') url.hostname = 'www.bmwealth.co.in';
  if (h === 'www.bmwealth.co.in') url.hostname = 'www.bmwealth.co.in';

  return url.toString().replace(/\/$/, '');
}

const SITE_URL = normalizeMainSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmwealth.co.in');
export const SITE_NAME = "BM Wealth";
// Keep this pointing to a file that exists in /public to avoid broken OG tags.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export function getMetadataBase() {
  return new URL(SITE_URL);
}

export function buildMetadata({ title, description, path, type = "website", image = DEFAULT_OG_IMAGE, robots = undefined }) {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const canonical = url;

  const meta = {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_IN",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  if (robots) meta.robots = robots;
  return meta;
}