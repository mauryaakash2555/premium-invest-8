export { metadata } from './metadata';

import RootLayoutClient from './layout.client';

export default function RootLayout({ children }) {
	const buildId = process.env.VERCEL_GIT_COMMIT_SHA || '';
	return <RootLayoutClient buildId={buildId}>{children}</RootLayoutClient>;
}
