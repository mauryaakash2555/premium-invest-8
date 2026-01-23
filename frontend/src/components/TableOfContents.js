import { useState, useEffect } from 'react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    
    const headingData = Array.from(h2Elements).map((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent;
      return { id, text };
    });
    
    setHeadings(headingData);

    // Add IDs to actual h2 elements in the DOM
    setTimeout(() => {
      const actualH2s = document.querySelectorAll('article h2');
      actualH2s.forEach((h2, index) => {
        h2.id = `heading-${index}`;
      });
    }, 100);

    // Track active heading on scroll
    const handleScroll = () => {
      const actualH2s = document.querySelectorAll('article h2');
      let current = '';
      
      actualH2s.forEach((h2) => {
        const rect = h2.getBoundingClientRect();
        if (rect.top <= 150) {
          current = h2.id;
        }
      });
      
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div
      style={{
        background: 'color-mix(in oklab, var(--lux-accent) 6%, transparent)',
        border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '40px',
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          color: 'var(--lux-accent)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '24px' }}>📖</span>
        In This Article
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {headings.map((heading) => (
          <li key={heading.id} style={{ marginBottom: '12px' }}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeId === heading.id ? 'var(--lux-accent)' : 'rgba(255,255,255,0.75)',
                fontSize: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: activeId === heading.id ? '600' : '400',
                background: activeId === heading.id ? 'color-mix(in oklab, var(--lux-accent) 10%, transparent)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'color-mix(in oklab, var(--lux-accent) 10%, transparent)';
                e.currentTarget.style.paddingLeft = '16px';
              }}
              onMouseLeave={(e) => {
                if (activeId !== heading.id) {
                  e.currentTarget.style.background = 'transparent';
                }
                e.currentTarget.style.paddingLeft = '12px';
              }}
            >
              <span style={{ color: 'var(--lux-accent)', fontSize: '18px' }}>→</span>
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
