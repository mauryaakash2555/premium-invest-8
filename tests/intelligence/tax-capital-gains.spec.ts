import { calculateCapitalGainsTax } from "@/intelligence/engine/tax";

describe("calculateCapitalGainsTax (India equity)", () => {
  test("LTCG: gains below ₹1.25L exemption => zero tax", () => {
    const res = calculateCapitalGainsTax({
      gains: 100_000,
      holdingPeriodMonths: 12,
      assetType: "equity_mf",
    });

    expect(res.category).toBe("ltcg");
    expect(res.taxableGains).toBe(0);
    expect(res.taxPaid).toBe(0);
  });

  test("LTCG: gains at ₹1.25L exemption => zero tax", () => {
    const res = calculateCapitalGainsTax({
      gains: 125_000,
      holdingPeriodMonths: 12,
      assetType: "equity_mf",
    });

    expect(res.category).toBe("ltcg");
    expect(res.taxableGains).toBe(0);
    expect(res.taxPaid).toBe(0);
  });

  test("LTCG: gains above exemption => tax only on excess", () => {
    const res = calculateCapitalGainsTax({
      gains: 500_000,
      holdingPeriodMonths: 12,
      assetType: "equity_mf",
    });

    // Taxable = 5,00,000 - 1,25,000 = 3,75,000; tax @ 12.5% = 46,875
    expect(res.category).toBe("ltcg");
    expect(res.taxableGains).toBe(375_000);
    expect(res.taxPaid).toBe(46_875);
  });

  test("STCG: no exemption applied", () => {
    const res = calculateCapitalGainsTax({
      gains: 100_000,
      holdingPeriodMonths: 11,
      assetType: "equity_mf",
    });

    expect(res.category).toBe("stcg");
    expect(res.taxableGains).toBe(100_000);
    expect(res.taxPaid).toBe(20_000);
  });
});
