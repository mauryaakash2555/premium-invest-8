'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// PDF GENERATION UTILITY
// Generates daily market summary PDFs with QR code for tracking
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a Daily Summary PDF with QR code
 * Uses jspdf for PDF generation and qrcode for tracking
 * 
 * @param {Object} options - PDF generation options
 * @param {Object} options.summary - Night summary data
 * @param {Array} options.headlines - Array of headline objects
 * @returns {Promise<Blob>} - PDF blob for download
 */
export async function generateDailySummaryPDF({ summary, headlines = [] }) {
  // Dynamic imports to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  const QRCode = await import('qrcode');
  
  // Create PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // UTM tracked URL for QR code
  const trackingUrl = 'https://www.bmwealth.co.in?utm_source=pdf&utm_medium=qr_code&utm_campaign=daily_summary';
  
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
    width: 100,
    margin: 1,
    color: {
      dark: '#1a2030',
      light: '#ffffff',
    },
  });
  
  // ═══════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════
  doc.setFillColor(15, 20, 30);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(100, 160, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('BM Wealth', margin, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(180, 195, 230);
  doc.setFont(undefined, 'normal');
  doc.text('Daily Market Summary', margin, 32);
  
  doc.setFontSize(10);
  doc.setTextColor(140, 160, 200);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(dateStr, margin, 40);
  
  yPos = 55;
  
  // ═══════════════════════════════════════════════
  // MARKET OVERVIEW
  // ═══════════════════════════════════════════════
  doc.setTextColor(60, 60, 80);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('📊 Market Overview', margin, yPos);
  yPos += 10;
  
  if (summary?.markets) {
    const markets = summary.markets;
    const marketData = [
      { name: 'NIFTY 50', value: markets.nifty?.value, change: markets.nifty?.percent },
      { name: 'SENSEX', value: markets.sensex?.value, change: markets.sensex?.percent },
      { name: 'Bank NIFTY', value: markets.bankNifty?.value, change: markets.bankNifty?.percent },
    ];
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    marketData.forEach(({ name, value, change }) => {
      doc.setTextColor(40, 45, 60);
      doc.text(`${name}: ${value?.toLocaleString() || 'N/A'}`, margin, yPos);
      
      if (change !== undefined) {
        doc.setTextColor(change >= 0 ? 34 : 220, change >= 0 ? 139 : 53, change >= 0 ? 34 : 69);
        doc.text(`(${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`, margin + 60, yPos);
      }
      yPos += 7;
    });
    
    // FII/DII
    if (markets.fii) {
      yPos += 3;
      doc.setTextColor(40, 45, 60);
      doc.text(`FII Activity: ${markets.fii.type === 'buyer' ? 'Net Buyers' : 'Net Sellers'} ₹${Math.abs(markets.fii.value)} Cr`, margin, yPos);
      yPos += 7;
    }
  }
  
  yPos += 10;
  
  // ═══════════════════════════════════════════════
  // KEY HEADLINES
  // ═══════════════════════════════════════════════
  if (headlines.length > 0) {
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('📰 Key Headlines', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    headlines.slice(0, 6).forEach((headline, i) => {
      doc.setTextColor(40, 45, 60);
      
      // Split long headlines
      const lines = doc.splitTextToSize(`${i + 1}. ${headline.headline}`, contentWidth);
      lines.forEach((line, j) => {
        if (yPos < 260) {
          doc.text(line, margin, yPos);
          yPos += 6;
        }
      });
      
      if (headline.whyItMatters && yPos < 255) {
        doc.setTextColor(100, 110, 130);
        doc.setFontSize(9);
        const whyLines = doc.splitTextToSize(`→ ${headline.whyItMatters}`, contentWidth - 5);
        whyLines.forEach((line) => {
          if (yPos < 260) {
            doc.text(line, margin + 3, yPos);
            yPos += 5;
          }
        });
        doc.setFontSize(10);
      }
      yPos += 3;
    });
  }
  
  // ═══════════════════════════════════════════════
  // FOOTER WITH QR CODE
  // ═══════════════════════════════════════════════
  doc.setFillColor(15, 20, 30);
  doc.rect(0, 270, pageWidth, 30, 'F');
  
  // QR Code
  doc.addImage(qrDataUrl, 'PNG', margin, 272, 22, 22);
  
  // CTA Text
  doc.setTextColor(140, 190, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Scan for Live Updates', margin + 28, 280);
  
  doc.setTextColor(180, 195, 230);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Access real-time market intelligence at bmwealth.co.in', margin + 28, 287);

  doc.setTextColor(140, 160, 200);
  doc.setFontSize(8);
  doc.text('Education-only. Not investment advice.', margin + 28, 293);
  
  // Branding
  doc.setTextColor(100, 160, 255);
  doc.setFontSize(10);
  doc.text('BM Wealth', pageWidth - margin - 25, 285);
  doc.setTextColor(140, 160, 200);
  doc.setFontSize(8);
  doc.text('+91 8850977259', pageWidth - margin - 25, 291);
  
  // Return as blob
  return doc.output('blob');
}

/**
 * Download PDF helper
 */
export async function downloadDailySummaryPDF(options) {
  try {
    const blob = await generateDailySummaryPDF(options);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `BM_Wealth_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
}
