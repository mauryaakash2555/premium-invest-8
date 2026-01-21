export default function InvestmentPlatforms() {
  return (
    <main className="min-h-screen bg-black">
      {/* HERO */}
      <section className="relative h-[60vh] bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-[url('/mumbai-skyline.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
          <div>
            <h1 className="text-6xl font-serif text-amber-400 mb-4">Investment Platforms</h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Curated platforms used by Mumbai&apos;s discerning investors. Vetted for integrity,
              performance, and institutional-grade execution.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* DISCLOSURE */}
        <div className="bg-amber-900/20 border-l-4 border-amber-400 p-6 rounded-r-lg mb-16">
          <p className="text-sm text-gray-300">
            <span className="text-amber-400 font-semibold">Transparency Notice:</span> We maintain
            affiliate relationships with select platforms. These partnerships enable us to provide
            complimentary research to our community. All recommendations are merit-based.
          </p>
        </div>

        {/* TRADING PLATFORMS */}
        <section className="mb-24">
          <h2 className="text-4xl font-serif text-white mb-12 text-center">
            Trading &amp; Brokerage
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ZERODHA */}
            <div className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">Z</div>
                <p className="text-blue-100 text-sm">MOST TRUSTED</p>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Zerodha</h3>
                <p className="text-gray-400 text-sm mb-6">India&apos;s largest broker. 1+ Crore active clients.</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">₹0 Equity Delivery</p>
                      <p className="text-gray-500 text-xs">No brokerage on holdings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">Kite Platform</p>
                      <p className="text-gray-500 text-xs">Award-winning interface</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">Flat ₹20</p>
                      <p className="text-gray-500 text-xs">Intraday &amp; F&amp;O</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://zerodha.com/open-account"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                  data-cuelinks-id="platforms-zerodha"
                  target="_blank"
                  rel="noopener"
                >
                  Open Free Account →
                </a>
                <p className="text-center text-xs text-gray-500 mt-3">Paperless signup • Active in 24 hours</p>
              </div>
            </div>

            {/* ANGEL ONE */}
            <div className="group bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-amber-500/50 rounded-2xl overflow-hidden hover:border-amber-400 transition-all">
              <div className="bg-gradient-to-br from-orange-600 to-pink-600 p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">A</div>
                <p className="text-orange-100 text-sm">AI-POWERED</p>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Angel One</h3>
                <p className="text-gray-400 text-sm mb-6">Smart platform with AI advisory. 2+ Crore investors.</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">ARQ AI Engine</p>
                      <p className="text-gray-500 text-xs">Personalized recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">Super App</p>
                      <p className="text-gray-500 text-xs">Stocks, MF, IPO, Insurance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">5-Minute Setup</p>
                      <p className="text-gray-500 text-xs">Instant account opening</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.angelone.in/open-demat-account"
                  className="block w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/30 transition-all"
                  data-cuelinks-id="platforms-angelone"
                  target="_blank"
                  rel="noopener"
                >
                  Start Investing →
                </a>
                <p className="text-center text-xs text-gray-500 mt-3">Video KYC • Most user-friendly</p>
              </div>
            </div>

            {/* GROWW */}
            <div className="group bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">G</div>
                <p className="text-green-100 text-sm">BEGINNER FRIENDLY</p>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Groww</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Simple investing. 5+ Crore users. Perfect for beginners.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">Clean Interface</p>
                      <p className="text-gray-500 text-xs">Most intuitive platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">All Products</p>
                      <p className="text-gray-500 text-xs">Stocks, MF, IPO, Gold, US Stocks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <div>
                      <p className="text-white text-sm font-medium">Zero Fees</p>
                      <p className="text-gray-500 text-xs">No account opening charges</p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://groww.in/open-demat-account"
                  className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 transition-all"
                  data-cuelinks-id="platforms-groww"
                  target="_blank"
                  rel="noopener"
                >
                  Get Started Free →
                </a>
                <p className="text-center text-xs text-gray-500 mt-3">Perfect for beginners • 4.5★ rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* HIGH COMMISSION BANKING */}
        <section className="mb-24">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💳</div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Premium Banking</h2>
                <p className="text-purple-300">High-commission opportunities • ₹525-1,485 per signup</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AU BANK CREDIT CARD - ₹1,485 */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-2xl">
                <p className="text-xs font-bold">₹1,485 COMMISSION</p>
              </div>

              <div className="bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-2 border-purple-500/30 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-white mb-3">AU Bank Credit Card</h3>
                <p className="text-purple-300 mb-6">Lifetime FREE • ₹2,000 Welcome Bonus</p>

                <div className="space-y-2 mb-8 text-gray-300 text-sm">
                  <p>✦ Lifetime FREE (₹0 annual fee)</p>
                  <p>✦ Welcome bonus worth ₹2,000</p>
                  <p>✦ 4X rewards on online shopping</p>
                  <p>✦ 1% cashback on all spends</p>
                  <p>✦ Instant digital approval</p>
                </div>

                <a
                  href="https://www.aubank.in/credit-card-apply"
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                  data-cuelinks-id="platforms-aubank-creditcard"
                  target="_blank"
                  rel="noopener"
                >
                  Apply for Premium Card →
                </a>
              </div>
            </div>

            {/* AU SAVINGS - ₹525 */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full shadow-2xl">
                <p className="text-xs font-bold">₹525 COMMISSION</p>
              </div>

              <div className="bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border-2 border-blue-500/30 rounded-2xl p-8">
                <h3 className="text-3xl font-bold text-white mb-3">AU Savings Account</h3>
                <p className="text-blue-300 mb-6">Zero Balance • Up to 7% Interest</p>

                <div className="space-y-2 mb-8 text-gray-300 text-sm">
                  <p>✦ Up to 7% p.a. interest rate</p>
                  <p>✦ Zero minimum balance</p>
                  <p>✦ Free debit card &amp; cheque book</p>
                  <p>✦ 100% digital account opening</p>
                  <p>✦ Active in 5 minutes</p>
                </div>

                <a
                  href="https://www.aubank.in/savings-account-online"
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all"
                  data-cuelinks-id="platforms-aubank-savings"
                  target="_blank"
                  rel="noopener"
                >
                  Open Digital Account →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* INSURANCE */}
        <section>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">PolicyBazaar</h3>
                <p className="text-gray-400">Compare insurance • ₹200-400 per lead</p>
              </div>
              <div className="text-5xl">🛡️</div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/40 rounded-xl p-6">
                <p className="text-white font-semibold mb-2">Term Insurance</p>
                <p className="text-gray-400 text-sm">₹1Cr cover from ₹490/month</p>
              </div>
              <div className="bg-black/40 rounded-xl p-6">
                <p className="text-white font-semibold mb-2">Health Insurance</p>
                <p className="text-gray-400 text-sm">Family floater from ₹8,000/year</p>
              </div>
              <div className="bg-black/40 rounded-xl p-6">
                <p className="text-white font-semibold mb-2">Car Insurance</p>
                <p className="text-gray-400 text-sm">Save up to 85% on premiums</p>
              </div>
            </div>

            <a
              href="https://www.policybazaar.com"
              className="block w-2/3 mx-auto bg-gradient-to-r from-red-600 to-orange-600 text-white text-center py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-red-500/30 transition-all"
              data-cuelinks-id="platforms-policybazaar"
              target="_blank"
              rel="noopener"
            >
              Compare Insurance →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
