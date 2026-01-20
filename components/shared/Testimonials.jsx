"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "IT Professional, Andheri",
    text: "BM Wealth helped me structure my investments efficiently. Started with ₹15,000 monthly SIP 5 years ago, now my portfolio has grown to ₹12+ lakhs. Their guidance on tax-saving ELSS funds saved me ₹50,000+ annually.",
    rating: 5
  },
  {
    name: "Priya Mehta",
    role: "Entrepreneur, BKC",
    text: "As a business owner, I needed sophisticated wealth management. Their portfolio management service delivered 14% CAGR over 3 years while managing risk perfectly. Professional, transparent, always available.",
    rating: 5
  },
  {
    name: "Amit Patel",
    role: "Marketing Manager, Powai",
    text: "Switched from regular to direct mutual funds through BM Wealth. The difference in returns over 7 years is significant. They explained everything clearly, no hidden charges. Highly recommend for long-term investors.",
    rating: 5
  },
  {
    name: "Sneha Iyer",
    role: "Doctor, Bandra",
    text: "Started investing late at 35, worried about retirement. BM Wealth created a comprehensive plan - SIPs, insurance, tax planning. Now at 40, I'm confident about my financial future. Their support is exceptional.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.985) 100%)",
        padding: "80px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontFamily: '"Cormorant Garamond", serif',
              color: "var(--lux-accent)",
              marginBottom: "16px",
              fontWeight: "600",
            }}
          >
            What Our Clients Say
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "#B8B8B8",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Trusted by 500+ Mumbai investors for personalized wealth management
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(0,0,0,0.12) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "0px",
                padding: "32px",
                position: "relative",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.10))";
                e.currentTarget.style.boxShadow = "0 26px 70px rgba(0,0,0,0.55), 0 0 36px color-mix(in oklab, var(--lux-accent) 12%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Quote
                size={40}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  color: "color-mix(in oklab, var(--lux-accent) 18%, transparent)",
                }}
              />

              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      style={{ fill: "var(--lux-accent)", color: "var(--lux-accent)" }}
                    />
                  ))}
                </div>

                <p
                  style={{
                    fontSize: "16px",
                    color: "#e5e5e5",
                    lineHeight: "1.8",
                    marginBottom: "24px",
                    fontStyle: "italic",
                  }}
                >
                  "{testimonial.text}"
                </p>
              </div>

              <div
                style={{
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h4
                  style={{
                    fontSize: "17px",
                    color: "rgba(255,255,255,0.92)",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  {testimonial.name}
                </h4>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#999",
                    margin: 0,
                  }}
                >
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "48px",
            padding: "24px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "0px",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              color: "#B8B8B8",
              margin: 0,
              lineHeight: "1.7",
            }}
          >
            <strong style={{ color: "var(--lux-accent)" }}>Client Success:</strong> Average portfolio CAGR of 12-14% over 5+ years | 
            85%+ client retention rate | Serving Mumbai investors since inception
          </p>
        </div>
      </div>
    </section>
  );
}
