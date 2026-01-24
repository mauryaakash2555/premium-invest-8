/**
 * FILE: app\refund\layout.js
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
  title: "Refund Policy | BM Wealth",
  description: "Read BM Wealth’s refund and cancellation policy for services and digital products.",
  path: "/refund",
});

export default function Layout({ children }) {
  return children;
}
