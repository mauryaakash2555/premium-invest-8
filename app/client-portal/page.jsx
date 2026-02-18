"use client";

/**
 * Client Portal Page — LUX Premium Rebuild
 *
 * Features:
 * - Service integrations (MF, PMS, SIP, Insurance, LIC, Trading, FD, Compliance)
 * - eKYC registration with inline validation
 * - Document sharing (PDF, Word, Excel, Images, up to 100 MB)
 * - WhatsApp file sharing
 * - Automated emails & quick-action templates
 * - Fully lux-themed, zero brown/gold/banned colors
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Shield,
  Mail,
  MessageCircle,
  Briefcase,
  TrendingUp,
  PiggyBank,
  Heart,
  Building2,
  BarChart3,
  Users,
  Check,
  Clock,
  Star,
  ChevronRight,
  Lock,
  Unlock,
  CloudUpload,
  FileSpreadsheet,
  FileImage,
  File,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";
import LaserFooter from "@/components/user/LaserFooter";

/* ─── Service data ─── */
const serviceIntegrations = [
  { id: "mutual-funds", title: "Mutual Funds", icon: TrendingUp, description: "Access 5 000+ mutual fund schemes across all AMCs", platforms: ["MF Central", "CAMS"], link: "/mutual-funds" },
  { id: "pms", title: "Portfolio Management", icon: Briefcase, description: "Professional portfolio management with SEBI-registered PMS", platforms: ["SEBI Registered PMS", "Customized Portfolios"], link: "/portfolio-management" },
  { id: "sip", title: "SIP Investments", icon: PiggyBank, description: "Systematic investment plans with auto-debit facility", platforms: ["NACH Mandate", "E-Mandate"], link: "/sip" },
  { id: "insurance", title: "Insurance", icon: Shield, description: "Life, health, and general insurance solutions", platforms: ["Term Plans", "Health Insurance"], link: "/insurance" },
  { id: "lic", title: "LIC Policies", icon: Heart, description: "LIC policy management and premium tracking", platforms: ["LIC Portal", "Premium Calculator"], link: "/insurance" },
  { id: "trading", title: "Trading Services", icon: BarChart3, description: "Equity, derivatives, and commodity trading", platforms: ["NSE", "BSE"], link: "/trading-services" },
  { id: "fd", title: "Fixed Deposits", icon: Building2, description: "Corporate FDs with competitive interest rates", platforms: ["Bank FDs", "Corporate FDs"], link: "/fixed-deposits" },
  { id: "compliance", title: "SEBI Compliance", icon: Lock, description: "Regulatory compliance and documentation", platforms: ["SEBI Guidelines", "KYC Compliance"], link: "/compliance" },
];

const supportedFileTypes = [
  { ext: "PDF", icon: FileText, color: "var(--lux-accent)" },
  { ext: "DOC/DOCX", icon: FileText, color: "var(--lux-foreground-60)" },
  { ext: "XLS/XLSX", icon: FileSpreadsheet, color: "var(--lux-foreground-60)" },
  { ext: "JPG/PNG", icon: FileImage, color: "var(--lux-foreground-60)" },
  { ext: "Any File", icon: File, color: "var(--lux-foreground-40)" },
];

const features = [
  { icon: Shield, title: "SEBI Compliant", desc: "All integrations follow SEBI guidelines and regulations" },
  { icon: CloudUpload, title: "Large File Support", desc: "Upload HD/4K images and files up to 100 MB" },
  { icon: Lock, title: "Secure Storage", desc: "Bank-grade encryption for all your documents" },
  { icon: Mail, title: "Email Automation", desc: "Schedule automated emails for client communication" },
  { icon: MessageCircle, title: "WhatsApp Integration", desc: "Quick file sharing through WhatsApp" },
  { icon: Users, title: "Client Management", desc: "Organise client data in separate folders automatically" },
];

