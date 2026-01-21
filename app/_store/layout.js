export const metadata = {
  title: {
    default: 'BM Digital Store',
    template: '%s | BM Digital Store',
  },
  description: 'Digital educational PDFs, guides, and tools. For learning purposes only.',
};

export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </div>
    </div>
  );
}
