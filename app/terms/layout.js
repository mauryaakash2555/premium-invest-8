/**
 * FILE: app\terms\layout.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - (none)
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms (Legacy) | BM Wealth",
  description: "Legacy URL. Redirects to the canonical terms and conditions page.",
  path: "/terms",
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
