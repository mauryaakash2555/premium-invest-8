/**
 * FILE: app\regulatory-compliance\page.jsx
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

import { FileText, Shield, Scale } from 'lucide-react';
import { useEffect } from 'react';

export default function RegulatoryCompliance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Scale className="w-10 h-10 text-[#C0A062]" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-tight">
            Regulatory Compliance
          </h1>
        </div>

        <div className="space-y-12 opacity-90 leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Our Commitment
            </h2>
            <p className="text-gray-300">
              BM Wealth is dedicated to maintaining the highest standards of regulatory compliance in the financial services industry. Our operations are designed to protect the interests of our distinguished clients through transparency and adherence to legal frameworks.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Compliance Statement
            </h2>
            <p className="text-gray-300">
              We operate as a registered distributor under AMFI guidelines. Our role is to curate and distribute premier investment products while providing execution support and market insights.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              IRDAI Guidelines
            </h2>
            <p className="text-gray-300">
              As an IRDAI-licensed entity, we facilitate access to insurance solutions from providers. Where product discussions occur, they follow disclosure-led processes and are aligned with the protective frameworks mandated by the authority.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Grievance Redressal
            </h2>
            <p className="text-gray-300">
              We maintain a robust mechanism for addressing any client concerns. In the rare event of a grievance, our clients can expect a swift, transparent, and fair resolution process in accordance with regulatory mandates.
            </p>
            <div className="mt-4">
              <p className="text-[#C0A062] font-bold">Principal Compliance Officer:</p>
              <p className="text-gray-400">Brahmdeo Maurya</p>
              <p className="text-gray-400">Email: support@bmwealth.co.in</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-serif text-[#C0A062] border-b border-[#C0A062]/20 pb-2">
              Transparency & Disclosure
            </h2>
            <p className="text-gray-300">
              Transparency is central to our approach. We ensure that material information regarding products, risks, and distribution remuneration is disclosed so users can make informed decisions.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-[#C0A062]/10 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[3px]">
            © 2025 BM Wealth | Regulatory Compliance Framework
          </p>
        </div>
      </div>
    </div>
  );
}

