# 📝 BM WEALTH BLOG TEMPLATE - MASTER COPY
**FOR:** Copilot / AI Content Generation  
**PURPOSE:** Create blogs 2-30 using this EXACT structure  
**VERSION:** 2.0 (Updated Dec 14, 2025)

---

## 🎯 TEMPLATE STRUCTURE (DO NOT CHANGE):

```javascript
export const staticBlogPost2 = {
  id: "blog-2", // Increment: blog-2, blog-3, blog-4...
  slug: "[url-slug-here]", // lowercase-with-hyphens
  title: "[BLOG_TITLE_HERE]", // Emotional, specific, number-driven
  author: "BM Wealth Editorial Team", // ALWAYS this
  date: "December 15, 2025", // Full format
  published_date: "2025-12-15", // YYYY-MM-DD
  readTime: "8 min read", // Calculate: words ÷ 250
  read_time: "8 minutes", // Alternative format
  category: "Investment Education", // or "Case Studies" or "Tax Planning"
  excerpt: "[150-160 character meta description with keywords]",
  image: "/blog-images/placeholder.webp", // Local path
  image_url: "/blog-images/placeholder.webp", // Same as image
  image_alt: "[SEO-optimized alt text for hero image]",
  tags: ["tag1", "tag2", "tag3", "tag4"], // 3-5 relevant tags
  keywords: "tag1, tag2, tag3, tag4", // Same as tags

  content: `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "[BLOG_TITLE]",
    "description": "[EXCERPT]",
    "author": {
      "@type": "Organization",
      "name": "BM Wealth Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BM Wealth",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bmwealth.co.in/logo.png"
      }
    },
    "datePublished": "[YYYY-MM-DD]",
    "dateModified": "[YYYY-MM-DD]",
    "image": "/blog-images/[image-name].webp",
    "articleSection": "[CATEGORY]",
    "keywords": "[TAGS_COMMA_SEPARATED]"
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "[FAQ_QUESTION_1]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[FAQ_ANSWER_1 - Keep under 200 characters for best display]"
        }
      },
      {
        "@type": "Question",
        "name": "[FAQ_QUESTION_2]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[FAQ_ANSWER_2]"
        }
      },
      {
        "@type": "Question",
        "name": "[FAQ_QUESTION_3]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[FAQ_ANSWER_3]"
        }
      },
      {
        "@type": "Question",
        "name": "[FAQ_QUESTION_4]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[FAQ_ANSWER_4]"
        }
      },
      {
        "@type": "Question",
        "name": "[FAQ_QUESTION_5]",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "[FAQ_ANSWER_5]"
        }
      }
    ]
  }
  </script>

  <div style="margin-bottom: 40px;">
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [OPENING LINE - Specific time, place, dialogue, or shocking stat]
    </p>
    <p style="font-size: 20px; color: #C0A062; font-style: italic; margin-bottom: 25px; line-height: 2;">
      [EMOTIONAL HOOK - Quote, question, or dramatic statement]
    </p>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [CONTEXT - Who, where, background, stakes]
    </p>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [SETUP - What led to the situation]
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="margin-bottom: 70px;">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #DAA520; margin-bottom: 35px;">
      [H2 SECTION 1 - The Turning Point / Main Problem]
    </h2>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [Content paragraph 1]
    </p>
    
    <!-- NUMERIC EMPHASIS BLOCK (if applicable) -->
    <div style="background: rgba(218, 165, 32, 0.04); padding: 18px 22px; border-radius: 10px; border-left: 2px solid rgba(192, 160, 98, 0.5); margin: 65px 0; text-align: center;">
      <p style="font-size: 50px; font-weight: 450; color: rgba(192, 160, 98, 0.82); margin-bottom: 12px; font-family: 'Playfair Display', serif; letter-spacing: -1px;">
        <span style="position: relative; top: -3px;">₹</span>[AMOUNT]
      </p>
      <p style="font-size: 19px; color: rgba(229, 229, 229, 0.7); font-weight: 400;">
        [What this represents]
      </p>
    </div>
    
    <p style="font-size: 19px; line-height: 2; margin-bottom: 20px; padding-left: 16px; border-left: 3px solid rgba(192, 160, 98, 0.7); color: #C0A062; font-weight: 500;">
      [IMPACT STATEMENT - Why this matters]
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="margin-bottom: 70px;">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #DAA520; margin-bottom: 35px;">
      [H2 SECTION 2 - How/Why This Happens]
    </h2>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [Intro paragraph]
    </p>
    
    <p style="font-size: 18px; line-height: 2; margin-bottom: 35px;">
      [Transition to problems/issues]
    </p>

    <!-- SUB-PROBLEM 1 -->
    <div style="margin-bottom: 45px;">
      <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #C0A062; margin-bottom: 22px;">
        1. [SUB-HEADING]
      </h3>
      <p style="font-size: 18px; line-height: 2; margin-bottom: 15px;">
        [Detailed explanation]
      </p>
    </div>

    <!-- SUB-PROBLEM 2 -->
    <div style="margin-bottom: 45px;">
      <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #C0A062; margin-bottom: 22px;">
        2. [SUB-HEADING]
      </h3>
      <p style="font-size: 18px; line-height: 2; margin-bottom: 15px;">
        [Detailed explanation]
      </p>
    </div>

    <!-- Repeat for 3, 4, 5 as needed -->

    <p style="font-size: 20px; line-height: 2; color: #C0A062; font-weight: 500;">
      [CLOSING STATEMENT for this section]
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="margin-bottom: 70px;">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #DAA520; margin-bottom: 35px;">
      [H2 SECTION 3 - What Readers Should Do]
    </h2>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 35px;">
      [Intro to actionable advice]
    </p>

    <!-- CHECKLIST / ACTION ITEMS -->
    <div style="background: rgba(255, 255, 255, 0.03); padding: 38px; border-radius: 12px; border-left: 4px solid rgba(192, 160, 98, 0.6); margin-bottom: 25px;">
      <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
        → [ACTION ITEM 1]
      </p>
      <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
        → [ACTION ITEM 2]
      </p>
      <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
        → [ACTION ITEM 3]
      </p>
      <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
        → [ACTION ITEM 4]
      </p>
      <p style="font-size: 18px; line-height: 2; color: #E5E5E5;">
        → [ACTION ITEM 5]
      </p>
    </div>

    <p style="font-size: 20px; line-height: 2; color: #C0A062; font-weight: 500; margin-top: 35px; padding-left: 16px; border-left: 3px solid rgba(192, 160, 98, 0.7);">
      [CLOSING IMPACT STATEMENT]
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="margin-bottom: 70px;">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #DAA520; margin-bottom: 35px;">
      [H2 SECTION 4 - Resolution / What Changed]
    </h2>
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [How the situation resolved]
    </p>

    <p style="font-size: 18px; line-height: 2; margin-bottom: 18px;">
      [What they learned or did:]
    </p>

    <ul style="font-size: 18px; line-height: 2.2; color: #E5E5E5; margin-left: 20px; margin-bottom: 28px;">
      <li>[LEARNING 1]</li>
      <li>[LEARNING 2]</li>
      <li>[LEARNING 3]</li>
      <li>[LEARNING 4]</li>
      <li>[LEARNING 5]</li>
    </ul>

    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      [Outcome paragraph]
    </p>

    <p style="font-size: 20px; line-height: 2; color: #C0A062; font-weight: 500;">
      [MEMORABLE CLOSING LINE]
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <section style="margin: 80px 0; padding: 60px 70px; background: linear-gradient(135deg, #0A0A1A 0%, #1A1A2E 100%); border-radius: 16px; border-left: 4px solid #DAA520;">
    
    <h2 style="font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 42px); font-weight: 700; color: #DAA520; margin-bottom: 50px; text-align: center;">
      Frequently Asked Questions
    </h2>

    <div style="max-width: 800px; margin: 0 auto;">
      
      <!-- FAQ 1 -->
      <div style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(218, 165, 32, 0.2);">
        <h3 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: #E5E5E5; margin-bottom: 16px;">
          [FAQ_QUESTION_1]
        </h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8; color: #B8B8B8; margin: 0;">
          [FAQ_ANSWER_1 - 2-3 sentences, educational, compliant]
        </p>
      </div>

      <!-- FAQ 2 -->
      <div style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(218, 165, 32, 0.2);">
        <h3 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: #E5E5E5; margin-bottom: 16px;">
          [FAQ_QUESTION_2]
        </h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8; color: #B8B8B8; margin: 0;">
          [FAQ_ANSWER_2]
        </p>
      </div>

      <!-- FAQ 3 -->
      <div style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(218, 165, 32, 0.2);">
        <h3 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: #E5E5E5; margin-bottom: 16px;">
          [FAQ_QUESTION_3]
        </h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8; color: #B8B8B8; margin: 0;">
          [FAQ_ANSWER_3]
        </p>
      </div>

      <!-- FAQ 4 -->
      <div style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(218, 165, 32, 0.2);">
        <h3 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: #E5E5E5; margin-bottom: 16px;">
          [FAQ_QUESTION_4]
        </h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8; color: #B8B8B8; margin: 0;">
          [FAQ_ANSWER_4]
        </p>
      </div>

      <!-- FAQ 5 -->
      <div style="margin-bottom: 0;">
        <h3 style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 600; color: #E5E5E5; margin-bottom: 16px;">
          [FAQ_QUESTION_5]
        </h3>
        <p style="font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8; color: #B8B8B8; margin: 0;">
          [FAQ_ANSWER_5]
        </p>
      </div>

    </div>
  </section>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <a href="/blog/[NEXT_BLOG_SLUG]" style="text-decoration: none;">
    <div class="coming-next-block" style="background: rgba(255, 255, 255, 0.03); padding: 35px; border-radius: 12px; border-left: 4px solid rgba(192, 160, 98, 0.5); margin-bottom: 60px; cursor: pointer;">
      <p style="font-size: 18px; font-weight: 600; color: #C0A062; margin-bottom: 15px;">
        Coming Next:
      </p>
      <p style="font-size: 24px; margin-bottom: 10px; color: #DAA520; font-weight: 600;">
        [NEXT_BLOG_TITLE] →
      </p>
      <p style="font-size: 16px; color: #CCCCCC; font-style: italic;">
        [NEXT_BLOG_TEASER - 1 sentence hook]
      </p>
    </div>
  </a>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="background: rgba(255, 255, 255, 0.03); padding: 45px; border-radius: 12px; border-left: 3px solid rgba(192, 160, 98, 0.6); margin-bottom: 70px;">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 18px; color: rgba(192, 160, 98, 0.95);">
      Get a Free Educational Consultation
    </h2>
    <p style="font-size: 19px; margin-bottom: 32px; color: #E5E5E5; font-weight: 400;">
      Understand Your Current Financial Position
    </p>

    <p style="font-size: 17px; line-height: 1.8; margin-bottom: 18px; color: #E5E5E5;">
      We'll help you understand:
    </p>

    <div style="margin-bottom: 32px;">
      <p style="font-size: 17px; line-height: 2; color: #E5E5E5; margin-bottom: 10px;">
        ✓ Whether your investments match your actual financial goals
      </p>
      <p style="font-size: 17px; line-height: 2; color: #E5E5E5; margin-bottom: 10px;">
        ✓ Hidden costs that might be impacting your returns
      </p>
      <p style="font-size: 17px; line-height: 2; color: #E5E5E5; margin-bottom: 10px;">
        ✓ If your asset allocation aligns with your risk profile and timeline
      </p>
      <p style="font-size: 17px; line-height: 2; color: #E5E5E5;">
        ✓ General principles that could improve your financial strategy
      </p>
    </div>

    <div style="border-top: 1px solid rgba(192, 160, 98, 0.2); padding-top: 28px; margin-bottom: 0;">
      <div style="margin-bottom: 20px;">
        <a href="https://wa.me/918850977259" class="whatsapp-cta-btn" style="display: inline-flex; align-items: center; gap: 10px; background: #000000; color: rgba(192, 160, 98, 0.95); padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 500; border: 1px solid rgba(192, 160, 98, 0.4);">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp: +91 88509 77259
        </a>
      </div>
      <p style="font-size: 17px; margin-bottom: 12px; color: #E5E5E5;">
        Website: <a href="https://bmwealth.co.in" style="color: rgba(192, 160, 98, 0.9); text-decoration: underline;">bmwealth.co.in</a>
      </p>
      <p style="font-size: 17px; margin-bottom: 12px; color: #E5E5E5;">
        <a href="/services" style="color: rgba(192, 160, 98, 0.9); text-decoration: underline;">Our Services</a> | <a href="/contact" style="color: rgba(192, 160, 98, 0.9); text-decoration: underline;">Contact Us</a>
      </p>
      <p style="font-size: 17px; margin-bottom: 12px; color: #E5E5E5;">
        Office: 66, Vinod Villa Bldg., 1st floor office no. 108, cavel cross lane 3, Kalbadevi Mumbai, 400002
      </p>
      <p style="font-size: 15px; color: rgba(229, 229, 229, 0.7); font-style: italic;">
        IRDAI Licensed (277925) | AMFI Registered (ARN 90008)
      </p>
    </div>
  </div>

  <hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />

  <div style="background: rgba(255, 255, 255, 0.03); padding: 40px; border-radius: 12px; border: 1px solid rgba(218, 165, 32, 0.2); margin-bottom: 40px;">
    <h3 style="color: #DAA520; font-size: 24px; margin-bottom: 25px; font-family: 'Playfair Display', serif;">
      Important Disclaimers & Regulatory Information:
    </h3>

    <p style="font-size: 16px; line-height: 1.8; color: #CCCCCC; margin-bottom: 20px;">
      <strong style="color: #C0A062;">Educational Content:</strong> This article is for educational and informational purposes only. It should not be considered personalized investment advice. The case study mentioned is based on a real situation but has been anonymized—names, specific amounts, and certain details have been modified to protect client privacy.
    </p>

    <p style="font-size: 16px; line-height: 1.8; color: #CCCCCC; margin-bottom: 20px;">
      <strong style="color: #C0A062;">Investment Risks:</strong> All investments in mutual funds, insurance products, and other financial instruments are subject to market risks. Past performance is not indicative of future results. Returns mentioned are illustrative and based on historical market data—they are not guaranteed or assured. Actual returns may vary significantly.
    </p>

    <p style="font-size: 16px; line-height: 1.8; color: #CCCCCC; margin-bottom: 20px;">
      <strong style="color: #C0A062;">Regulatory Status:</strong> BM Wealth (IRDAI License 277925 | <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer" style="color: #C0A062; text-decoration: underline;">AMFI</a> ARN 90008) is registered to provide insurance advisory services and mutual fund distribution. We are NOT <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" style="color: #C0A062; text-decoration: underline;">SEBI</a> registered investment advisors (RIA) and do not provide portfolio management services, stock recommendations, or personalized investment advice requiring SEBI RIA registration.
    </p>

    <p style="font-size: 16px; line-height: 1.8; color: #CCCCCC; margin-bottom: 20px;">
      <strong style="color: #C0A062;">Due Diligence:</strong> Please read all scheme-related documents carefully before investing. Understand the risk-return profile of investment products. Consult with a qualified financial advisor to assess suitability based on your specific financial situation, goals, and risk tolerance before making any investment decisions.
    </p>

    <p style="font-size: 16px; line-height: 1.8; color: #CCCCCC;">
      <strong style="color: #C0A062;">No Guarantees:</strong> No financial outcome can be guaranteed. The opportunity cost calculations presented are illustrative comparisons based on historical market data and standard portfolio construction principles. Individual results may differ based on specific circumstances, timing, product selection, and market conditions.
    </p>
  </div>

  <div style="border-top: 1px solid rgba(192, 160, 98, 0.15); padding-top: 35px; margin-top: 50px;">
    <p style="font-size: 14px; color: rgba(192, 160, 98, 0.8); font-weight: 500; margin-bottom: 8px;">
      BM Wealth Editorial Note
    </p>
    <p style="font-size: 14px; line-height: 1.7; color: rgba(229, 229, 229, 0.6);">
      This article is part of our Investment Education series. All case studies are anonymized to protect client privacy. Reading time: [X] minutes.
    </p>
  </div>
  `
};
```

---

## 📋 COPILOT STEP-BY-STEP INSTRUCTIONS:

### WHEN USER SAYS: "Create Blog 2 about [TOPIC]"

**STEP 1: Gather Information**
Ask user for (if not provided):
- Main story/case study details
- Key numbers/stats
- Target keyword
- 5 FAQ questions to answer

**STEP 2: Fill Template**
Replace ALL placeholders:
- `[BLOG_TITLE]` → Emotional, number-driven headline
- `[url-slug]` → lowercase-with-hyphens
- `[EXCERPT]` → 150-160 chars, keyword-rich
- All content sections with actual story

**STEP 3: Follow MANDATORY Rules** (see below)

**STEP 4: Add to Export Array**
```javascript
export const staticBlogData = [
  staticBlogPost,   // Blog 1
  staticBlogPost2,  // Blog 2 (NEW)
];
```

---

## ✅ MANDATORY CONTENT RULES:

### 📖 Writing Style:

| Rule | Example |
|------|---------|
| **Story-driven** | Start with specific moment, not "In this article..." |
| **Mumbai context** | "Bandra 2BHK" not "urban apartment" |
| **Specific numbers** | "₹47 lakh" not "significant amount" |
| **Real details** | "Honda City" "10-12 hour days" "29-year-old" |
| **Emotional resonance** | "The hardest part?" "Made the room go quiet" |
| **No jargon** | Explain terms simply when first used |

### 🚫 NEVER Use These Words:

```
❌ "Guaranteed returns"
❌ "Risk-free"
❌ "Best investment"
❌ "Get rich quick"
❌ "Assured gains"
❌ "Beating the market"
❌ "Can't lose"
❌ "Sure-shot"
❌ "100% safe"
❌ Any specific stock/fund names
```

### ✅ ALWAYS Use These Phrases:

```
✓ "May have delivered" (not "would have")
✓ "Historically" (not "will")
✓ "Could potentially" (not "definitely")
✓ "Based on historical data" (not "guaranteed")
✓ "Generally works better" (not "always best")
✓ "For educational purposes" (at start)
```

---

## 🎨 STYLE RULES (ABSOLUTE):

### Colors (DO NOT CHANGE):
- **Headings (H2):** `#DAA520` (gold)
- **Sub-headings (H3):** `#C0A062` (muted gold)
- **Body text:** `#E5E5E5` (light gray)
- **Muted text:** `#B8B8B8` (medium gray)
- **Highlights:** `#C0A062` with border-left
- **Background:** `#000000` (black)

### Typography:
- **Headings:** Playfair Display, serif
- **Body:** Inter, sans-serif
- **Size:** 18px body, 36px H2, 28px H3
- **Line height:** 2 for body (generous)

### Spacing:
- **Section margins:** 70px between major sections
- **Paragraph spacing:** 25px margin-bottom
- **HR margins:** 70px top and bottom

### No Emojis:
- ❌ Inside blog content (FORBIDDEN)
- ✅ In social share buttons only (acceptable)

---

## 🔍 SEO OPTIMIZATION CHECKLIST:

### Keywords Placement:

- [ ] **Title** - Primary keyword in first 10 words
- [ ] **First paragraph** - Primary keyword within 100 words
- [ ] **H2 headings** - Keyword variations in 2-3 H2s
- [ ] **Alt tag** - Descriptive with keyword
- [ ] **URL slug** - 3-5 words, keyword-rich
- [ ] **Meta description** - Keyword in first 50 characters

### Internal Linking:

- [ ] Link to `/services` - In CTA section
- [ ] Link to `/contact` - In CTA section
- [ ] Link to `/blog` - In footer
- [ ] Link to related blog - In "Coming Next"
- [ ] Link to `/compliance` - In footer

### External Authority Links:

- [ ] **SEBI** - In regulatory disclaimer
- [ ] **AMFI** - In regulatory disclaimer
- [ ] Optional: RBI, Income Tax sites (if topic relevant)

### Rich Results Setup:

- [ ] Article Schema included
- [ ] FAQ Schema included
- [ ] Image URL in schema
- [ ] Published/modified dates accurate

---

## ❓ FAQ CREATION GUIDE:

### How to Write Perfect FAQs:

#### Question Format:
```
✅ GOOD: "Can I lose money in mutual funds?"
✅ GOOD: "How often should I review my portfolio?"
❌ BAD: "Is investing risky?" (too vague)
❌ BAD: "What are the best mutual funds?" (not educational)
```

#### Answer Format:
```
✅ Structure:
1. Direct answer (Yes/No if applicable)
2. Nuance/caveat
3. Educational context

✅ Length: 2-4 sentences (100-200 words)
✅ Tone: Educational, balanced, compliant
❌ Never: Promote products, guarantee outcomes
```

#### FAQ Topics to Cover:

**Investment Basics:**
- Risk vs return
- Time horizons
- SIP vs lumpsum
- Goal-based investing

**Products:**
- Mutual funds vs stocks
- Debt vs equity
- ULIPs vs term + MF
- Tax-saving options

**Process:**
- Portfolio review frequency
- Rebalancing logic
- Exit load implications
- Expense ratio impact

**Advisor Selection:**
- Credentials to check (AMFI, IRDAI, SEBI)
- Commission vs fee-based
- Red flags

**Mumbai-Specific:**
- Local regulations
- Tax considerations
- Best practices for Indian investors

---

## 🎯 BLOG TOPIC IDEAS (Pre-Approved for Compliance):

### Case Studies:
1. ✅ The Retirement Shortfall (₹2.3 Cr gap at 50)
2. ✅ Child Education Planning Gone Wrong
3. ✅ Tax Planning Mistake Cost ₹18 Lakh
4. ✅ Emergency Fund Saved a Bandra Family
5. ✅ SIP Power: ₹5000/month → ₹1.2 Cr in 20 years

### Educational:
6. ✅ Goal-Based Investing: A Step-by-Step Guide
7. ✅ Portfolio Rebalancing: When and How
8. ✅ Understanding Expense Ratios (with examples)
9. ✅ Asset Allocation by Age (20s, 30s, 40s, 50s)
10. ✅ Insurance + Investment: Why Separate?

### Mistakes to Avoid:
11. ✅ 5 Common Mutual Fund Selection Mistakes
12. ✅ Why Timing the Market Usually Fails
13. ✅ The Hidden Cost of "Guaranteed Return" Products
14. ✅ Lock-in Periods: When They Help, When They Hurt
15. ✅ Chasing Past Performance: A Costly Trap

### Market Commentary (Evergreen):
16. ✅ How to Stay Calm During Market Corrections
17. ✅ When to Review (Not Panic) Your Portfolio
18. ✅ Understanding Market Cycles for Long-Term Wealth
19. ✅ Inflation: The Silent Wealth Killer
20. ✅ Power of Compounding: Real Examples

### Mumbai-Specific:
21. ✅ Investing in Mumbai: Cost of Living Considerations
22. ✅ Real Estate vs Financial Investments in Mumbai
23. ✅ Tax Planning for Mumbai Professionals
24. ✅ Retirement Planning: Mumbai Expense Reality Check

### Compliance Topics:
25. ✅ Understanding AMFI Registration: What It Means
26. ✅ SEBI RIA vs AMFI Distributor: The Difference
27. ✅ What Your Advisor's Credentials Mean
28. ✅ How to Check If Your Advisor Is Registered

### Generational:
29. ✅ Investing in Your 20s: Time is Your Superpower
30. ✅ 40s Financial Reset: It's Not Too Late

---

## ⚠️ COMPLIANCE LANGUAGE TEMPLATES:

### Use These Exact Phrases:

**When discussing returns:**
```
✅ "Historically delivered X% average returns"
✅ "Based on past data, equity funds have shown..."
✅ "Market-linked returns can vary significantly"
❌ "Will give you X% returns"
❌ "Guaranteed to beat inflation"
```

**When giving advice:**
```
✅ "Generally, separating insurance and investment works better"
✅ "Most financial advisors recommend..."
✅ "Industry best practices suggest..."
❌ "You should definitely..."
❌ "The only correct approach is..."
```

**When discussing case studies:**
```
✅ "Details modified to protect privacy"
✅ "Represents a common pattern we observe"
✅ "Individual results may vary"
❌ "This is exactly what happened"
❌ "Everyone experiences this"
```

---

## 🎨 DESIGN PATTERNS (Copy-Paste):

### 1. Opening Hook Pattern:
```html
<p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
  [Specific time/place]: "Saturday morning, 9:17 AM..."
</p>
<p style="font-size: 20px; color: #C0A062; font-style: italic; margin-bottom: 25px; line-height: 2;">
  "[DRAMATIC QUOTE OR QUESTION]"
</p>
```

### 2. Number Emphasis Block:
```html
<div style="background: rgba(218, 165, 32, 0.04); padding: 18px 22px; border-radius: 10px; border-left: 2px solid rgba(192, 160, 98, 0.5); margin: 65px 0; text-align: center;">
  <p style="font-size: 50px; font-weight: 450; color: rgba(192, 160, 98, 0.82); margin-bottom: 12px; font-family: 'Playfair Display', serif; letter-spacing: -1px;">
    <span style="position: relative; top: -3px;">₹</span>[AMOUNT]
  </p>
  <p style="font-size: 19px; color: rgba(229, 229, 229, 0.7); font-weight: 400;">
    [What it represents]
  </p>
</div>
```

### 3. Editorial Highlight:
```html
<p style="font-size: 19px; line-height: 2; margin-bottom: 20px; padding-left: 16px; border-left: 3px solid rgba(192, 160, 98, 0.7); color: #C0A062; font-weight: 500;">
  [KEY INSIGHT OR IMPORTANT POINT]
</p>
```

### 4. Checklist Box:
```html
<div style="background: rgba(255, 255, 255, 0.03); padding: 38px; border-radius: 12px; border-left: 4px solid rgba(192, 160, 98, 0.6); margin-bottom: 25px;">
  <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
    → [ITEM 1]
  </p>
  <p style="font-size: 18px; line-height: 2; color: #E5E5E5; margin-bottom: 18px;">
    → [ITEM 2]
  </p>
  <!-- ... -->
</div>
```

---

## 📊 EXAMPLE: FILLED TEMPLATE (Blog 2)

```javascript
export const staticBlogPost2 = {
  id: "blog-2",
  slug: "retirement-shortfall-mumbai-case-study",
  title: "He Did Everything Right. Still ₹2.3 Crore Short - A Mumbai Retirement Reality Check",
  author: "BM Wealth Editorial Team",
  date: "December 16, 2025",
  published_date: "2025-12-16",
  readTime: "9 min read",
  read_time: "9 minutes",
  category: "Retirement Planning",
  excerpt: "A 50-year-old marketing director thought his savings were enough—until a retirement calculator revealed a ₹2.3 crore gap. Here's what he wishes he knew at 30.",
  image: "/blog-images/retirement-planning-mumbai.webp",
  image_url: "/blog-images/retirement-planning-mumbai.webp",
  image_alt: "Mumbai retirement planning case study - financial gap analysis",
  tags: ["retirement planning Mumbai", "retirement corpus India", "late-start investing", "Mumbai cost of living"],
  keywords: "retirement planning Mumbai, retirement corpus India, late-start investing, Mumbai cost of living",

  content: `
  [Schema markup...]
  
  <div style="margin-bottom: 40px;">
    <p style="font-size: 18px; line-height: 2; margin-bottom: 25px;">
      The email arrived at 6:42 AM on a Saturday. Subject line: "Can we talk? Wife showed me retirement calculator."
    </p>
    <p style="font-size: 20px; color: #C0A062; font-style: italic; margin-bottom: 25px; line-height: 2;">
      "I thought we were doing fine. Turns out we're ₹2.3 crore short."
    </p>
    <!-- Continue story... -->
  </div>
  
  [Rest of blog following exact template structure...]
  `
};
```

---

## ⚡ QUICK REFERENCE FOR AI:

### Before Writing, Remember:

```
TONE: Educational storyteller, not salesman
LENGTH: 2000-2500 words
STRUCTURE: Story → Problem → Solution → Resolution → FAQ → CTA
COMPLIANCE: "May/could/historically" NOT "will/guaranteed"
STYLE: NO emojis, muted gold colors, generous spacing
SEO: Schema + FAQs + internal links + alt tags
```

### After Writing, Verify:

```
✓ Story hook in first 200 words
✓ Real numbers and Mumbai context
✓ 3-5 H2 sections
✓ 5 FAQs with schema
✓ No "guaranteed" language
✓ Disclaimers intact
✓ Coming Next section
✓ Internal + external links
✓ No emojis in content
```

---

## 🚨 CRITICAL WARNINGS:

### ❌ NEVER:
- Change disclaimer text (legal requirement)
- Add product recommendations
- Use "guaranteed" or "assured"
- Remove compliance language
- Add emojis inside content
- Give specific stock tips
- Claim SEBI RIA status
- Remove FAQ schema
- Change color scheme
- Use aggressive sales language

### ✅ ALWAYS:
- Start with specific story moment
- Use Mumbai/Indian context
- Include real numbers (₹ amounts)
- Keep professional tone
- Add 5 FAQs minimum
- Include all schema markup
- Link to SEBI/AMFI in disclaimers
- Keep disclaimers word-for-word
- Use inline styles only
- Add alt tags to images

---

## 📝 HOW TO USE THIS TEMPLATE:

### FOR AI/COPILOT:

**User input:**
```
"Create Blog 2: The Tax Planning Mistake That Cost ₹18 Lakh"
```

**You do:**
1. Copy template structure
2. Ask for: Story details, key numbers, 5 FAQ topics
3. Fill all [PLACEHOLDERS]
4. Verify compliance language
5. Check all checkboxes
6. Output complete JavaScript object
7. Ask user to add to staticBlogData.js

---

## 🎯 QUALITY CONTROL:

### Before Submitting Blog, Answer These:

1. **Story Test:** Could you tell this to a friend over coffee?
   - If yes ✅ (engaging)
   - If no ❌ (too dry, rewrite)

2. **Mumbai Test:** Is local context clear?
   - If yes ✅ (relatable)
   - If no ❌ (add specific areas/amounts)

3. **Compliance Test:** Would SEBI approve this language?
   - If yes ✅ (safe)
   - If no ❌ (fix immediately)

4. **Actionable Test:** Can reader do something immediately?
   - If yes ✅ (valuable)
   - If no ❌ (add checklist/steps)

5. **Visual Test:** Do numbers and highlights stand out?
   - If yes ✅ (scannable)
   - If no ❌ (add emphasis blocks)

---

## 📚 ADDITIONAL RESOURCES:

### Files to Reference:
- `BLOG_MASTER_RULES.md` - Core rules
- `BLOG_COMPREHENSIVE_AUDIT.md` - Quality benchmarks
- `frontend/src/data/staticBlogData.js` - Blog 1 (reference)
- `frontend/src/App.css` - Hover effects CSS

### Compliance References:
- SEBI Guidelines: https://www.sebi.gov.in
- AMFI Code: https://www.amfiindia.com
- IRDAI Regulations: https://www.irdai.gov.in

---

## ✅ FINAL PRE-PUBLISH CHECKLIST:

```
CONTENT:
  [ ] 2000-2500 words
  [ ] Story-driven (specific moment opener)
  [ ] Mumbai context present
  [ ] Real numbers included
  [ ] No emojis in content
  [ ] Professional tone maintained

STRUCTURE:
  [ ] Schema.org Article markup
  [ ] FAQ section (5 questions)
  [ ] FAQ Schema markup
  [ ] Coming Next block
  [ ] CTA section
  [ ] Disclaimers section
  [ ] Footer links

SEO:
  [ ] Primary keyword in title
  [ ] Keyword in first paragraph
  [ ] Alt tag on hero image
  [ ] Internal links (2+)
  [ ] External links (SEBI/AMFI)
  [ ] Meta description 150-160 chars

COMPLIANCE:
  [ ] No "guaranteed" language
  [ ] "NOT SEBI RIA" stated clearly
  [ ] All disclaimers present
  [ ] Risk warnings included
  [ ] "Educational purposes" stated
  [ ] Case anonymized note

TECHNICAL:
  [ ] Inline styles only
  [ ] HTML not JSX
  [ ] Proper JSON escaping
  [ ] No syntax errors
  [ ] Mobile responsive (clamp fonts)
```

---

## 🚀 READY TO GENERATE BLOGS 2-30!

**To use this template:**
1. Give topic to AI/Copilot
2. AI fills template following all rules
3. Review against checklist
4. Add to `staticBlogData.js`
5. Add to export array
6. Commit and push
7. Vercel deploys automatically

**Expected output:** World-class blog in 30 minutes (vs 8 hours manually)

---

**Last Updated:** December 14, 2025  
**Template Version:** 2.0  
**Status:** Production Ready ✅
