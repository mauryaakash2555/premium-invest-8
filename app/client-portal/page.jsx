"use client";

/**
 * Client Portal Page - Databahn-style UI
 * 
 * Features:
 * - Service integrations (MF, PMS, SIP, Insurance, LIC, Trading, FD)
 * - eKYC registration
 * - Document sharing (PDF, Word, Excel, etc.)
 * - WhatsApp file sharing
 * - Automated emails
 * - Large file uploads (HD/4K)
 * - Client data storage
 */

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Upload, 
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
  Wallet,
  Users,
  Check,
  ExternalLink,
  Download,
  Clock,
  Star,
  ChevronRight,
  Lock,
  Unlock,
  CloudUpload,
  FileSpreadsheet,
  FileImage,
  File,
  Send
} from "lucide-react";
import LaserFooter from "@/components/user/LaserFooter";

// Service integration cards data - PREMIUM DARK STYLE (no colorful cards)
const serviceIntegrations = [
  {
    id: "mutual-funds",
    title: "Mutual Funds",
    icon: TrendingUp,
    description: "Access 5000+ mutual fund schemes across all AMCs",
    platforms: ["MF Central", "CAMS"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/mutual-funds"
  },
  {
    id: "pms",
    title: "Portfolio Management",
    icon: Briefcase,
    description: "Professional portfolio management with SEBI-registered PMS",
    platforms: ["SEBI Registered PMS", "Customized Portfolios"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/portfolio-management"
  },
  {
    id: "sip",
    title: "SIP Investments",
    icon: PiggyBank,
    description: "Systematic investment plans with auto-debit facility",
    platforms: ["NACH Mandate", "E-Mandate"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/sip"
  },
  {
    id: "insurance",
    title: "Insurance",
    icon: Shield,
    description: "Life, health, and general insurance solutions",
    platforms: ["Term Plans", "Health Insurance"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/insurance"
  },
  {
    id: "lic",
    title: "LIC Policies",
    icon: Heart,
    description: "LIC policy management and premium tracking",
    platforms: ["LIC Portal", "Premium Calculator"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/insurance"
  },
  {
    id: "trading",
    title: "Trading Services",
    icon: BarChart3,
    description: "Equity, derivatives, and commodity trading",
    platforms: ["NSE", "BSE"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/trading-services"
  },
  {
    id: "fd",
    title: "Fixed Deposits",
    icon: Building2,
    description: "Corporate FDs with competitive interest rates",
    platforms: ["Bank FDs", "Corporate FDs"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/fixed-deposits"
  },
  {
    id: "compliance",
    title: "SEBI Compliance",
    icon: Lock,
    description: "Regulatory compliance and documentation",
    platforms: ["SEBI Guidelines", "KYC Compliance"],
    color: "rgba(255, 255, 255, 0.02)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    link: "/compliance"
  }
];

// Supported file types
const supportedFileTypes = [
  { ext: "PDF", icon: FileText, color: "#FF6B6B" },
  { ext: "DOC/DOCX", icon: FileText, color: "#4A90D9" },
  { ext: "XLS/XLSX", icon: FileSpreadsheet, color: "#2ECC71" },
  { ext: "JPG/PNG", icon: FileImage, color: "#9B59B6" },
  { ext: "Any File", icon: File, color: "#95A5A6" }
];

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [ekycFormData, setEkycFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    pan: "",
    aadhaar: "",
    dob: "",
    address: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [automationEmail, setAutomationEmail] = useState({ clientEmail: "", subject: "", message: "", scheduleDate: "" });
  const fileInputRef = useRef(null);

  const handleEkycSubmit = async (e) => {
    e.preventDefault();
    // In production, this would send to your backend
    console.log("eKYC Registration Data:", ekycFormData);
    alert("eKYC Registration submitted! Our team will contact you shortly.");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type,
      uploadedAt: new Date().toLocaleString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleAutomationSubmit = (e) => {
    e.preventDefault();
    console.log("Automation Email:", automationEmail);
    alert("Email automation scheduled successfully!");
    setAutomationEmail({ clientEmail: "", subject: "", message: "", scheduleDate: "" });
  };

  const tabs = [
    { id: "services", label: "Services", icon: Briefcase },
    { id: "ekyc", label: "eKYC Register", icon: Users },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "automation", label: "Automation", icon: Mail }
  ];

  return (
    <main className="min-h-screen bg-[#0A0B0D]">
      {/* Hero Section - Databahn Style */}
      <section 
        className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(100, 150, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(150, 100, 255, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, #0A0B0D 0%, #0D0E12 100%)
          `,
          paddingTop: "120px",
          paddingBottom: "60px"
        }}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 150, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 150, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px"
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-gray-300">Client Portal</span>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[rgba(100,150,255,0.08)] border border-[rgba(100,150,255,0.15)] mb-6">
              <div className="w-2 h-2 rounded-full bg-[#64B5F6] animate-pulse" />
              <span className="text-sm text-[rgba(200,220,255,0.8)] tracking-wide">Secure Client Access</span>
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.85) 50%, rgba(255,255,255,0.90) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1
              }}
            >
              Your Wealth,{" "}
              <span style={{ 
                background: "linear-gradient(135deg, var(--lux-accent) 0%, color-mix(in oklab, var(--lux-accent) 60%, white) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                One Portal
              </span>
            </h1>

            <p className="text-lg text-[rgba(200,210,230,0.7)] max-w-2xl mb-8 leading-relaxed">
              Access all your investments, share documents securely, complete eKYC, and manage your 
              financial portfolio — all in one place. Integrated with SEBI-compliant platforms.
            </p>

            <div className="flex flex-wrap gap-4">
              <a 
                href="#portal"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-none"
              >
                Access Portal <ArrowRight size={18} />
              </a>
              <Link 
                href="/contact"
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-none"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: "8+", label: "Service Integrations" },
              { value: "100%", label: "SEBI Compliant" },
              { value: "4K", label: "HD File Support" },
              { value: "24/7", label: "Document Access" }
            ].map((stat, i) => (
              <div 
                key={i}
                className="text-center p-4 rounded-none"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Portal Section */}
      <section id="portal" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div 
            className="flex flex-wrap gap-2 p-2 rounded-none mb-10"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)"
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-none font-medium transition-all duration-300
                  ${activeTab === tab.id 
                    ? "bg-[rgba(100,150,255,0.12)] text-white border border-[rgba(100,150,255,0.25)]" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-[rgba(255,255,255,0.03)]"
                  }
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Integrated Service Platforms
                  </h2>
                  <p className="text-gray-400 max-w-2xl">
                    Quick access to all your financial services. Click any card to access the service or view more details.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {serviceIntegrations.map((service) => (
                    <Link
                      key={service.id}
                      href={service.link}
                      className="group relative p-6 rounded-none transition-all duration-300 hover:translate-y-[-4px]"
                      style={{
                        background: service.color,
                        border: `1px solid ${service.borderColor}`,
                      }}
                    >
                      <div 
                        className="absolute inset-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${service.borderColor}, transparent 70%)`
                        }}
                      />
                      
                      <div className="relative">
                        <div 
                          className="w-12 h-12 rounded-none flex items-center justify-center mb-4"
                          style={{ background: service.borderColor }}
                        >
                          <service.icon size={24} className="text-white" />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{service.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {service.platforms.slice(0, 2).map((platform, i) => (
                            <span 
                              key={i}
                              className="text-xs px-2 py-1 rounded-none"
                              style={{ 
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.7)"
                              }}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 mt-4 text-sm text-gray-400 group-hover:text-white transition-colors">
                          Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* eKYC Tab */}
            {activeTab === "ekyc" && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[rgba(100,220,180,0.08)] border border-[rgba(100,220,180,0.20)] mb-4">
                    <Unlock size={16} className="text-[#64DCA8]" />
                    <span className="text-sm text-[rgba(100,220,180,0.9)]">Registration Open</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Complete Your eKYC Registration
                  </h2>
                  <p className="text-gray-400">
                    Register online and get instant access to all services. Your data is stored securely and compliant with SEBI regulations.
                  </p>
                </div>

                <form 
                  onSubmit={handleEkycSubmit}
                  className="p-8 rounded-none space-y-6"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Full Name (as per PAN)</label>
                      <input
                        type="text"
                        required
                        value={ekycFormData.fullName}
                        onChange={(e) => setEkycFormData({...ekycFormData, fullName: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={ekycFormData.email}
                        onChange={(e) => setEkycFormData({...ekycFormData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={ekycFormData.phone}
                        onChange={(e) => setEkycFormData({...ekycFormData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={ekycFormData.dob}
                        onChange={(e) => setEkycFormData({...ekycFormData, dob: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">PAN Number</label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={ekycFormData.pan}
                        onChange={(e) => setEkycFormData({...ekycFormData, pan: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)] uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Aadhaar Number (Last 4 digits)</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={ekycFormData.aadhaar}
                        onChange={(e) => setEkycFormData({...ekycFormData, aadhaar: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                        placeholder="XXXX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Address</label>
                    <textarea
                      rows={3}
                      value={ekycFormData.address}
                      onChange={(e) => setEkycFormData({...ekycFormData, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)] resize-none"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-none bg-[rgba(100,150,255,0.05)] border border-[rgba(100,150,255,0.10)]">
                    <Shield size={20} className="text-[#64B5F6] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">
                      Your data is encrypted and stored securely in compliance with SEBI regulations. 
                      We never share your personal information with third parties.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 rounded-none font-semibold flex items-center justify-center gap-2"
                  >
                    Submit eKYC Registration <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Section */}
                  <div 
                    className="p-6 rounded-none"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Documents</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Share documents securely with us. Supports HD/4K images and large files up to 100MB.
                    </p>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[rgba(100,150,255,0.25)] rounded-none p-10 text-center cursor-pointer hover:border-[rgba(100,150,255,0.45)] hover:bg-[rgba(100,150,255,0.03)] transition-all"
                    >
                      <CloudUpload size={48} className="mx-auto mb-4 text-[#64B5F6]" />
                      <p className="text-white mb-2">Drop files here or click to upload</p>
                      <p className="text-gray-500 text-sm">PDF, DOC, XLS, Images • Max 100MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      />
                    </div>

                    {/* Supported File Types */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      {supportedFileTypes.map((type, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-none"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                          <type.icon size={16} style={{ color: type.color }} />
                          <span className="text-xs text-gray-400">{type.ext}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  <div 
                    className="p-6 rounded-none"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">Recent Uploads</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Files uploaded will be automatically saved to your client folder.
                    </p>

                    {uploadedFiles.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText size={40} className="mx-auto mb-3 opacity-50" />
                        <p>No files uploaded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {uploadedFiles.map((file, i) => (
                          <div 
                            key={i}
                            className="flex items-center justify-between p-4 rounded-none"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-[#64B5F6]" />
                              <div>
                                <p className="text-white text-sm">{file.name}</p>
                                <p className="text-gray-500 text-xs">{file.size} • {file.uploadedAt}</p>
                              </div>
                            </div>
                            <Check size={18} className="text-green-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Share */}
                <div 
                  className="p-6 rounded-none flex flex-col md:flex-row items-center justify-between gap-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(37, 211, 102, 0.02) 100%)",
                    border: "1px solid rgba(37, 211, 102, 0.20)"
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-none bg-[rgba(37,211,102,0.15)] flex items-center justify-center">
                      <MessageCircle size={28} className="text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Share via WhatsApp</h3>
                      <p className="text-gray-400 text-sm">Quick file sharing through WhatsApp for instant communication</p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/918850977259"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-none bg-[#25D366] text-white font-semibold flex items-center gap-2 hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle size={18} />
                    Open WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Automation Tab */}
            {activeTab === "automation" && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Email Automation
                  </h2>
                  <p className="text-gray-400">
                    Schedule automated emails for your clients. Set reminders, send updates, and stay connected.
                  </p>
                </div>

                <form 
                  onSubmit={handleAutomationSubmit}
                  className="p-8 rounded-none space-y-6"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Client Email</label>
                      <input
                        type="email"
                        required
                        value={automationEmail.clientEmail}
                        onChange={(e) => setAutomationEmail({...automationEmail, clientEmail: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                        placeholder="client@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={automationEmail.scheduleDate}
                        onChange={(e) => setAutomationEmail({...automationEmail, scheduleDate: e.target.value})}
                        className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Subject</label>
                    <input
                      type="text"
                      required
                      value={automationEmail.subject}
                      onChange={(e) => setAutomationEmail({...automationEmail, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)]"
                      placeholder="Investment Update - January 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Message</label>
                    <textarea
                      rows={5}
                      required
                      value={automationEmail.message}
                      onChange={(e) => setAutomationEmail({...automationEmail, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-none bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] text-white placeholder-gray-500 focus:outline-none focus:border-[rgba(100,150,255,0.4)] resize-none"
                      placeholder="Dear Client,

We are pleased to share your portfolio update..."
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-none bg-[rgba(100,220,180,0.05)] border border-[rgba(100,220,180,0.15)]">
                    <Clock size={20} className="text-[#64DCA8] flex-shrink-0" />
                    <p className="text-sm text-gray-400">
                      Emails will be sent automatically at the scheduled time. You can manage all scheduled emails from your dashboard.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 rounded-none font-semibold flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Schedule Email
                  </button>
                </form>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Mail, label: "Premium Reminder", desc: "SIP/Premium due alerts" },
                    { icon: TrendingUp, label: "Portfolio Update", desc: "Monthly performance" },
                    { icon: Star, label: "Birthday Wishes", desc: "Automated greetings" }
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="p-4 rounded-none text-left hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)"
                      }}
                    >
                      <action.icon size={20} className="text-[#64B5F6] mb-2" />
                      <p className="text-white font-medium text-sm">{action.label}</p>
                      <p className="text-gray-500 text-xs">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-[#08090B]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive client portal designed for modern wealth management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "SEBI Compliant", desc: "All integrations follow SEBI guidelines and regulations" },
              { icon: CloudUpload, title: "Large File Support", desc: "Upload HD/4K images and files up to 100MB" },
              { icon: Lock, title: "Secure Storage", desc: "Bank-grade encryption for all your documents" },
              { icon: Mail, title: "Email Automation", desc: "Schedule automated emails for client communication" },
              { icon: MessageCircle, title: "WhatsApp Integration", desc: "Quick file sharing through WhatsApp" },
              { icon: Users, title: "Client Management", desc: "Organize client data in separate folders automatically" }
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-6 rounded-none"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}
              >
                <div className="w-12 h-12 rounded-none bg-[rgba(100,150,255,0.10)] flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-[#64B5F6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LaserFooter />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </main>
  );
}
