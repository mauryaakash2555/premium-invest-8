export interface InsuranceOutcome {
  premiumsPaid: number;
  claimOccurred: boolean;
  payout: number;
  netValue: number;
}

/**
 * Insurance simulator (education-only): models premium payments and claim probability.
 */
export function calculateInsuranceOutcome(params: {
  years: number;
  annualPremium: number;
  coverageAmount: number;
  annualClaimProbability: number; // 0..1
  seed: number;
}): InsuranceOutcome {
  const { years, annualPremium, coverageAmount, annualClaimProbability, seed } = params;
  const y = Math.max(0, Math.floor(years));
  const p = Math.max(0, annualPremium);
  const coverage = Math.max(0, coverageAmount);
  const prob = Math.min(1, Math.max(0, annualClaimProbability));

  // tiny deterministic RNG (LCG) to avoid depending on the global engine RNG
  let s = (seed >>> 0) || 1;
  const next = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };

  let claimOccurred = false;
  for (let i = 0; i < y; i += 1) {
    if (next() < prob) {
      claimOccurred = true;
      break;
    }
  }

  const premiumsPaid = y * p;
  const payout = claimOccurred ? coverage : 0;
  const netValue = payout - premiumsPaid;

  return { premiumsPaid, claimOccurred, payout, netValue };
}
