import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
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
                <Route path="services" element={<Services />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogDetail />} />
                <Route path="compliance" element={<Compliance />} />
                <Route path="terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="disclaimer" element={<Disclaimer />} />
                <Route path="refund-policy" element={<RefundPolicy />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="bottom-center" />
      </div>
    </HelmetProvider>
  );
}

export default App;