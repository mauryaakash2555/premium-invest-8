export const metadata = {
  title: {
    default: 'BM Digital Store',
    template: '%s | BM Digital Store',
  },
  description: 'Digital educational PDFs and tools. For learning purposes only.',
};

import StoreNavigation from '@/components/store/StoreNavigation';
import StoreFooter from '@/components/store/StoreFooter';

export default function StoreLayout({ children }) {
  const themeStyle = {
    '--lux-background': 'oklch(0.06 0.005 280)',
    '--lux-foreground': 'oklch(0.95 0.01 85)',
    '--lux-foreground-80': 'oklch(0.95 0.01 85 / 0.80)',
    '--lux-foreground-60': 'oklch(0.95 0.01 85 / 0.60)',
    '--lux-foreground-40': 'oklch(0.95 0.01 85 / 0.40)',
    '--lux-foreground-10': 'oklch(0.95 0.01 85 / 0.10)',
    '--lux-card': 'oklch(0.10 0.005 280)',
    '--lux-muted': 'oklch(0.55 0.01 85)',
    '--lux-accent': 'oklch(0.78 0.08 65)',
  };

  return (
    <div style={themeStyle} className="min-h-screen bg-[var(--lux-background)] text-[color:var(--lux-foreground)]">
      <StoreNavigation />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-10">{children}</div>
      <StoreFooter />
    </div>
  );
}
