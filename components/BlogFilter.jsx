'use client';

const filters = [
  { id: 'all', name: 'All Posts' },
  { id: 'editorial', name: 'BM Editorial' },
  { id: 'impact', name: 'Community Impact' },
  { id: 'guest', name: 'Guest Columns' },
  { id: 'dev', name: 'Dev Writes' },
];

export default function BlogFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex justify-center gap-3 mb-8 flex-wrap">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className="px-5 py-2 transition-all"
            style={{
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.14)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                : 'transparent',
              color: isActive ? 'rgba(245,245,245,0.92)' : '#9ca3af',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 600,
              backdropFilter: isActive ? 'blur(10px)' : undefined,
              WebkitBackdropFilter: isActive ? 'blur(10px)' : undefined,
            }}
          >
            {f.name}
          </button>
        );
      })}
    </div>
  );
}
