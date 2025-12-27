// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function PlatformsLayout({ children }) {
  return children;
}

