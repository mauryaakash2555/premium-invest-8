/**
 * FILE: app/admin-secret-xyz/page.jsx
 * PURPOSE: Legacy hidden admin route (kept for backward compatibility).
 * CATEGORY: app
 */

'use client';

import { useEffect } from 'react';

export default function AdminSecretXYZLegacyRedirect() {
  useEffect(() => {
    // Redirect old secret route to the new super admin route
    window.location.replace('/admin-secret-akash');
  }, []);

  return null;
}
