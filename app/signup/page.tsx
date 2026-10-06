"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getRegisteredCompanies,
  saveRegisteredCompany,
  submitStaffApplication,
  RegisteredCompany,
  StaffApplication,
} from "../lib/companyStaffData";

interface UploadedDoc {
  type: "pan" | "company_reg" | "owner_id";
  name: string;
  size: string;
  previewUrl?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  // Role: "recondition" (Showroom Company) | "staff" (Showroom Staff / Recruit) | "seller" (Bike Owner)
  const [role, setRole] = useState<"recondition" | "staff" | "seller">("recondition");

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState("Kathmandu Valley");

  // Recondition Company Fields (PAN + Registered Documents)
  const [businessName, setBusinessName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [companyRegNumber, setCompanyRegNumber] = useState("");
  const [workshopHub, setWorkshopHub] = useState("Teku, Kathmandu");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({
    pan: {
      type: "pan",
      name: "IRD_PAN_Certificate_Signed.pdf",
      size: "1.4 MB",
    },
    company_reg: {
      type: "company_reg",
      name: "Company_Registrar_Darta_Certificate.pdf",
      size: "2.1 MB",
    },
  });

  // Staff Recruitment Specific Fields
  const [staffCompanyPan, setStaffCompanyPan] = useState("601928471");
  const [matchedCompany, setMatchedCompany] = useState<RegisteredCompany | null>(null);
  const [staffRole, setStaffRole] = useState("Senior Mechanic (Chassis & Engine)");
  const [citizenshipNumber, setCitizenshipNumber] = useState("27-01-78-01924");
  const [registeredCompaniesList, setRegisteredCompaniesList] = useState<RegisteredCompany[]>([]);

  // Submission & Dialog States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedStaffApp, setSubmittedStaffApp] = useState<StaffApplication | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const panFileRef = useRef<HTMLInputElement>(null);
  const companyRegFileRef = useRef<HTMLInputElement>(null);
  const ownerIdFileRef = useRef<HTMLInputElement>(null);

  // Load registered companies and validate PAN for staff
  useEffect(() => {
    const list = getRegisteredCompanies();
    setRegisteredCompaniesList(list);
    const match = list.find((c) => c.panNumber.trim() === staffCompanyPan.trim());
    setMatchedCompany(match || null);
  }, [staffCompanyPan]);

  const handlePanChange = (inputPan: string) => {
    setStaffCompanyPan(inputPan);
    const clean = inputPan.trim().replace(/[^0-9]/g, "");
    const match = registeredCompaniesList.find((c) => c.panNumber === clean);
    setMatchedCompany(match || null);
  };

  const handleFileUpload = (type: "pan" | "company_reg" | "owner_id", files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedDocs((prev) => ({
      ...prev,
      [type]: {
        type,
        name: file.name,
        size: `${sizeMb} MB`,
        previewUrl: URL.createObjectURL(file),
      },
    }));
  };

  const removeDoc = (type: "pan" | "company_reg" | "owner_id") => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Recondition Company Validation
    if (role === "recondition") {
      const cleanPan = panNumber.trim().replace(/[^0-9]/g, "");
      if (cleanPan.length !== 9) {
        setErrorMessage("Please enter a valid 9-digit Government PAN / VAT number.");
        return;
      }

      if (!uploadedDocs.pan) {
        setErrorMessage("Please attach or upload your official PAN / VAT registration certificate.");
        return;
      }

      if (!uploadedDocs.company_reg) {
        setErrorMessage("Please attach your Company / Ward Business Registration certificate.");
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        saveRegisteredCompany({
          panNumber: cleanPan,
          businessName: businessName.trim() || "Verified Showroom Hub Pvt. Ltd.",
          ownerName: fullName.trim() || "Showroom Proprietor",
          location: workshopHub,
          phone: phone || "+977 9851-000000",
          email: email || "showroom@mulyankan.np",
          registrationNumber: companyRegNumber || "248190/079/080",
          registeredAt: new Date().toISOString().split("T")[0],
          isVerified: true,
        });

        setSuccessNotice(
          `Showroom company registered! PAN ${cleanPan} is verified. Live auction bidding unlocked.`
        );
        setTimeout(() => {
          router.push("/?tab=dealer");
        }, 1500);
      }, 900);
      return;
    }

