/**
 * Product Pitch Templates
 * SEBI-compliant messaging
 */

export const PITCHES = {
  FREE_CONSULTATION: {
    message:
      "Based on your interest in investing, would you like to **explore options** in a free 15-minute consultation with our AMFI-registered advisor?\n\n" +
      "They can help you understand possible approaches based on your goals and risk profile (educational discussion, not a specific recommendation).\n\n" +
      "Disclaimer: Educational only. Investments are subject to market risks.",
    cta: "Book Free Consultation",
    action: "BOOK_CONSULTATION",
    priority: "high",
  },

  SIP_CALCULATOR: {
    message:
      "Want to see how much your SIP could grow over time?\n\n" +
      "Try our **SIP Calculator** - it's free and shows potential returns based on different scenarios.\n\n" +
      "(Educational tool - actual returns may vary)",
    cta: "Try SIP Calculator",
    action: "OPEN_CALCULATOR",
    priority: "medium",
  },

  RETIREMENT_PLANNER: {
    message:
      "Planning for retirement is smart!\n\n" +
      "Our **Retirement Planner** helps you calculate how much you need to save monthly for a comfortable retirement.\n\n" +
      "Free to use, no signup required.",
    cta: "Use Retirement Planner",
    action: "OPEN_RETIREMENT_PLANNER",
    priority: "medium",
  },

  TAX_CALCULATOR: {
    message:
      "Looking to save tax?\n\n" +
      "Our **Tax Savings Calculator** shows how much you can save under Section 80C with ELSS and other options.\n\n" +
      "Completely free!",
    cta: "Calculate Tax Savings",
    action: "OPEN_TAX_CALC",
    priority: "medium",
  },

  TRADING_PLATFORMS: {
    message:
      "Popular platforms many investors use include:\n\n" +
      "- **Zerodha** - Zero brokerage for equity delivery\n" +
      "- **Groww** - Beginner-friendly interface\n" +
      "- **Angel One** - Advanced tools for traders\n\n" +
      "Would you like to explore these options?\n\n" +
      "Disclaimer: These are options, not a recommendation. Trading involves risk.",
    cta: "View Platforms",
    action: "SHOW_PLATFORMS",
    priority: "medium",
  },

  INSURANCE_OPTIONS: {
    message:
      "For life insurance, many clients prefer term plans for maximum coverage at low cost.\n\n" +
      "We can help you compare options from top insurers through our IRDAI-licensed platform.\n\n" +
      "Would you like a free insurance needs analysis?\n\n" +
      "Disclaimer: Educational comparison only. Final decision is yours.",
    cta: "Get Free Analysis",
    action: "INSURANCE_CONSULT",
    priority: "high",
  },

  PRIORITY_CONSULTATION: {
    message:
      "For investments of this size, we recommend speaking with our senior advisor who specializes in high-value portfolios.\n\n" +
      "This is a complimentary service for investments above ₹10 lakh.\n\n" +
      "Shall I schedule a priority consultation?",
    cta: "Schedule Priority Call",
    action: "PRIORITY_BOOKING",
    priority: "urgent",
  },

  BEGINNER_GUIDE: {
    message:
      "Starting your investment journey?\n\n" +
      "Download our **free Beginner's Guide to Investing** - covers all basics in simple language.\n\n" +
      "Or book a free call with our advisor who'll guide you step-by-step!",
    cta: "Get Free Guide",
    action: "DOWNLOAD_GUIDE",
    priority: "low",
  },
};

export function getPitch(pitchName) {
  return PITCHES[pitchName] || null;
}
