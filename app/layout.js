import RootLayoutClient from './layout.client';
import { headers } from 'next/headers';
import { metadata as mainMetadata } from './metadata';

function getNormalizedHost(hdrs) {
	const rawHost = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
	const host = String(rawHost).split(',')[0].trim().toLowerCase();
	const hostNoPort = host.split(':')[0];
	return hostNoPort.startsWith('www.') ? hostNoPort.slice(4) : hostNoPort;
}

export function generateMetadata() {
	const hdrs = headers();
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

export default function RootLayout({ children }) {
	const buildId = process.env.VERCEL_GIT_COMMIT_SHA || '';
	const hdrs = headers();
	const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
	return (
		<RootLayoutClient buildId={buildId} host={host}>
			{children}
		</RootLayoutClient>
	);
}
