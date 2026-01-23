# Pre-Coding Research Report (Gold Standard)

**Feature / Module:** SIP vs Panic Simulator (Tax display + disclosures)

**Why this report exists:** Per "research-first" process, document *what we believe is true*, *why we believe it*, and *what we will/ won’t implement* before changing code.

**Status:** Draft (sources verified for fetchability)

**Last updated:** 2026-01-22

---

## 1) Scope

This report covers:

- **Equity mutual fund capital gains taxation (India)** assumptions used by the simulator’s post-tax results, specifically the **headline rates and exemption thresholds** that the UI/engine communicates.
- **Risk + authenticity disclaimers** suitable for a public-facing educational simulator.

This report does **not** attempt to:

- Provide legal/tax advice.
- Model every edge case (indexation, grandfathering mechanics, surcharge/cess, set-off/carry-forward, resident vs non-resident nuances, slab interactions, STT exceptions, scheme classification nuances).

---

## 2) Current product behavior (what we’re validating)

The simulator currently:

- Shows pre-tax and post-tax corpus.
- Uses a simplified India equity capital gains model with:
  - **LTCG** when holding period is **> 12 months**.
  - **STCG** when holding period is **<= 12 months**.
  - **Annual LTCG exemption threshold** (tax on gains only above the threshold).

The *open gap* we want to fix:

- Make **“Tax paid”** explicitly visible (including ₹0 when exemption absorbs all gains) to avoid users assuming tax is “hidden”.

---

## 3) Research questions

1. What is the **current** commonly-cited LTCG tax rate for listed equity / equity-oriented funds?
2. What is the **annual LTCG exemption** threshold for such gains?
3. What is the **current** commonly-cited STCG tax rate for listed equity / equity-oriented funds?
4. What disclaimer language is appropriate and defensible for:
   - Educational/indicative calculator results
   - Mutual fund market risk
   - Regulator site content authenticity and non-liability

---

## 4) Findings (with sources)

### 4.1 LTCG (Section 112A) — rate, exemption, holding period

**Finding:** LTCG on listed equity shares / equity-oriented funds is commonly stated as:

- **Tax rate:** **12.5%** (without indexation)
- **Exemption:** **₹1.25 lakh** annual exemption; only gains above this threshold are taxable
- **Holding period:** **> 12 months** for long-term

**Sources:**

- ClearTax: Section 112A overview (explicitly states 12.5% + ₹1.25 lakh exemption + >12 months holding)
  - https://cleartax.in/s/long-term-capital-gains-on-shares
- ClearTax: SIP calculator “Tax Implications of SIP Investments” section (states LTCG: 12.5% above ₹1.25 lakh after 1 year)
  - https://cleartax.in/s/sip-calculator

**Implementation implication:** Our engine constants (12.5% LTCG and ₹1.25L exemption) match these sources.


### 4.2 STCG (Section 111A) — rate, holding period

**Finding:** STCG on listed equity shares / equity-oriented mutual funds held for **12 months or less** is commonly stated as:

- **Tax rate:** **20%**

**Source:**

- ClearTax: Section 111A overview (explicitly states “Currently … taxed at 20%”)
  - https://cleartax.in/s/short-term-capital-gain-on-shares

**Implementation implication:** Our engine constant (20% STCG) matches this source.


### 4.3 Risk / authenticity / non-liability disclaimers

**Finding:** A defensible public-facing calculator should include:

- **Mutual fund market risk disclaimer**
- **Indicative-only / not guaranteed** language
- **Authenticity disclaimer** (refer to official/print/gazette copies) and “no liability” language

**Sources:**

- Mutual Funds Sahi Hai (AMFI) — standard mutual fund risk disclaimer text:
  - “Mutual Fund investments are subject to market risks, read all scheme related documents carefully … past performance … not necessarily indicative of future …”
  - https://www.mutualfundssahihai.com/en/disclaimer/

- SEBI Investor Portal — authenticity + non-responsibility disclaimer:
  - “refer to the print versions, notified Gazette copies … SEBI will not be responsible for any loss …”
  - https://investor.sebi.gov.in/disclaimer.html

- SEBI Website Policy — Terms of Use (advises verifying and obtaining professional advice; disclaims liability):
  - https://www.sebi.gov.in/website-policy.html

**Implementation implication:** These sources support having prominent disclaimers and linking to SEBI/AMFI resources.

---

## 5) Gaps, risks, and non-goals

### 5.1 Tax modeling gaps (known simplifications)

- Does not include surcharge/cess, slab interactions, set-off/carry-forward, residency, STT exceptions, grandfathering mechanics.
- Simulator should remain explicitly *educational* and *indicative*.

### 5.2 Source limitations

- Direct Income Tax Department PDF/act content extraction was unreliable in our environment, so this report relies on:
  - SEBI/AMFI primary sites for disclaimers
  - ClearTax secondary summaries for the tax-rate/exemption statements

**Mitigation:** Keep tax assumptions clearly labeled as “assumptions”, and consider later adding official Act citations once a reliably retrievable source is available.

---

## 6) Decision log (what we will change next)

**Decision A — Transparency:** Add a visible **“Tax paid”** line item in results.

- Always display it (including ₹0).
- Prefer surfacing `taxPaid` from the simulation output rather than re-computing in UI.

**Decision B — Disclosures:** Ensure the page contains:

- Market-risk disclaimer (AMFI wording) in an appropriate footer / disclosure block.
- “Indicative only, not advice” language near results.
- Links to SEBI Investor Portal / SCORES resources where relevant.

---

## 7) Engineering checklist (acceptance criteria)

- UI shows `Tax paid` for each scenario.
- When exemption applies, `Tax paid = ₹0` is shown explicitly.
- No change to tax math unless separately requested.
- Tests remain green.

---

## 8) Appendix: Additional helpful references

- SEBI SCORES (complaints redressal platform): https://scores.sebi.gov.in/
- SEBI toll-free helpline page: https://www.sebi.gov.in/toll-free-helpline.html
