'use client';

import { useEffect, useRef, useState } from 'react';

type State<T> = {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  stale: boolean;
  error: string | null;
};

export type FIIDIIData = {
  ok: boolean;
  date: string | null;
  fiiNetCr: number | null;
  diiNetCr: number | null;
  lastUpdated: string | null;
};

export function useFIIDIIFlow(pollMs: number = 30_000) {
  const [state, setState] = useState<State<FIIDIIData>>({
    data: null,
    loading: true,
    refreshing: false,
    stale: false,
    error: null,
  });

  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: isFirstLoadRef.current && !s.data,
            refreshing: !isFirstLoadRef.current || Boolean(s.data),
          }));
        }
        const res = await fetch('/api/live-intelligence/market-intel', { cache: 'no-store' });
        const json = await res.json();
        const fii = json?.fiiDii;

        const payload: FIIDIIData = {
          ok: Boolean(fii?.ok),
          date: fii?.date ? String(fii.date) : null,
          fiiNetCr: typeof fii?.fiiNetCr === 'number' ? fii.fiiNetCr : fii?.fiiNetCr != null ? Number(fii.fiiNetCr) : null,
          diiNetCr: typeof fii?.diiNetCr === 'number' ? fii.diiNetCr : fii?.diiNetCr != null ? Number(fii.diiNetCr) : null,
          lastUpdated: json?.lastUpdated || null,
        };

        if (cancelled) return;
        isFirstLoadRef.current = false;
        setState({
          data: payload,
          loading: false,
          refreshing: false,
          stale: false,
          error: json?.error ? String(json.error) : null,
        });
      } catch (e: any) {
        if (cancelled) return;
        isFirstLoadRef.current = false;
        setState((s) => ({
          data: s.data,
          loading: false,
          refreshing: false,
          stale: Boolean(s.data),
          error: 'Data temporarily unavailable',
        }));
      }
    }

    fetchData();
    const id = window.setInterval(fetchData, Math.max(5_000, pollMs));
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return state;
}

export type IndiaVixData = {
  vixLast: number | null;
  vixPct: number | null;
  lastUpdated: string | null;
};

export function useIndiaVIX(pollMs: number = 60_000) {
  const [state, setState] = useState<State<IndiaVixData>>({
    data: null,
    loading: true,
    refreshing: false,
    stale: false,
    error: null,
  });

  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVix() {
      try {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: isFirstLoadRef.current && !s.data,
            refreshing: !isFirstLoadRef.current || Boolean(s.data),
          }));
        }
        const res = await fetch('/api/live-intelligence/indices-snapshot', { cache: 'no-store' });
        const json = await res.json();
        const list = Array.isArray(json?.indices) ? json.indices : [];
        const vix = list.find((x: any) => String(x?.name || '').toUpperCase() === 'INDIA VIX') || null;

        const payload: IndiaVixData = {
          vixLast: typeof vix?.last === 'number' ? vix.last : vix?.last != null ? Number(vix.last) : null,
          vixPct:
            typeof vix?.percentChange === 'number'
              ? vix.percentChange
              : vix?.percentChange != null
                ? Number(vix.percentChange)
                : null,
          lastUpdated: json?.lastUpdated || null,
        };

        if (cancelled) return;
        isFirstLoadRef.current = false;
        setState({
          data: payload,
          loading: false,
          refreshing: false,
          stale: false,
          error: json?.error ? String(json.error) : null,
        });
      } catch {
        if (cancelled) return;
        isFirstLoadRef.current = false;
        setState((s) => ({
          data: s.data,
          loading: false,
          refreshing: false,
          stale: Boolean(s.data),
          error: 'Data temporarily unavailable',
        }));
      }
    }

    fetchVix();
    const id = window.setInterval(fetchVix, Math.max(10_000, pollMs));
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
