import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth | Portfolio Management (PMS), Mutual Funds, SIP",
  description:
    "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
  path: "/",
});

export default function Layout({ children }) {
    return (
            <>
    {/* DEBUG MARKER v3 - Testing if Vercel deploys on main page */}
        <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: '#ff0000',
                color: '#ffffff',
                padding: '15px 25px',
                zIndex: 999999,
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(255,0,0,0.5)',
    }}>
          🔴 BUILD: JAN-14-V3
            </div>
{children}
</>
    );
        }
