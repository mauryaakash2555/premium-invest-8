import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "@/App.css";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";

// Lazy load non-critical routes for better performance
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Compliance = lazy(() => import("@/pages/Compliance"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));

// Service Pages
const MutualFunds = lazy(() => import("@/pages/MutualFunds"));
const PortfolioManagement = lazy(() => import("@/pages/PortfolioManagement"));
const TradingServices = lazy(() => import("@/pages/TradingServices"));
const Insurance = lazy(() => import("@/pages/Insurance"));
const FixedDeposits = lazy(() => import("@/pages/FixedDeposits"));
const SIPServices = lazy(() => import("@/pages/SIPServices"));
const Careers = lazy(() => import("@/pages/Careers"));
const Sitemap = lazy(() => import("@/pages/Sitemap"));
const Platforms = lazy(() => import("@/pages/Platforms"));
const CuratedPartners = lazy(() => import("@/pages/CuratedPartners"));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#000000',
    color: '#DAA520'
  }}>
    <div>Loading...</div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="about-us" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogDetail />} />
                
                {/* Service Pages */}
                <Route path="mutual-funds" element={<MutualFunds />} />
                <Route path="portfolio-management" element={<PortfolioManagement />} />
                <Route path="trading-services" element={<TradingServices />} />
                <Route path="insurance" element={<Insurance />} />
                <Route path="fixed-deposits" element={<FixedDeposits />} />
                <Route path="sip" element={<SIPServices />} />
                <Route path="careers" element={<Careers />} />
                <Route path="sitemap" element={<Sitemap />} />
            <Route path="platform" element={<Platforms />} />
            <Route path="curated-partners" element={<CuratedPartners />} />
                
                {/* Legal Pages */}
                <Route path="compliance" element={<Compliance />} />
                <Route path="terms" element={<TermsAndConditions />} />
                <Route path="terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="disclaimer" element={<Disclaimer />} />
                <Route path="refund" element={<RefundPolicy />} />
                <Route path="refund-policy" element={<RefundPolicy />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-center" />
        <Analytics />
        <SpeedInsights />
      </div>
    </HelmetProvider>
  );
}

export default App;
