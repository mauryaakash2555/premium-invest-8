/**
 * FILE: app\v0-test\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - @/components/V0Test
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

export const metadata = {
  title: 'V0.dev Component Test | BM Wealth',
  description: 'Testing v0.dev component compatibility',
};

export default function V0TestPage() {
  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>V0 Test</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
        This route is a dev-only sandbox. The previous component import was removed during Phase 2 cleanup.
      </p>
    </main>
  );
}

