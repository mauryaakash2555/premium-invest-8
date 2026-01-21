export const metadata = {
  title: {
    default: 'BM Digital Store',
    template: '%s | BM Digital Store',
  },
  description: 'Digital educational PDFs and tools. For learning purposes only. Not financial advice.',
};

import StoreNavigation from '@/components/store/StoreNavigation';
import StoreFooter from '@/components/store/StoreFooter';

export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <StoreNavigation />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
      <StoreFooter />
    </div>
  );
}
