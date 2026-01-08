/**
 * FILE: app\legal-disclosures\page.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - lucide-react
 * - react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { ShieldCheck, Info, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { getBodyTextPaletteStyles } from '@/lib/ui/bodyTextPaletteStyles';

const BODY_TEXT_STYLES = getBodyTextPaletteStyles({ scopeSelector: '.bp-body' });

export default function LegalDisclosures() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 font-inter">
      <style dangerouslySetInnerHTML={{ __html: BODY_TEXT_STYLES }} />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <ShieldCheck className="w-10 h-10 text-[#C0A062]" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-tight">
            Legal Disclosures
          </h1>
        </div>

        <div className="bp-body space-y-12 opacity-90 leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Registration & Licensing
            </h2>
            <p className="text-gray-300">
              BM Wealth is a premier wealth distribution firm based in Mumbai. We operate in strict accordance with the regulatory frameworks established by the Association of Mutual Funds in India (AMFI) and the Insurance Regulatory and Development Authority of India (IRDAI).
            </p>
            <ul className="list-none p-0 space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-[#C0A062] font-bold">ARN:</span>
                <span>AMFI Registered Mutual Fund Distributor (ARN-90008)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#C0A062] font-bold">IRDAI:</span>
                <span>Licensed Insurance Corporate Agent (IRDAI-277925)</span>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Distribution Remuneration
            </h2>
            <p className="text-gray-300">
              In accordance with industry standards and regulatory guidelines, BM Wealth receives remuneration from Asset Management Companies (AMCs) and Insurance Providers for the distribution of financial products.
            </p>
            <p className="text-gray-400 text-sm italic">
              "Distribution remuneration as per industry standards. Specific details regarding commission structures are available upon request for our distinguished clients."
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Market Dynamics & Risk
            </h2>
            <p className="text-gray-300">
              Investment products are subject to market dynamics. Performance data, where provided, represents historical outcomes and is not a guarantee of future results.
            </p>
            <div className="bg-[#C0A062]/5 border-l-4 border-[#C0A062] p-6 rounded-r-lg italic text-gray-400">
              "Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before committing capital. BM Wealth serves as a facilitator and distributor, providing access to premier investment vehicles."
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Confidentiality & Integrity
            </h2>
            <p className="text-gray-300">
              The security of our clients' financial data is of paramount importance. We maintain the highest standards of data protection and professional integrity in all our interactions.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-[#C0A062]/10 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[3px]">
            © 2025 BM Wealth | Mumbai, Maharashtra
          </p>
        </div>
      </div>
    </div>
  );
}