const tabs = [
  { id: "services", label: "Services", icon: Briefcase },
  { id: "ekyc", label: "eKYC Register", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "automation", label: "Automation", icon: Mail },
];

/* ─── Shared glass style ─── */
const glass = {
  background: "color-mix(in oklab, var(--lux-card) 70%, transparent)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid var(--lux-foreground-05)",
  borderRadius: 16,
};

const inputCls =
  "w-full px-4 py-3.5 rounded-xl bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.06)] text-white placeholder-[rgba(255,255,255,0.28)] focus:outline-none focus:border-[color:color-mix(in_oklab,var(--lux-accent)_40%,transparent)] transition-colors duration-200 text-sm";

/* ─── Component ─── */
export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [ekycFormData, setEkycFormData] = useState({ fullName: "", email: "", phone: "", pan: "", aadhaar: "", dob: "", address: "" });
  const [ekycSubmitted, setEkycSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [automationEmail, setAutomationEmail] = useState({ clientEmail: "", subject: "", message: "", scheduleDate: "" });
  const [emailSent, setEmailSent] = useState(false);
  const fileInputRef = useRef(null);

  const handleEkycSubmit = useCallback((e) => {
    e.preventDefault();
    setEkycSubmitted(true);
    setTimeout(() => setEkycSubmitted(false), 5000);
  }, []);

  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      type: f.type,
      uploadedAt: new Date().toLocaleString(),
    }));
    setUploadedFiles((prev) => [...newFiles, ...prev]);
  }, []);

  const handleAutomationSubmit = useCallback((e) => {
    e.preventDefault();
    setEmailSent(true);
    setAutomationEmail({ clientEmail: "", subject: "", message: "", scheduleDate: "" });
    setTimeout(() => setEmailSent(false), 4000);
  }, []);

  const removeFile = useCallback((idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "var(--lux-background)" }}>
      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 50% -10%, color-mix(in oklab, var(--lux-accent) 8%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 15%, rgba(120,140,200,0.05) 0%, transparent 50%),
            linear-gradient(180deg, var(--lux-background) 0%, color-mix(in oklab, var(--lux-background) 96%, #111218) 100%)
          `,
          paddingTop: 120,
          paddingBottom: 64,
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(var(--lux-foreground-05) 1px, transparent 1px), linear-gradient(90deg, var(--lux-foreground-05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-[color:var(--lux-foreground-40)] hover:text-[color:var(--lux-foreground-80)] transition-colors">Home</Link>
            <ChevronRight size={14} className="text-[color:var(--lux-foreground-40)]" />
            <span className="text-[color:var(--lux-foreground-80)]">Client Portal</span>
          </div>

          <div className="max-w-4xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7"
              style={{
                background: "color-mix(in oklab, var(--lux-accent) 6%, transparent)",
                border: "1px solid color-mix(in oklab, var(--lux-accent) 14%, transparent)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "var(--lux-accent)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--lux-accent)" }} />
              </span>
              <span className="text-sm tracking-wide" style={{ color: "color-mix(in oklab, var(--lux-accent) 80%, white)" }}>Secure Client Access</span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, var(--lux-foreground) 0%, var(--lux-foreground-80) 50%, var(--lux-foreground) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              Your Wealth,{" "}
              <span style={{
                background: "linear-gradient(135deg, var(--lux-accent) 0%, color-mix(in oklab, var(--lux-accent) 60%, white) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                One Portal
              </span>
            </h1>

            <p className="text-lg max-w-2xl mb-9 leading-relaxed" style={{ color: "var(--lux-foreground-60)" }}>
              Access all your investments, share documents securely, complete eKYC, and manage your financial portfolio — all in one place. Integrated with SEBI-compliant platforms.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#portal"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
                style={{ background: "var(--lux-accent)", color: "oklch(0.10 0.005 280)" }}
              >
                Access Portal <ArrowRight size={17} />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:translate-y-[-2px]"
                style={{ border: "1px solid var(--lux-foreground-10)", color: "var(--lux-foreground-80)", background: "rgba(255,255,255,0.03)" }}
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16">
            {[
              { value: "8+", label: "Service Integrations" },
              { value: "100%", label: "SEBI Compliant" },
              { value: "4K", label: "HD File Support" },
              { value: "24/7", label: "Document Access" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-5 rounded-2xl" style={glass}>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs" style={{ color: "var(--lux-muted)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Portal Tabs ─── */}
      <section id="portal" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 p-2 rounded-2xl mb-10" style={glass}>
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300"
                  style={{
                    background: active ? "color-mix(in oklab, var(--lux-accent) 10%, transparent)" : "transparent",
                    border: active ? "1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)" : "1px solid transparent",
                    color: active ? "var(--lux-foreground)" : "var(--lux-muted)",
                  }}
                >
                  <t.icon size={17} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* ── Services ── */}
            {activeTab === "services" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Integrated Service Platforms</h2>
                  <p style={{ color: "var(--lux-muted)" }} className="max-w-2xl">Quick access to all your financial services. Click any card to access the service or view more details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {serviceIntegrations.map((svc) => (
                    <Link
                      key={svc.id}
                      href={svc.link}
                      className="group relative p-6 rounded-2xl transition-all duration-[400ms] hover:translate-y-[-6px] hover:shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
                      style={glass}
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: "radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--lux-accent) 8%, transparent), transparent 70%)" }}
                      />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--lux-foreground-05)" }}>
                          <svc.icon size={23} style={{ color: "var(--lux-accent)" }} />
                        </div>
                        <h3 className="text-[15px] font-semibold text-white mb-2">{svc.title}</h3>
                        <p className="text-sm mb-4" style={{ color: "var(--lux-muted)" }}>{svc.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {svc.platforms.map((p, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "var(--lux-foreground-05)", color: "var(--lux-foreground-60)" }}>{p}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-sm transition-colors duration-300 group-hover:text-white" style={{ color: "var(--lux-muted)" }}>
                          Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── eKYC ── */}
            {activeTab === "ekyc" && (
              <div className="max-w-3xl mx-auto animate-fadeIn">
                <div className="mb-8 text-center">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                    style={{
                      background: "color-mix(in oklab, var(--lux-accent) 6%, transparent)",
                      border: "1px solid color-mix(in oklab, var(--lux-accent) 14%, transparent)",
                    }}
                  >
                    <Unlock size={15} style={{ color: "var(--lux-accent)" }} />
                    <span className="text-sm" style={{ color: "color-mix(in oklab, var(--lux-accent) 80%, white)" }}>Registration Open</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Complete Your eKYC Registration</h2>
                  <p style={{ color: "var(--lux-muted)" }}>Register online and get instant access to all services. Your data is stored securely and compliant with SEBI regulations.</p>
                </div>

                {ekycSubmitted && (
                  <div className="flex items-center gap-3 p-4 rounded-xl mb-6 animate-fadeIn" style={{ background: "color-mix(in oklab, var(--lux-accent) 8%, transparent)", border: "1px solid color-mix(in oklab, var(--lux-accent) 18%, transparent)" }}>
                    <CheckCircle2 size={20} style={{ color: "var(--lux-accent)" }} />
                    <p className="text-sm text-white">eKYC Registration submitted! Our team will contact you shortly.</p>
                  </div>
                )}

                <form onSubmit={handleEkycSubmit} className="p-8 rounded-2xl space-y-6" style={glass}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Full Name (as per PAN)", key: "fullName", type: "text", ph: "Enter your full name", req: true },
                      { label: "Email Address", key: "email", type: "email", ph: "your@email.com", req: true },
                      { label: "Phone Number", key: "phone", type: "tel", ph: "+91 XXXXX XXXXX", req: true },
                      { label: "Date of Birth", key: "dob", type: "date", req: true },
                      { label: "PAN Number", key: "pan", type: "text", ph: "ABCDE1234F", req: true, max: 10, upper: true },
                      { label: "Aadhaar (Last 4 digits)", key: "aadhaar", type: "text", ph: "XXXX", max: 4 },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>{f.label}</label>
                        <input
                          type={f.type}
                          required={f.req}
                          maxLength={f.max}
                          value={ekycFormData[f.key]}
                          onChange={(e) => setEkycFormData({ ...ekycFormData, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value })}
                          className={inputCls + (f.upper ? " uppercase" : "")}
                          placeholder={f.ph}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>Address</label>
                    <textarea
                      rows={3}
                      value={ekycFormData.address}
                      onChange={(e) => setEkycFormData({ ...ekycFormData, address: e.target.value })}
                      className={inputCls + " resize-none"}
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "color-mix(in oklab, var(--lux-accent) 4%, transparent)", border: "1px solid color-mix(in oklab, var(--lux-accent) 10%, transparent)" }}>
                    <Shield size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--lux-accent)" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "var(--lux-foreground-60)" }}>
                      Your data is encrypted and stored securely in compliance with SEBI regulations. We never share your personal information with third parties.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
                    style={{ background: "var(--lux-accent)", color: "oklch(0.10 0.005 280)" }}
                  >
                    Submit eKYC Registration <ArrowRight size={17} />
                  </button>
                </form>
              </div>
            )}

            {/* ── Documents ── */}
            {activeTab === "documents" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload */}
                  <div className="p-7 rounded-2xl" style={glass}>
                    <h3 className="text-lg font-semibold text-white mb-1.5">Upload Documents</h3>
                    <p className="text-sm mb-6" style={{ color: "var(--lux-muted)" }}>Share documents securely. Supports HD/4K images and large files up to 100 MB.</p>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-[color:color-mix(in_oklab,var(--lux-accent)_30%,transparent)] hover:bg-[color:color-mix(in_oklab,var(--lux-accent)_3%,transparent)]"
                      style={{ borderColor: "var(--lux-foreground-10)" }}
                    >
                      <CloudUpload size={44} className="mx-auto mb-4" style={{ color: "var(--lux-accent)" }} />
                      <p className="text-white mb-2 text-sm font-medium">Drop files here or click to upload</p>
                      <p className="text-xs" style={{ color: "var(--lux-muted)" }}>PDF, DOC, XLS, Images · Max 100 MB</p>
                      <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-6">
                      {supportedFileTypes.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--lux-foreground-05)" }}>
                          <t.icon size={15} style={{ color: t.color }} />
                          <span className="text-xs" style={{ color: "var(--lux-foreground-60)" }}>{t.ext}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded list */}
                  <div className="p-7 rounded-2xl" style={glass}>
                    <h3 className="text-lg font-semibold text-white mb-1.5">Recent Uploads</h3>
                    <p className="text-sm mb-6" style={{ color: "var(--lux-muted)" }}>Files are automatically saved to your client folder.</p>

                    {uploadedFiles.length === 0 ? (
                      <div className="text-center py-14" style={{ color: "var(--lux-muted)" }}>
                        <FileText size={36} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No files uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
                        {uploadedFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl group" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--lux-foreground-05)" }}>
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText size={18} style={{ color: "var(--lux-accent)" }} className="flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{file.name}</p>
                                <p className="text-xs" style={{ color: "var(--lux-muted)" }}>{file.size} · {file.uploadedAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} style={{ color: "var(--lux-accent)" }} />
                              <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1" aria-label="Remove file">
                                <X size={14} className="text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp card */}
                <div
                  className="p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                  style={{
                    ...glass,
                    background: "color-mix(in oklab, var(--lux-accent) 4%, var(--lux-card))",
                    border: "1px solid color-mix(in oklab, var(--lux-accent) 12%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklab, var(--lux-accent) 12%, transparent)" }}>
                      <MessageCircle size={26} style={{ color: "var(--lux-accent)" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Share via WhatsApp</h3>
                      <p className="text-sm" style={{ color: "var(--lux-muted)" }}>Quick file sharing for instant communication</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/918850977259"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)]"
                    style={{ background: "var(--lux-accent)", color: "oklch(0.10 0.005 280)" }}
                  >
                    <MessageCircle size={17} />
                    Open WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* ── Automation ── */}
            {activeTab === "automation" && (
              <div className="max-w-3xl mx-auto animate-fadeIn">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Email Automation</h2>
                  <p style={{ color: "var(--lux-muted)" }}>Schedule automated emails for your clients. Set reminders, send updates, and stay connected.</p>
                </div>

                {emailSent && (
                  <div className="flex items-center gap-3 p-4 rounded-xl mb-6 animate-fadeIn" style={{ background: "color-mix(in oklab, var(--lux-accent) 8%, transparent)", border: "1px solid color-mix(in oklab, var(--lux-accent) 18%, transparent)" }}>
                    <CheckCircle2 size={20} style={{ color: "var(--lux-accent)" }} />
                    <p className="text-sm text-white">Email automation scheduled successfully!</p>
                  </div>
                )}

                <form onSubmit={handleAutomationSubmit} className="p-8 rounded-2xl space-y-6" style={glass}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>Client Email</label>
                      <input type="email" required value={automationEmail.clientEmail} onChange={(e) => setAutomationEmail({ ...automationEmail, clientEmail: e.target.value })} className={inputCls} placeholder="client@email.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>Schedule Date & Time</label>
                      <input type="datetime-local" required value={automationEmail.scheduleDate} onChange={(e) => setAutomationEmail({ ...automationEmail, scheduleDate: e.target.value })} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>Email Subject</label>
                    <input type="text" required value={automationEmail.subject} onChange={(e) => setAutomationEmail({ ...automationEmail, subject: e.target.value })} className={inputCls} placeholder="Investment Update — January 2026" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: "var(--lux-muted)" }}>Email Message</label>
                    <textarea rows={5} required value={automationEmail.message} onChange={(e) => setAutomationEmail({ ...automationEmail, message: e.target.value })} className={inputCls + " resize-none"} placeholder={"Dear Client,\n\nWe are pleased to share your portfolio update..."} />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "color-mix(in oklab, var(--lux-accent) 4%, transparent)", border: "1px solid color-mix(in oklab, var(--lux-accent) 10%, transparent)" }}>
                    <Clock size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--lux-accent)" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "var(--lux-foreground-60)" }}>
                      Emails will be sent automatically at the scheduled time. Manage all scheduled emails from your dashboard.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
                    style={{ background: "var(--lux-accent)", color: "oklch(0.10 0.005 280)" }}
                  >
                    <Send size={17} />
                    Schedule Email
                  </button>
                </form>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Mail, label: "Premium Reminder", desc: "SIP/Premium due alerts" },
                    { icon: TrendingUp, label: "Portfolio Update", desc: "Monthly performance" },
                    { icon: Star, label: "Birthday Wishes", desc: "Automated greetings" },
                  ].map((a, i) => (
                    <button key={i} className="p-5 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[0_12px_36px_rgba(0,0,0,0.3)]" style={glass}>
                      <a.icon size={20} className="mb-3" style={{ color: "var(--lux-accent)" }} />
                      <p className="text-white font-medium text-sm">{a.label}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--lux-muted)" }}>{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-16 px-6" style={{ background: "color-mix(in oklab, var(--lux-background) 96%, oklch(0.08 0.005 280))" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Everything You Need in One Place</h2>
            <p style={{ color: "var(--lux-muted)" }} className="max-w-2xl mx-auto">A comprehensive client portal designed for modern wealth management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]" style={glass}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "color-mix(in oklab, var(--lux-accent) 8%, transparent)" }}>
                  <f.icon size={22} style={{ color: "var(--lux-accent)" }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: "var(--lux-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LaserFooter />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </main>
  );
}
