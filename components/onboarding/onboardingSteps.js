/**
 * Onboarding Steps Config — JSON-driven, scalable.
 * Each step has a primary link and alternates.
 * Future: add ITR onboarding, Insurance onboarding as separate arrays.
 */

export const onboardingSteps = [
  {
    step: 1,
    title: "Check PAN–Aadhaar Link Status Online",
    description:
      "PAN must be linked with Aadhaar to invest in mutual funds or open demat accounts.",
    seoBody:
      "PAN must be linked with Aadhaar to invest in mutual funds, open demat accounts, and complete financial KYC. Use the official Income Tax portal to verify whether your PAN is active and linked. If not linked, you must complete the linking process before proceeding further.",
    primaryLink: {
      label: "Check PAN–Aadhaar Status",
      url: "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status",
    },
    alternates: [
      {
        label: "Income Tax Portal Home",
        url: "https://www.incometax.gov.in/",
      },
      {
        label: "PAN Correction (Protean)",
        url: "https://onlineservices.proteantech.in/paam/endUserRegisterContact.html",
      },
    ],
  },
  {
    step: 2,
    title: "Apply for New PAN Card (If Required)",
    description: "PAN is mandatory for KYC, SIP registration, and all financial transactions.",
    seoBody:
      "If an investor does not have a PAN card, they must apply before starting mutual fund investments. PAN is mandatory for KYC, SIP registration, and all financial transactions. Applications can be submitted online through authorized government service providers like Protean (NSDL) or UTI.",
    primaryLink: {
      label: "Apply PAN via Protean (NSDL)",
      url: "https://onlineservices.proteantech.in/paam/endUserRegisterContact.html",
    },
    alternates: [
      {
        label: "Apply PAN via UTI",
        url: "https://www.pan.utiitsl.com/",
      },
    ],
  },
  {
    step: 3,
    title: "Check Mutual Fund KYC Status (CAMS / KRA)",
    description:
      "Verify whether your KYC is registered in the KRA database before investing.",
    seoBody:
      "Investors must verify whether their KYC is registered in the KRA (KYC Registration Agency) database. This determines eligibility to invest in mutual funds. You can check status using CAMS, CVL, NDML, or Karvy KRA systems. If KYC is not registered, investment platforms may reject SIP and lump sum transactions.",
    primaryLink: {
      label: "CAMS KRA Status Check",
      url: "https://camskra.com/investorservices#kyc_check_check",
    },
    alternates: [
      {
        label: "CVL KRA Check",
        url: "https://validate.cvlindia.com/CVLKRAVerification_V1/",
      },
      {
        label: "NDML KRA Check",
        url: "https://kra.ndml.in/kra/ckyc/#/initiate",
      },
      {
        label: "Karvy KRA Check",
        url: "https://www.karvykra.com/KYC_Validation/Default.aspx",
      },
    ],
  },
  {
    step: 4,
    title: "Validate KYC Across KRAs & Aadhaar Systems",
    description:
      "Confirm compliance with SEBI requirements and prevent transaction rejection.",
    seoBody:
      "KYC validation ensures investor data is verified across multiple KRA databases and Aadhaar systems. This step confirms compliance with SEBI requirements and prevents transaction rejection during SIP or investment activation. Use CVL, NDML, CAMS Aadhaar validation, and Karvy systems to confirm identity consistency.",
    primaryLink: {
      label: "CVL KRA Validation",
      url: "https://validate.cvlindia.com/CVLKRAVerification_V1/",
    },
    alternates: [
      {
        label: "NDML CKYC Validation",
        url: "https://kra.ndml.in/kra/ckyc/#/initiate",
      },
      {
        label: "CAMS Aadhaar Validation",
        url: "https://qrkra.camsonline.com/KRAAADHAARWEB/MobileApp/Home.aspx",
      },
      {
        label: "Karvy KYC Validation",
        url: "https://www.karvykra.com/KYC_Validation/Default.aspx",
      },
    ],
  },
  {
    step: 5,
    title: "Verify Name Match Across PAN, Aadhaar & KYC",
    description: "Name mismatch between documents can block mutual fund investments.",
    seoBody:
      "Mismatch in name between PAN, Aadhaar, and KYC records can block mutual fund investments. Investors must ensure spelling and structure are identical across documents. Use verification guides and correction portals if discrepancies exist.",
    primaryLink: {
      label: "ABSL KYC FAQ Guide",
      url: "https://mutualfund.adityabirlacapital.com/faqs-on-kyc-process",
    },
    alternates: [
      {
        label: "PAN Name Check",
        url: "https://eportal.incometax.gov.in/",
      },
      {
        label: "CKYC Search",
        url: "https://kra.ndml.in/kra/ckyc/#/initiate",
      },
    ],
  },
  {
    step: 6,
    title: "Start SIP or Investment After KYC Approval",
    description:
      "Once PAN linking and KYC validation are complete, begin investing.",
    seoBody:
      "Once PAN linking and KYC validation are complete, investors can start SIP, lumpsum investments, or portfolio creation. Investment platforms and advisors can assist in selecting suitable mutual funds and activating mandates.",
    primaryLink: {
      label: "Open WealthMagic",
      url: "/client-portal",
    },
    alternates: [
      {
        label: "Book Advisor Call",
        url: "/contact",
      },
    ],
  },
];

/** FAQ items for SEO schema on the public page */
export const onboardingFaqs = [
  {
    question: "Is PAN mandatory for mutual fund investment?",
    answer:
      "Yes. PAN (Permanent Account Number) is mandatory for investing in mutual funds, opening a demat account, completing KYC, and filing income tax returns. Without a valid PAN linked to Aadhaar, investment transactions will be blocked.",
  },
  {
    question: "How to check KYC status online?",
    answer:
      "Use CAMS KRA, CVL KRA, NDML KRA, or Karvy KRA portals. Enter your PAN to see your KYC registration status. All four KRAs share a centralized database. If KYC is not registered, complete it through your distributor or AMC.",
  },
  {
    question: "What if PAN Aadhaar is not linked?",
    answer:
      "An unlinked PAN becomes inoperative under CBDT rules. You cannot make new mutual fund investments, file ITR, or complete KYC verification. Link them via the Income Tax e-Filing portal (eportal.incometax.gov.in) with a Rs. 1,000 fee.",
  },
  {
    question: "Which KRA is valid for mutual fund KYC?",
    answer:
      "All four KRAs are valid — CAMS KRA, CVL KRA, NDML KRA, and Karvy KRA. They share a centralized database so your KYC status is consistent across all. You can verify or register through any one of them.",
  },
  {
    question: "Can I start SIP without KYC?",
    answer:
      "No. KYC registration is mandatory before any mutual fund investment including SIPs. Complete your KYC through CAMS KRA or any registered KRA, validate it, and ensure name matching before starting an SIP.",
  },
  {
    question: "What is CKYC and how does it differ from KRA KYC?",
    answer:
      "CKYC (Central KYC) is a unified government registry managed by CERSAI. KRA KYC is specific to mutual funds. Both validate your identity, but CKYC is accepted across banks, mutual funds, and insurance companies.",
  },
];