    // 2. Showroom Staff Recruitment Validation
    if (role === "staff") {
      const cleanPan = staffCompanyPan.trim().replace(/[^0-9]/g, "");
      if (cleanPan.length !== 9) {
        setErrorMessage("Please enter a valid 9-digit Company PAN number.");
        return;
      }

      if (!matchedCompany) {
        setErrorMessage(
          `Company with PAN ${cleanPan} is not registered yet. The company owner must register the showroom first.`
        );
        return;
      }

      if (!fullName.trim() || !phone.trim() || !password.trim()) {
        setErrorMessage("Please fill in all mandatory staff profile fields.");
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const app = submitStaffApplication({
          companyPan: cleanPan,
          companyName: matchedCompany.businessName,
          applicantName: fullName.trim(),
          role: staffRole,
          phone: phone.trim(),
          email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, ".")}@mulyankan.np`,
          password: password,
          citizenshipNumber: citizenshipNumber.trim(),
        });

        setSubmittedStaffApp(app);
      }, 900);
      return;
    }

    // 3. Normal Seller Registration
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessNotice("Account created successfully! Direct posting and private offers active.");
      setTimeout(() => {
        router.push("/?tab=seller_dashboard");
      }, 1500);
    }, 900);
  };

  const handleQuickFill = (targetRole: "recondition" | "staff" | "seller") => {
    setRole(targetRole);
    setErrorMessage("");

    if (targetRole === "recondition") {
      setBusinessName("Teku Moto Recondition Hub Pvt. Ltd.");
      setPanNumber("601928471");
      setCompanyRegNumber("248190/079/080");
      setFullName("Ramesh Shrestha");
      setPhone("+977 9851092834");
      setEmail("teku.hub@mulyankan.np");
      setPassword("TekuHubSecure2026");
      setWorkshopHub("Teku, Kathmandu");
    } else if (targetRole === "staff") {
      setStaffCompanyPan("601928471");
      setFullName("Bikash Tamang");
      setStaffRole("Senior Mechanic (Chassis & Engine)");
      setPhone("+977 9813-449102");
      setEmail("bikash.tamang@gmail.com");
      setCitizenshipNumber("27-01-76-04921");
      setPassword("StaffAccess2026");
    } else {
      setFullName("Prashant Shrestha");
      setPhone("+977 9841892341");
      setEmail("prashant.karki@gmail.com");
      setPassword("SellerSecret2026");
      setLocation("New Baneshwor, Kathmandu");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col justify-between selection:bg-[#E5B869] selection:text-black font-sans">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#E5B869]/15 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-[#121318]/90 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-[#E5B869] hover:text-white transition-all cursor-pointer shadow"
            title="Undo / Go back"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden min-[360px]:inline">Back</span>
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E5B869] to-amber-400 flex items-center justify-center font-black text-black text-base shadow group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                MULYANKAN<span className="text-[#E5B869]">.NP</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono tracking-widest hidden sm:block">
                NEPAL TWO-WHEELER EXCHANGE
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <span className="text-neutral-400 hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="whitespace-nowrap px-3 sm:px-4 py-2 rounded-full border border-white/20 hover:border-[#E5B869] text-white hover:text-[#E5B869] transition-all font-semibold"
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-[#14161f] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle gold corner accent */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#E5B869]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title and Role Selection */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/30 text-[#E5B869] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-pulse" />
              <span>REGISTRATION PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create Your Mulyankan Account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Select your role: Register your Showroom Company, Apply as Staff with Company PAN, or Post as Seller.
            </p>
          </div>

          {/* Role Switcher: 3 Options */}
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-black/60 border border-white/10 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => handleQuickFill("recondition")}
              className={`min-w-0 py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                role === "recondition"
                  ? "bg-[#E5B869] text-black shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-center leading-tight text-[11px] sm:text-xs">Company (Owner)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("staff")}
              className={`min-w-0 py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                role === "staff"
                  ? "bg-[#E5B869] text-black shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-center leading-tight text-[11px] sm:text-xs">Showroom Staff</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("seller")}
              className={`min-w-0 py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                role === "seller"
                  ? "bg-[#E5B869] text-black shadow-lg"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-center leading-tight text-[11px] sm:text-xs">Bike Seller</span>
            </button>
          </div>

          {/* Quick Explanation Banner */}
          {role === "recondition" && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-[#E5B869] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Showroom Proprietor Mode:</strong> Requires your 9-Digit Government PAN/VAT number and registered business certificates. Once verified, you can recruit staff members and authorize them to access the War Room and live bidding floor.
              </span>
            </div>
          )}

          {role === "staff" && (
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>
                <strong>Staff Recruitment Protocol:</strong> First, your showroom company must be registered. Enter your company’s 9-digit PAN number below. Upon signing up, a notification is sent to your Showroom Owner for review and approval.
              </span>
            </div>
          )}

          {role === "seller" && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                <strong>Bike Poster Mode:</strong> Immediate registration to manage postings, receive private dealer offers, and conduct physical handover with Yatayat transfer.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
            {/* 1. SHOWROOM COMPANY SPECIFIC FIELDS */}
            {role === "recondition" && (
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-mono text-[#E5B869] uppercase font-bold tracking-wider text-[11px]">
                    Company Registration &amp; Tax Documents
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Mandatory for Dealers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      Showroom / Business Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Teku Moto Recondition Hub Pvt. Ltd."
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      Government 9-Digit PAN / VAT *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      placeholder="e.g. 601928471"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      OCR / Company Reg Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 248190/079/080"
                      value={companyRegNumber}
                      onChange={(e) => setCompanyRegNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      Workshop Location Hub *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Teku, Kathmandu"
                      value={workshopHub}
                      onChange={(e) => setWorkshopHub(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                    />
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="block font-bold text-neutral-300">
                    Official Certificates Upload (PDF / JPG) *
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* PAN Card Upload */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <svg className="w-4 h-4 text-[#E5B869] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="truncate">
                          <p className="font-bold text-white text-[11px] truncate">1. PAN/VAT Certificate</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {uploadedDocs.pan ? uploadedDocs.pan.name : "Pending attachment"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => panFileRef.current?.click()}
                        className="text-[10px] px-2 py-1 rounded bg-[#E5B869]/20 text-[#E5B869] hover:bg-[#E5B869] hover:text-black font-bold transition-colors cursor-pointer"
                      >
                        {uploadedDocs.pan ? "Replace" : "Upload"}
                      </button>
                      <input
                        ref={panFileRef}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("pan", e.target.files)}
                      />
                    </div>

                    {/* Company Reg Upload */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="truncate">
                          <p className="font-bold text-white text-[11px] truncate">2. OCR / Darta Certificate</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {uploadedDocs.company_reg ? uploadedDocs.company_reg.name : "Pending attachment"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => companyRegFileRef.current?.click()}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold transition-colors cursor-pointer"
                      >
                        {uploadedDocs.company_reg ? "Replace" : "Upload"}
                      </button>
                      <input
                        ref={companyRegFileRef}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload("company_reg", e.target.files)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SHOWROOM STAFF SPECIFIC FIELDS (Company PAN lookup) */}
            {role === "staff" && (
              <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-cyan-500/30">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-mono text-cyan-400 uppercase font-bold tracking-wider text-[11px]">
                    Company Affiliation &amp; Showroom PAN
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Target Showroom</span>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">
                    Enter Showroom Company PAN Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={9}
                      placeholder="e.g. 601928471"
                      value={staffCompanyPan}
                      onChange={(e) => handlePanChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => handlePanChange("601928471")}
                      className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 font-mono whitespace-nowrap cursor-pointer"
                      title="Quick fill Teku Moto Recondition Hub PAN"
                    >
                      Teku PAN
                    </button>
                  </div>

                  {/* Company Validation Feedback Badge */}
                  {matchedCompany ? (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold text-[10px]">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white leading-tight">
                            {matchedCompany.businessName}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            Proprietor: {matchedCompany.ownerName} • {matchedCompany.location}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                        VERIFIED HUB
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Showroom not found. Ensure the proprietor has registered the showroom with this PAN.</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      Staff Role / Designation *
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="Senior Mechanic (Chassis & Engine)">Senior Mechanic (Chassis & Engine)</option>
                      <option value="Valuation Appraiser & Test Rider">Valuation Appraiser & Test Rider</option>
                      <option value="Procurement & Yatayat Liaison">Procurement & Yatayat Liaison</option>
                      <option value="Showroom Sales & Exchange Executive">Showroom Sales & Exchange Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1">
                      National ID / Citizenship Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 27-01-76-04921"
                      value={citizenshipNumber}
                      onChange={(e) => setCitizenshipNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. COMMON PROFILE FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  {role === "recondition" ? "Proprietor Full Name *" : "Staff / Your Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === "recondition" ? "e.g. Ramesh Shrestha" : "e.g. Bikash Tamang"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Mobile Number (Nepal) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+977 98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#E5B869]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.np"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E5B869]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-[10px] font-mono cursor-pointer"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{successNotice}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E5B869] to-amber-500 hover:from-[#d4a758] hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : role === "recondition" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Register Showroom Company</span>
                  </>
                ) : role === "staff" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Submit Staff Application to Company Owner</span>
                  </>
                ) : (
                  <span>Create Free Seller Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* STAFF ONBOARDING CONFIRMATION MODAL */}
      {submittedStaffApp && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151722] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-neutral-200 relative">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest">
                Application Received • Status: Pending Approval
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                Notification Sent to Showroom Owner!
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                Your staff onboarding request for <strong>{submittedStaffApp.applicantName}</strong> has been forwarded
                to the proprietor of <strong>{submittedStaffApp.companyName}</strong> (PAN:{" "}
                <span className="font-mono text-[#E5B869]">{submittedStaffApp.companyPan}</span>).
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Designation Applied:</span>
                <span className="font-bold text-white">{submittedStaffApp.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Contact Phone:</span>
                <span className="font-mono text-neutral-200">{submittedStaffApp.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Showroom Verification:</span>
                <span className="font-semibold text-emerald-400">PAN Registered &amp; Matched</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-neutral-400">Authorization Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  AWAITING OWNER APPROVAL
                </span>
              </div>
            </div>

            {/* Action Buttons for Review / Simulation */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  router.push("/?tab=dealer&view=recruitment");
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5B869] to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Go to Showroom Owner Console (Simulate Approval)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedStaffApp(null);
                  router.push("/login");
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
              >
                Return to Login Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#121318] px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        Mulyankan Nepal • Authorized Recondition Houses &amp; Two-Wheeler Exchange Network
      </footer>
    </div>
  );
}
