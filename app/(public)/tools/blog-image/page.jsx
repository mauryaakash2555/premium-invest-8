/**
 * Public Blog Image Generator Tool
 * 
 * Anyone can use this to generate unique blog images
 * No authentication required
 * 
 * Route: /tools/blog-image
 */

'use client';

import { useState, useCallback } from 'react';

export default function PublicBlogImageGenerator() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
          markAsUsed: false, // Public users don't mark as used
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
  }, [content, title]);

  const copyUrl = useCallback(async () => {
    if (!result?.image?.url) return;
    
    try {
      await navigator.clipboard.writeText(result.image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-6">
      {/* Header */}
      <header className="text-center mb-8 pb-6 border-b border-[#C0A062]/30">
        <h1 className="text-3xl font-bold text-[#C0A062] mb-2">
          🖼️ Blog Image Generator
        </h1>
        <p className="text-gray-500">
          Paste your blog content → Get a unique high-quality image
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        {/* Input Card */}
        <div className="bg-[#141414] rounded-xl p-6 mb-6">
          {/* Title Input */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#C0A062] mb-2">
              Blog Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Building Wealth 101: A Beginner's Guide"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-[#e5e5e5] placeholder-gray-600 focus:border-[#C0A062] focus:outline-none"
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#C0A062] mb-2">
              Blog Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your entire blog content here...

The AI will:
✓ Extract key themes and keywords
✓ Search for high-quality matching images  
✓ Return a unique image URL

Works with plain text or HTML content."
              rows={10}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-[#e5e5e5] placeholder-gray-600 focus:border-[#C0A062] focus:outline-none resize-y min-h-[200px]"
            />
            <div className="text-xs text-gray-600 mt-1 text-right">
              {content.length} characters {content.length < 50 && '(minimum 50)'}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={loading || content.length < 50}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all
              ${loading || content.length < 50 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[#C0A062] text-[#0a0a0a] hover:bg-[#d4b06e] cursor-pointer'
              }`}
          >
            {loading ? '⏳ Analyzing Content...' : '✨ Generate Image'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <span className="text-red-400">❌ {error}</span>
          </div>
        )}

        {/* Result Card */}
        {result && result.image && (
          <div className="bg-[#141414] rounded-xl p-6 border border-[#C0A062]/30">
            <h2 className="text-xl font-semibold text-[#C0A062] mb-4">
              ✅ Perfect Image Found!
            </h2>

            {/* Image Preview */}
            <div className="rounded-lg overflow-hidden mb-5 bg-[#0a0a0a]">
              <img
                src={result.image.urls?.thumbnail || result.image.url}
                alt={result.image.description || 'Generated image'}
                className="w-full h-auto"
              />
            </div>

            {/* Image URL */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#C0A062] mb-2">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={result.image.url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-[#e5e5e5] font-mono text-sm"
                />
                <button
                  onClick={copyUrl}
                  className="px-6 py-3 bg-[#C0A062] text-[#0a0a0a] rounded-lg font-semibold whitespace-nowrap hover:bg-[#d4b06e] transition-colors"
                >
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Analysis Summary */}
            {result.analysis && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-[#C0A062] mb-3">
                  🔍 Content Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Theme:</span>{' '}
                    <span className="text-[#e5e5e5] capitalize">{result.analysis.theme}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mood:</span>{' '}
                    <span className="text-[#e5e5e5] capitalize">{result.analysis.mood}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Keywords:</span>{' '}
                    <span className="text-[#e5e5e5]">
                      {result.analysis.keywords?.slice(0, 5).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Attribution */}
            {result.image.photographer && (
              <div className="text-xs text-gray-500 border-t border-[#333] pt-4">
                📸 Photo by{' '}
                <a
                  href={result.image.photographer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C0A062] hover:underline"
                >
                  {result.image.photographer.name}
                </a>{' '}
                on{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C0A062] hover:underline"
                >
                  Unsplash
                </a>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Unsplash • Free unlimited images • AI keyword extraction</p>
        </div>
      </main>
    </div>
  );
}
