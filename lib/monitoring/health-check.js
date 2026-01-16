/**
 * API Health Monitoring Service
 * 
 * Monitors all Live Intelligence APIs
 * Sends alerts on failures
 * Tracks health metrics in Supabase
 */

import { sendAPIFailureAlert } from './email-alerts';
import { createClient } from '@supabase/supabase-js';

const MONITORED_ENDPOINTS = [
  { path: '/api/live-intelligence/feed', name: 'Headlines Feed', critical: true },
  { path: '/api/live-intelligence/mood', name: 'AI Mood Text', critical: true },
  { path: '/api/live-intelligence/ingest', name: 'RSS Ingestion', critical: false },
  { path: '/api/live-intelligence/process', name: 'AI Processing', critical: false },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmwealth.co.in';

// Track last successful fetch per endpoint
const lastSuccessful = new Map();
const failureCount = new Map();

/**
 * Get Supabase client
 */
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Check single endpoint health
 */
async function checkEndpoint(endpoint) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SITE_URL}${endpoint.path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Success - reset failure count
    failureCount.set(endpoint.path, 0);
    lastSuccessful.set(endpoint.path, new Date().toISOString());

    return {
      endpoint: endpoint.path,
      name: endpoint.name,
      status: 'healthy',
      latency,
      lastSuccess: lastSuccessful.get(endpoint.path),
    };
  } catch (error) {
    const currentFailures = (failureCount.get(endpoint.path) || 0) + 1;
    failureCount.set(endpoint.path, currentFailures);

    // Send alert after 2 consecutive failures (to avoid false positives)
    if (currentFailures >= 2 && endpoint.critical) {
      await sendAPIFailureAlert(
        endpoint.path,
        error,
        lastSuccessful.get(endpoint.path) 
          ? `Using cached data from ${lastSuccessful.get(endpoint.path)}`
          : 'No cached data available'
      );
    }

    return {
      endpoint: endpoint.path,
      name: endpoint.name,
      status: 'unhealthy',
      error: error.message,
      consecutiveFailures: currentFailures,
      lastSuccess: lastSuccessful.get(endpoint.path) || null,
    };
  }
}

/**
 * Check all endpoints
 */
export async function checkAllEndpoints() {
  const results = await Promise.all(
    MONITORED_ENDPOINTS.map(checkEndpoint)
  );

  const healthReport = {
    timestamp: new Date().toISOString(),
    overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
    endpoints: results,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status !== 'healthy').length,
    },
  };

  // Log to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('health_checks').insert({
        status: healthReport.overall,
        endpoints_checked: healthReport.summary.total,
        endpoints_healthy: healthReport.summary.healthy,
        endpoints_unhealthy: healthReport.summary.unhealthy,
        details: healthReport.endpoints,
        created_at: healthReport.timestamp,
      });
    } catch (err) {
      console.error('Failed to log health check:', err);
    }
  }

  return healthReport;
}

/**
 * Get last successful fetch timestamp for an endpoint
 */
export function getLastSuccessful(endpoint) {
  return lastSuccessful.get(endpoint) || null;
}

/**
 * Get failure count for an endpoint
 */
export function getFailureCount(endpoint) {
  return failureCount.get(endpoint) || 0;
}

/**
 * Wrapper for API calls with monitoring
 * Use this to wrap fetch calls to monitored endpoints
 */
export async function monitoredFetch(url, options = {}) {
  const endpoint = MONITORED_ENDPOINTS.find(e => url.includes(e.path));
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Track success
    if (endpoint) {
      failureCount.set(endpoint.path, 0);
      lastSuccessful.set(endpoint.path, new Date().toISOString());
    }

    return response;
  } catch (error) {
    // Track failure
    if (endpoint) {
      const failures = (failureCount.get(endpoint.path) || 0) + 1;
      failureCount.set(endpoint.path, failures);

      // Alert on critical failures
      if (failures >= 2 && endpoint.critical) {
        await sendAPIFailureAlert(endpoint.path, error);
      }
    }

    throw error;
  }
}

export default {
  checkAllEndpoints,
  checkEndpoint,
  monitoredFetch,
  getLastSuccessful,
  getFailureCount,
  MONITORED_ENDPOINTS,
};
