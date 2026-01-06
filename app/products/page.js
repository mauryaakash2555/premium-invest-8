/**
 * FILE: app\products\page.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - @/data/products.json
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

import products from "@/data/products.json";

export const metadata = {
  title: "Products",
  description: "Demo product listing for BM Wealth Next.",
};

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Offerings</p>
        <h1 className="text-3xl font-semibold text-white">Products</h1>
        <p className="text-sm text-slate-200/80">
          Swap these placeholders for your real product catalogue or CMS feed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
                  {product.category}
                </p>
                <h2 className="text-xl font-semibold text-white">{product.name}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                {product.risk} risk
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-200/80">{product.description}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-100">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1">
                {product.expectedReturn}
              </span>
              <span className="rounded-full bg-blue-500/15 px-3 py-1">{product.aum}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

