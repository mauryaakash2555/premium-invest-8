"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Percent, Plus, Receipt, Shield, TrendingUp, Wrench } from "lucide-react";

function normalizeFaqs(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [];
}

function inferCategory(faq) {
  const explicit = typeof faq?.category === "string" ? faq.category : "";
  const raw = `${explicit} ${faq?.question ?? ""} ${faq?.answer ?? ""}`.toLowerCase();

  if (raw.includes("risk") || raw.includes("loss") || raw.includes("safe") || raw.includes("volatile")) return "risk";
  if (raw.includes("return") || raw.includes("performance") || raw.includes("profit") || raw.includes("growth")) return "returns";
  if (raw.includes("fee") || raw.includes("charge") || raw.includes("cost") || raw.includes("commission")) return "fees";
  if (raw.includes("tax") || raw.includes("gst") || raw.includes("tds")) return "tax";
  if (raw.includes("how") || raw.includes("process") || raw.includes("start") || raw.includes("open")) return "process";
  return explicit || "general";
}

function CategoryIcon({ category, active }) {
  const iconClass = active
    ? "h-4 w-4 text-[color:var(--color-matte-gold)]"
    : "h-4 w-4 text-white/40";

  switch ((category || "").toLowerCase()) {
    case "returns":
    case "performance":
      return <TrendingUp className={iconClass} aria-hidden="true" />;
    case "risk":
    case "safety":
      return <Shield className={iconClass} aria-hidden="true" />;
    case "fees":
    case "cost":
      return <Percent className={iconClass} aria-hidden="true" />;
    case "tax":
    case "taxes":
      return <Receipt className={iconClass} aria-hidden="true" />;
    case "process":
    case "setup":
      return <Wrench className={iconClass} aria-hidden="true" />;
    default:
      return <HelpCircle className={iconClass} aria-hidden="true" />;
  }
}

function buildFaqSchema(faqs, pageUrl) {
  const mainEntity = faqs
    .map((f) => {
      const question = typeof f?.question === "string" ? f.question.trim() : "";
      const answer = typeof f?.answer === "string" ? f.answer.trim() : "";
      if (!question || !answer) return null;
      return {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    })
    .filter(Boolean);

  if (mainEntity.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };

  if (typeof pageUrl === "string" && pageUrl.trim()) {
    schema.url = pageUrl.trim();
  }

  return schema;
}

export default function FAQSection({ faqs: faqsProp, items, pageUrl, title = "FAQs", withSchema = true }) {
  const faqs = normalizeFaqs(items ?? faqsProp);
  const [openIndex, setOpenIndex] = useState(null);

  const schema = useMemo(() => {
    if (!withSchema) return null;
    return buildFaqSchema(faqs, pageUrl);
  }, [faqs, pageUrl, withSchema]);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-12 sm:py-14">
      {schema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}

      <header className="text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/55">
          Clear answers, minimal noise.
        </p>
      </header>

      <div className="mt-8 sm:mt-10">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const category = inferCategory(faq);

          return (
            <div key={faq?.id ?? faq?.question ?? index} className="border-b border-white/10">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-4 py-5 sm:py-6 text-left"
              >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="mt-1.5 shrink-0">
                    <CategoryIcon category={category} active={isOpen} />
                  </div>

                  <span
                    className={
                      "block min-w-0 text-xl sm:text-2xl leading-snug transition-colors duration-200 " +
                      (isOpen ? "text-[color:var(--color-matte-gold)]" : "text-white/90")
                    }
                  >
                    {faq.question}
                  </span>
                </div>

                <Plus
                  aria-hidden="true"
                  className={
                    "h-5 w-5 shrink-0 transition-transform duration-200 " +
                    (isOpen ? "rotate-45 text-[color:var(--color-matte-gold)]" : "rotate-0 text-white/50")
                  }
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-5 sm:pb-6 pr-1">
                      <div className="text-[15px] sm:text-base leading-relaxed text-gray-400">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
