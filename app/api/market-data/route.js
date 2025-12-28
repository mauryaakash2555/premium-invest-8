import { NextResponse } from 'next/server';

export async function GET() {
  const symbols = {
    NIFTY: '^NSEI',
    SENSEX: '^BSESN',
    GOLD: 'GC=F',
    USDINR: 'INR=X'
  };

  try {
    const results = await Promise.all(
      Object.entries(symbols).map(async ([key, symbol]) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
          { next: { revalidate: 60 } } // Cache for 1 minute
        );
        const data = await res.json();
        const meta = data.chart.result[0].meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
          id: key,
          label: key === 'USDINR' ? 'INR/USD' : (key === 'GOLD' ? 'GOLD (24K)' : key),
          value: price.toLocaleString('en-IN', {
            style: key === 'USDINR' ? 'decimal' : 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
          }),
          change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          isPositive: changePercent >= 0
        };
      })
    );

    // Add a simulated BM Elite Index based on the average performance + a luxury premium
    const avgChange = results.reduce((acc, curr) => acc + parseFloat(curr.change), 0) / results.length;
    results.push({
      id: 'BMELITE',
      label: 'BM ELITE INDEX',
      value: (142.80 + (avgChange * 0.5)).toFixed(2),
      change: `+${(avgChange + 1.2).toFixed(2)}%`,
      isPositive: true
    });

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market data fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}

