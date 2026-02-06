'use client';
import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker - version MUST match pdfjs-dist package version
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;
}

export default function ITRFilingHelp() {
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError(null);
    setResult(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Extract text from ALL pages
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items with spaces
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      // Check if we got text
      if (fullText.trim().length < 50) {
        setError('This PDF appears to be scanned/image-based. Cannot extract text automatically.');
        setExtracting(false);
        return;
      }
      
      // Extract fields
      const fields = extractFields(fullText);
      
      setResult({
        fileName: file.name,
        pages: pdf.numPages,
        textLength: fullText.length,
        fields: fields,
        rawText: fullText.substring(0, 3000) // First 3000 chars
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  function extractFields(text) {
    const fields = {};
    
    // Pattern 1: Gross Salary
    const grossPatterns = [
      /gross\s+salary[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
      /gross\s+total\s+income[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
      /total\s+income[:\s]+(?:rs\.?\s*)?([0-9,]+)/i
    ];
    
    for (const pattern of grossPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].replace(/,/g, '');
        if (value.length >= 4) {
          fields.grossSalary = {
            label: 'Gross Salary',
            value: parseInt(value),
            raw: match[1]
          };
          break;
        }
      }
    }
    
    // Pattern 2: TDS
    const tdsPatterns = [
      /total\s+tds[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
      /tds\s+deducted[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
      /tax\s+deducted[:\s]+(?:rs\.?\s*)?([0-9,]+)/i
    ];
    
    for (const pattern of tdsPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].replace(/,/g, '');
        if (value.length >= 3) {
          fields.tds = {
            label: 'TDS',
            value: parseInt(value),
            raw: match[1]
          };
          break;
        }
      }
    }
    
    // Pattern 3: Net Salary
    const netPatterns = [
      /net\s+salary[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
      /net\s+pay[:\s]+(?:rs\.?\s*)?([0-9,]+)/i
    ];
    
    for (const pattern of netPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].replace(/,/g, '');
        if (value.length >= 4) {
          fields.netSalary = {
            label: 'Net Salary',
            value: parseInt(value),
            raw: match[1]
          };
          break;
        }
      }
    }
    
    return fields;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Free ITR Filing Help</h1>
          <p className="text-gray-400">Upload Form 16, AIS, or Bank Interest Statement</p>
        </div>
        
        {/* Upload */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-8 mb-6">
          <label className="block">
            <div className="border-2 border-dashed border-[#333] rounded-lg p-12 text-center hover:border-[#d4af37] transition cursor-pointer">
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                disabled={extracting}
                className="hidden"
              />
              <p className="text-lg mb-2">
                {extracting ? '🔄 Extracting...' : '📄 Click to upload PDF'}
              </p>
              <p className="text-sm text-gray-500">Form 16, AIS, or Bank Statement</p>
            </div>
          </label>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}
        
        {/* Results */}
        {result && (
          <div className="space-y-6">
            
            {/* Info */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#d4af37]">📊 Extraction Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>File: <span className="text-white">{result.fileName}</span></p>
                <p>Pages: <span className="text-white">{result.pages}</span></p>
                <p>Text extracted: <span className="text-white">{result.textLength.toLocaleString()} characters</span></p>
                <p>Fields found: <span className="text-white">{Object.keys(result.fields).length}</span></p>
              </div>
            </div>
            
            {/* Fields */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#d4af37]">💰 Extracted Fields</h3>
              
              {Object.keys(result.fields).length === 0 ? (
                <div className="bg-yellow-900/20 border border-yellow-500 rounded p-4">
                  <p className="text-yellow-400">⚠️ No fields found automatically</p>
                  <p className="text-sm text-gray-400 mt-2">Check raw text below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(result.fields).map(([key, data]) => (
                    <div key={key} className="flex justify-between items-center border-b border-[#333] pb-3 last:border-0">
                      <div>
                        <p className="font-semibold">{data.label}</p>
                        <p className="text-sm text-gray-400">Raw: {data.raw}</p>
                      </div>
                      <p className="text-2xl font-mono text-[#d4af37]">
                        ₹{data.value.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Raw Text */}
            <details className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <summary className="cursor-pointer font-semibold text-[#d4af37]">
                📄 Raw Text (first 3000 chars)
              </summary>
              <pre className="mt-4 text-xs bg-black p-4 rounded overflow-auto max-h-96 text-gray-300">
                {result.rawText}
              </pre>
            </details>
            
          </div>
        )}
        
        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-[#1a1a1a] border border-[#333] rounded text-sm text-gray-400">
          <p>⚠️ This tool helps prepare a draft. BM Wealth is not a CA or ERI. Final filing is your responsibility.</p>
        </div>
        
      </div>
    </div>
  );
}
