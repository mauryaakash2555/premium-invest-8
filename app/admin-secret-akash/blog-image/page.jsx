/**
 * Blog Image Generator Tool
 * 
 * Super easy interface:
 * 1. Paste your blog content
 * 2. Click Generate
 * 3. Get a unique, high-quality image
 * 
 * Features:
 * - AI keyword extraction
 * - Unsplash integration (free)
 * - No image reuse
 * - One-click copy URL
 */

'use client';

import { useState, useCallback } from 'react';

export default function BlogImageGeneratorPage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [markAsUsed, setMarkAsUsed] = useState(true);

  const generateImage = useCallback(async () => {
    if (!content.trim() || content.trim().length < 50) {
      setError('Please paste blog content (at least 50 characters)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/blog-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim(),
          markAsUsed,
          preferHighQuality: true
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to generate image');
        return;
      }

      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [content, title, markAsUsed]);

  const copyUrl = useCallback(async () => {
    if (!result?.image?.url) return;
    
    try {
      await navigator.clipboard.writeText(result.image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = result.image.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const copyJsonSnippet = useCallback(async () => {
    if (!result?.image?.url) return;
    
    const snippet = `"imageUrl": "${result.image.url}"`;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const reset = () => {
    setContent('');
    setTitle('');
    setResult(null);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🖼️ Blog Image Generator</h1>
        <p style={styles.subtitle}>Paste your blog → Get unique high-quality image</p>
      </header>

      <div style={styles.main}>
        {/* Input Section */}
        <div style={styles.inputSection}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Blog Title (optional, helps find better images)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How Regular Mutual Fund Plans Cost Mumbai Investor ₹47 Lakh"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Blog Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your entire blog content here...

The system will:
1. Extract key themes and keywords
2. Search Unsplash for matching high-quality images
3. Ensure the image hasn't been used before
4. Give you the perfect unique image URL

Supports plain text or HTML content."
              style={styles.textarea}
              rows={12}
            />
            <div style={styles.charCount}>
              {content.length} characters {content.length < 50 && '(need 50+)'}
            </div>
          </div>

          <div style={styles.optionRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={markAsUsed}
                onChange={(e) => setMarkAsUsed(e.target.checked)}
                style={styles.checkbox}
              />
              Mark image as used (prevents reuse on future blogs)
            </label>
          </div>

          <div style={styles.buttonRow}>
            <button
              onClick={generateImage}
              disabled={loading || content.length < 50}
              style={{
                ...styles.primaryButton,
                opacity: loading || content.length < 50 ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Analyzing & Searching...' : '✨ Generate Image'}
            </button>
            
            {(content || result) && (
              <button onClick={reset} style={styles.secondaryButton}>
                🔄 Start Over
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Result Section */}
        {result && result.image && (
          <div style={styles.resultSection}>
            <h2 style={styles.resultTitle}>✅ Image Found!</h2>
            
            {/* Image Preview */}
            <div style={styles.imagePreview}>
              <img
                src={result.image.urls?.thumbnail || result.image.url}
                alt={result.image.description || 'Generated blog image'}
                style={styles.previewImage}
              />
            </div>

            {/* Image Details */}
            <div style={styles.imageDetails}>
              <div style={styles.detailRow}>
                <strong>Strategy:</strong> {result.image.strategy}
              </div>
              {result.image.searchQuery && (
                <div style={styles.detailRow}>
                  <strong>Search Query:</strong> {result.image.searchQuery}
                </div>
              )}
              {result.image.photographer && (
                <div style={styles.detailRow}>
                  <strong>Photographer:</strong>{' '}
                  <a 
                    href={result.image.photographer.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    {result.image.photographer.name}
                  </a>
                </div>
              )}
            </div>

            {/* URL Section */}
            <div style={styles.urlSection}>
              <label style={styles.label}>Image URL (ready to use in blog.json)</label>
              <div style={styles.urlBox}>
                <input
                  type="text"
                  value={result.image.url}
                  readOnly
                  style={styles.urlInput}
                />
                <button onClick={copyUrl} style={styles.copyButton}>
                  {copied ? '✅ Copied!' : '📋 Copy URL'}
                </button>
              </div>
              
              <button onClick={copyJsonSnippet} style={styles.jsonButton}>
                📝 Copy as JSON: "imageUrl": "..."
              </button>
            </div>

            {/* Analysis Info */}
            {result.analysis && (
              <div style={styles.analysisSection}>
                <h3 style={styles.analysisTitle}>🔍 Content Analysis</h3>
                <div style={styles.analysisGrid}>
                  <div style={styles.analysisItem}>
                    <strong>Theme:</strong> {result.analysis.theme}
                  </div>
                  <div style={styles.analysisItem}>
                    <strong>Mood:</strong> {result.analysis.mood}
                  </div>
                  <div style={styles.analysisItem}>
                    <strong>Keywords:</strong> {result.analysis.keywords?.slice(0, 5).join(', ')}
                  </div>
                  <div style={styles.analysisItem}>
                    <strong>Visual Terms:</strong> {result.analysis.visualTerms?.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Attribution */}
            {result.image.attributionHtml && (
              <div style={styles.attribution}>
                <small>
                  📸 Attribution:{' '}
                  <span dangerouslySetInnerHTML={{ __html: result.image.attributionHtml }} />
                </small>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <h3>📖 How It Works</h3>
          <ol style={styles.instructionList}>
            <li><strong>Paste Content:</strong> Copy your entire blog post and paste it above</li>
            <li><strong>Add Title:</strong> Optionally add the blog title for better keyword extraction</li>
            <li><strong>Generate:</strong> Click the button and wait ~2-3 seconds</li>
            <li><strong>Get URL:</strong> Copy the unique image URL to use in blog.json</li>
          </ol>
          
          <h3>🎯 What Makes It Smart</h3>
          <ul style={styles.instructionList}>
            <li><strong>AI Keyword Extraction:</strong> Analyzes your content for key themes</li>
            <li><strong>No Duplicates:</strong> Tracks all used images - never repeats</li>
            <li><strong>High Quality First:</strong> Always tries best quality images first</li>
            <li><strong>Multiple Fallbacks:</strong> 4 search strategies ensure you always get an image</li>
            <li><strong>Free Forever:</strong> Uses Unsplash (free unlimited images)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e5e5e5',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(192, 160, 98, 0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#C0A062',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#888',
    margin: 0
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  inputSection: {
    backgroundColor: '#141414',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#C0A062',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '200px',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
    textAlign: 'right'
  },
  optionRow: {
    marginBottom: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#888',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  primaryButton: {
    padding: '14px 28px',
    backgroundColor: '#C0A062',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  secondaryButton: {
    padding: '14px 28px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  errorBox: {
    backgroundColor: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#ff6b6b'
  },
  resultSection: {
    backgroundColor: '#141414',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid rgba(192, 160, 98, 0.3)'
  },
  resultTitle: {
    fontSize: '20px',
    color: '#C0A062',
    margin: '0 0 20px 0'
  },
  imagePreview: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a'
  },
  previewImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  imageDetails: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px'
  },
  detailRow: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '8px'
  },
  link: {
    color: '#C0A062',
    textDecoration: 'none'
  },
  urlSection: {
    marginBottom: '20px'
  },
  urlBox: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  urlInput: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontSize: '13px',
    fontFamily: 'monospace'
  },
  copyButton: {
    padding: '12px 20px',
    backgroundColor: '#C0A062',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  jsonButton: {
    padding: '10px 16px',
    backgroundColor: '#2a2a2a',
    color: '#C0A062',
    border: '1px solid #C0A062',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  analysisSection: {
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  analysisTitle: {
    fontSize: '14px',
    color: '#C0A062',
    margin: '0 0 12px 0'
  },
  analysisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  analysisItem: {
    fontSize: '13px',
    color: '#888'
  },
  attribution: {
    fontSize: '12px',
    color: '#666',
    padding: '12px',
    backgroundColor: '#1a1a1a',
    borderRadius: '6px'
  },
  instructions: {
    backgroundColor: '#141414',
    padding: '24px',
    borderRadius: '12px',
    marginTop: '24px'
  },
  instructionList: {
    color: '#888',
    lineHeight: '1.8',
    paddingLeft: '20px'
  }
};
