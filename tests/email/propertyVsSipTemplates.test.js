import { buildPropertyVsSipFreeSummaryEmail, buildPropertyVsSipPaidPdfEmail } from "@/lib/email/propertyVsSipTemplates";

describe("Property vs SIP email personalization", () => {
  test("free summary subject and greeting use provided name (3 samples)", () => {
    const samples = ["Rahul", "D'Silva", "Akash Test"];

    for (const name of samples) {
      const built = buildPropertyVsSipFreeSummaryEmail({
        lead: { name, email: "test@example.com" },
        // Provide a gap override so this test doesn't depend on the model implementation.
        inputs: { propertyPrice: "20000000", monthlySip: "50000", years: "15", gap: "16000000" },
        siteUrl: "https://bmwealth.co.in",
      });

      expect(built.subject).toMatch(/^You're losing ₹[0-9.]+Cr\. Here's how\.$/);

      // Greeting is HTML-escaped for special characters.
      if (name.includes("'")) {
        expect(built.html).toContain("Hi D&#39;Silva");
      } else {
        expect(built.html).toContain(`Hi ${name}`);
      }

      expect(built.html).not.toContain("Hi Akash,");
    }
  });

  test("paid PDF email greeting uses provided name", () => {
    const name = "D'Silva";
    const built = buildPropertyVsSipPaidPdfEmail({
      lead: { name },
      pdfPayload: { blocks: { summaryLines: [] }, meta: {} },
      attachmentName: "D'Silva_Report.pdf",
    });

    expect(built.html).toContain("Hi D&#39;Silva");
    expect(built.html).not.toContain("Hi Akash,");
  });
});
