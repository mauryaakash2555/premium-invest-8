/**
 * SEO Metadata Helper
 * Centralized metadata building for canonical, OpenGraph, Twitter Cards
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bmwealth.co.in";
export const SITE_NAME = "BM Wealth";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function getMetadataBase() {
  return new URL(SITE_URL);
}

export function buildMetadata({ title, description, path, type = "website", image = DEFAULT_OG_IMAGE, robots = undefined }) {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
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