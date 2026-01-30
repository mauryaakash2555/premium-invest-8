import { headers } from 'next/headers';
import Script from 'next/script';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import LayoutShellClient from './layout.shell.client';
import { metadata as mainMetadata, schemaGraph } from './metadata';

function getNormalizedHost(hdrs) {
	const rawHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
	const host = String(rawHost).split(',')[0].trim().toLowerCase();
	const hostNoPort = host.split(':')[0];
	return hostNoPort.startsWith('www.') ? hostNoPort.slice(4) : hostNoPort;
}

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || null;

const playfair = Playfair_Display({
	variable: '--font-playfair',
	subsets: ['latin'],
	display: 'swap',
});

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	display: 'swap',
});

export async function generateMetadata() {
	const hdrs = await headers();
	const normalizedHost = getNormalizedHost(hdrs);
	const isStoreHost = normalizedHost === 'store.bmwealth.co.in';

	if (!isStoreHost) return mainMetadata;

	return {
		metadataBase: new URL('https://store.bmwealth.co.in'),
		title: {
			default: 'BM Digital Store',
			template: '%s | BM Digital Store',
		},
		description: 'Digital educational PDFs and tools. For learning purposes only. Not financial advice.',
		alternates: {
			canonical: 'https://store.bmwealth.co.in',
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}

export default async function RootLayout({ children }) {
	const buildIdRaw = process.env.VERCEL_GIT_COMMIT_SHA || '';
	const buildId = buildIdRaw || 'local';
	const hdrs = await headers();
	const normalizedHost = getNormalizedHost(hdrs);
	const isStoreHost = normalizedHost === 'store.bmwealth.co.in';
	const siteUrl = isStoreHost ? 'https://store.bmwealth.co.in' : 'https://bmwealth.co.in';

	return (
		<html lang="en">
			<head>
				<meta name="x-ui-build" content={buildId} />

				{/*
					Pre-hydration SW/cache reset.
					Fixes hydration mismatches when a stale service worker serves old JS bundles.
				*/}
				<Script id="sw-cache-reset" strategy="beforeInteractive">
					{`
(() => {
	try {
		const url = new URL(window.location.href);
		const params = url.searchParams;

		const doneParam = '__swResetDone';
		const alreadyDone = params.get(doneParam) === '1';
		if (alreadyDone) {
			params.delete(doneParam);
			url.search = params.toString();
			try {
				window.history.replaceState(null, '', url.toString());
			} catch {}
		} else {
			let buildMeta = '';
			try {
				const el = document.querySelector('meta[name="x-ui-build"]');
				buildMeta = (el && el.getAttribute('content')) || '';
			} catch {}

			let buildChanged = false;
			let prevBuild = '';
			try {
				if (buildMeta && window.localStorage) {
					const buildKey = '__bmw_ui_build_v1';
					prevBuild = localStorage.getItem(buildKey) || '';
					if (prevBuild && prevBuild !== buildMeta) buildChanged = true;
					localStorage.setItem(buildKey, buildMeta);
				}
			} catch {}

			let hasController = false;
			try {
				hasController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
			} catch {}

			const firstSeenBuildWithSW = !!buildMeta && !prevBuild && hasController;

			const force =
				params.get('resetSW') === '1' ||
				params.get('reset-sw') === '1' ||
				params.has('resetSW') ||
				params.has('reset-sw');

			const isLocalHost =
				window.location.hostname === 'localhost' ||
				window.location.hostname === '127.0.0.1';

			// Localhost/dev can still hit stale cached HTML/chunks (often from an old SW or browser cache),
			// which can surface as webpack runtime errors like:
			//   TypeError: Cannot read properties of undefined (reading 'call')
			// We only trigger a reload if we actually deleted caches/unregistered SW.
			const shouldRun = !!(force || buildChanged || firstSeenBuildWithSW || isLocalHost);

			const flagKey = '__bmw_sw_reset_done_v2:' + (buildMeta || 'no-build');
			const alreadyRan = !!(!force && window.sessionStorage && sessionStorage.getItem(flagKey) === '1');

			if (shouldRun && !alreadyRan) {
				let didWork = false;
				const tasks = [];
				const devHardKey = '__bmw_dev_hard_reload_v1';
				let shouldDevHardReload = false;
				try {
					shouldDevHardReload =
						isLocalHost &&
						!!window.sessionStorage &&
						sessionStorage.getItem(devHardKey) !== '1';
				} catch {}

				if ('serviceWorker' in navigator) {
					tasks.push(
						navigator.serviceWorker
							.getRegistrations()
							.then((regs) => {
								if (regs && regs.length) didWork = true;
								return Promise.all(
									(regs || []).map((r) => {
										try {
											return r.unregister();
										} catch {
											return Promise.resolve();
										}
									})
								);
							})
							.catch(() => {})
					);
				}

				if ('caches' in window) {
					tasks.push(
						caches
							.keys()
							.then((keys) => {
								if (keys && keys.length) didWork = true;
								return Promise.all(
									(keys || []).map((k) => {
										try {
											return caches.delete(k);
										} catch {
											return Promise.resolve();
										}
									})
								);
							})
							.catch(() => {})
					);
				}

				Promise.all(tasks).finally(() => {
						try {
							if (window.sessionStorage) sessionStorage.setItem(flagKey, '1');
						} catch {}

						// Even if there is no SW/cache to delete, a deploy can leave the browser holding
						// stale JS chunks (HTML/chunk mismatch). A one-time cache-busting reload fixes it.
						const doReload =
							didWork ||
							shouldDevHardReload ||
							force ||
							buildChanged ||
							firstSeenBuildWithSW;
						if (!doReload) return;
						try {
							if (shouldDevHardReload && window.sessionStorage) {
								sessionStorage.setItem(devHardKey, '1');
							}
						} catch {}
						params.delete('resetSW');
						params.delete('reset-sw');
						params.set(doneParam, '1');
						url.search = params.toString();
						window.location.replace(url.toString());
				});
			}
		}
	} catch {
		// ignore
	}
})();
					`}
				</Script>

				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="theme-color" content="#090A0C" />

				{/* JSON-LD (server-rendered to avoid hydration mismatch) */}
				{!isStoreHost && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph(siteUrl)) }}
					/>
				)}

				{/* CueLinks Affiliate Tracking (cId: 257199) — main site only */}
				{!isStoreHost && (
					<Script id="cuelinks" strategy="afterInteractive">
						{`
var cId =  "257199";

(function(d, t) {
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.async = true;
	s.src = (document.location.protocol == "https:" ? "https://cdn0.cuelinks.com/js/" : "http://cdn0.cuelinks.com/js/")  + "cuelinksv2.js";
	document.getElementsByTagName("body")[0].appendChild(s);
}());
						`}
					</Script>
				)}

{/* Ahrefs Analytics */}
          <Script
			              src="https://analytics.ahrefs.com/analytics.js"
							              data-key="OlyusN83yhRyxxfJXgqKSg"
											              strategy="afterInteractive"
															            />
			</head>
			<body
				className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
				style={{
					backgroundColor: '#000',
					color: '#fff',
					margin: 0,
					overflowX: 'hidden',
					maxWidth: '100%',
					width: '100%',
				}}
			>
				<LayoutShellClient
					isStoreHost={isStoreHost}
					buildId={buildId}
					measurementId={GA4_MEASUREMENT_ID}
				>
					{children}
				</LayoutShellClient>
			</body>
		</html>
	);
}
