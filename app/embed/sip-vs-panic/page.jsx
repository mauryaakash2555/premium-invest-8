import SIPPanicPage from "@/intelligence/ui/sip-panic/SIPPanicPage";

export const metadata = {
  title: "SIP vs Panic (Embed) | BM Wealth",
  robots: { index: false, follow: false },
};

export default function SipVsPanicEmbedPage({ searchParams }) {
  const partner = String(searchParams?.partner || "");
  // Embed controls can still be driven by query params (SIPPanicPage reads them), but partner can also be forced via props.
  return <SIPPanicPage embed partner={partner} />;
}
