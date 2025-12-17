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
        background: 'rgba(192, 160, 98, 0.05)',
        border: '1px solid rgba(192, 160, 98, 0.2)',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '40px',
      }}
    >
      <h3
        style={{
          fontSize: '22px',
          color: '#DAA520',
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
                color: activeId === heading.id ? '#DAA520' : '#C0A062',
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
                background: activeId === heading.id ? 'rgba(218, 165, 32, 0.1)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(218, 165, 32, 0.1)';
                e.currentTarget.style.paddingLeft = '16px';
              }}
              onMouseLeave={(e) => {
                if (activeId !== heading.id) {
                  e.currentTarget.style.background = 'transparent';
                }
                e.currentTarget.style.paddingLeft = '12px';
              }}
            >
              <span style={{ color: '#DAA520', fontSize: '18px' }}>→</span>
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
