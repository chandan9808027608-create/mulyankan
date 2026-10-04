"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRegisteredCompanies, getStaffApplications } from "../lib/companyStaffData";

export default function LoginPage() {
  const router = useRouter();

  // Role: "recondition" (Showroom Owner) | "staff" (Showroom Staff) | "seller" (Bike Poster)
  const [role, setRole] = useState<"recondition" | "staff" | "seller">("recondition");
  const [username, setUsername] = useState("");
  const [companyPan, setCompanyPan] = useState("601928471");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Phone Mockup Tutorial State
  const [phoneTutorialRole, setPhoneTutorialRole] = useState<"seller" | "recondition" | "staff">("staff");
  const [phoneTutorialStep, setPhoneTutorialStep] = useState(0);

  const SELLER_STEPS = [
    {
      step: 1,
      badge: "Step 1 of 3",
      title: "Direct Vehicle Entry",
      subtitle: "Zero sign-up required to post",
      desc: "Select your motorcycle model, kilometer mileage, and upload 1 photo. No account or password needed.",
      cardTitle: "2023 Yamaha R15 V4",
      cardMeta: "Plate: BA 02-04 PA 8812 • 11,200 km",
      badgeText: "Instant 30-Sec Post",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      step: 2,
      badge: "Step 2 of 3",
      title: "Receive Cash Offers",
      subtitle: "Verified Kathmandu showrooms compete",
      desc: "Enter your Nepal phone number. Verified recondition houses review your bike and place direct bids.",
      cardTitle: "Phone: +977 9841-XXXXXX",
      cardMeta: "Private & confidential until deal is accepted",
      badgeText: "SMS & WhatsApp Alerts",
      tagColor: "bg-[#E5B869]/15 text-[#E5B869] border-[#E5B869]/30",
    },
    {
      step: 3,
      badge: "Step 3 of 3",
      title: "Lock Deal & Handover",
      subtitle: "Direct cash payment at your location",
      desc: "Accept the highest standing offer in My Postings. Meet the showroom owner to complete Yatayat name transfer.",
      cardTitle: "Offer: NPR 3,45,000",
      cardMeta: "Teku Moto Hub • Form No. 2 Provided",
      badgeText: "Yatayat Transfer Ready",
      tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
  ];

  const RECONDITION_STEPS = [
    {
      step: 1,
      badge: "Step 1 of 3",
      title: "Showroom Registration",
      subtitle: "For registered workshop businesses",
      desc: "Enter your showroom business name, workshop location in Kathmandu Valley, and proprietor contact details.",
      cardTitle: "Teku Moto Recondition",
      cardMeta: "Ward 12, Teku Hub, Kathmandu",
      badgeText: "Showrooms Only",
      tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      step: 2,
      badge: "Step 2 of 3",
      title: "9-Digit IRD PAN & Docs",
      subtitle: "Mandatory government tax verification",
      desc: "Submit your 9-digit PAN/VAT number and upload your Ward/OCR business certificate for verified dealer status.",
      cardTitle: "PAN / VAT: 601928471",
      cardMeta: "OCR Certificate & Owner Citizenship",
      badgeText: "IRD Verified Status",
      tagColor: "bg-[#E5B869]/15 text-[#E5B869] border-[#E5B869]/30",
    },
    {
      step: 3,
      badge: "Step 3 of 3",
      title: "Live Auctions & Handover",
      subtitle: "Confidential wholesale access",
      desc: "Access the live bidding floor, outbid competitors on private postings, and complete verified handovers.",
      cardTitle: "Live Auction Console",
      cardMeta: "Direct Spot Handover & Verified Inspection",
      badgeText: "Spot Handover Kit",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
  ];

  const STAFF_STEPS = [
    {
      step: 1,
      badge: "Step 1 of 3",
      title: "Company Registration",
      subtitle: "Showroom registers with PAN first",
      desc: "Before any staff can be recruited, the showroom proprietor must register their company with government PAN.",
      cardTitle: "Teku Moto Recondition Hub",
      cardMeta: "Govt PAN: 601928471 • Verified",
      badgeText: "Prerequisite Required",
      tagColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      step: 2,
      badge: "Step 2 of 3",
      title: "Staff Signs Up with PAN",
      subtitle: "Mechanics, appraisers, & sales staff",
      desc: "Staff enters the company's 9-digit PAN number during sign up. Notification routes directly to the showroom owner.",
      cardTitle: "Applicant: Bikash Tamang",
      cardMeta: "Role: Senior Mechanic • PAN: 601928471",
      badgeText: "Notification Routed",
      tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      step: 3,
      badge: "Step 3 of 3",
      title: "Owner Authorizes Access",
      subtitle: "1-Click approval in owner dashboard",
      desc: "Proprietor reviews the candidate in Recruitment Console and clicks Approve. Staff gains instant access to the War Room.",
      cardTitle: "Owner Approval Granted",
      cardMeta: "Ramesh Shrestha (Proprietor) Approved",
      badgeText: "War Room Unlocked",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
  ];

  const currentSteps =
    phoneTutorialRole === "seller" ? SELLER_STEPS : phoneTutorialRole === "recondition" ? RECONDITION_STEPS : STAFF_STEPS;
  const activeStep = currentSteps[phoneTutorialStep] || currentSteps[0];

  // Auto-advance tutorial steps
  useEffect(() => {
    const timer = setInterval(() => {
      setPhoneTutorialStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, [phoneTutorialRole]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setPendingNotice(null);

    setTimeout(() => {
      setIsLoading(false);

      if (role === "recondition") {
        // Authorize recondition mode and go to live auction floor
        router.push("/?tab=dealer");
      } else if (role === "staff") {
        const cleanPan = companyPan.trim().replace(/[^0-9]/g, "");
        const apps = getStaffApplications();
        const found = apps.find(
          (a) =>
            a.companyPan === cleanPan &&
            (a.email.toLowerCase() === username.toLowerCase().trim() ||
              a.applicantName.toLowerCase().includes(username.toLowerCase().trim()))
        );

        if (found) {
          if (found.status === "pending_owner_approval") {
            setPendingNotice(
              `Application Pending Approval: Your account for ${found.applicantName} (${found.role}) has been submitted to the proprietor of ${found.companyName} (PAN: ${cleanPan}). You will receive access as soon as the showroom owner approves your account.`
            );
            return;
          }
          // Approved staff
          router.push("/?tab=dealer&view=staff_chat");
        } else {
          // Check if company exists
          const companies = getRegisteredCompanies();
          const comp = companies.find((c) => c.panNumber === cleanPan);
          if (comp) {
            router.push("/?tab=dealer&view=staff_chat");
          } else {
            setErrorMessage("No registered showroom company found with this PAN number.");
          }
        }
      } else {
        // Go to seller postings dashboard
        router.push("/?tab=seller_dashboard");
      }
    }, 700);
  };

  const handleQuickFill = (targetRole: "recondition" | "staff" | "seller") => {
    setRole(targetRole);
    setErrorMessage("");
    setPendingNotice(null);

    if (targetRole === "recondition") {
      setUsername("teku.workshop@mulyankan.np");
      setPassword("TekuRecondition2026");
    } else if (targetRole === "staff") {
      setUsername("bikash.tamang@gmail.com");
      setCompanyPan("601928471");
      setPassword("StaffAccess2026");
    } else {
      setUsername("prashant.seller@gmail.com");
      setPassword("SellerKathmandu98");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white flex flex-col justify-between selection:bg-[#E5B869] selection:text-black font-sans">
      {/* Top Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#E5B869]/10 blur-[150px]" />
        <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[130px]" />
      </div>

      {/* Main Center Area: Dual Column Instagram Layout */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl flex items-center justify-center gap-8 lg:gap-12">
          {/* ========================================================= */}
          {/* LEFT: Realistic Smartphone Mockup (Instagram style)       */}
          {/* ========================================================= */}
          <div className="hidden md:flex relative w-[340px] h-[610px] shrink-0 items-center justify-center select-none">
            {/* Phone Outer Chassis with Warm Luxury Bezel */}
            <div className="relative w-full h-full rounded-[48px] bg-gradient-to-b from-[#242735] via-[#151720] to-[#0f1017] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.9)] border border-white/20">
              {/* Gold rim accent lighting */}
              <div className="absolute inset-0 rounded-[48px] border border-[#E5B869]/30 pointer-events-none" />

              {/* Dynamic Island / Speaker notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2 border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1c1e28] border border-white/20" />
              </div>

              {/* Screen Area */}
              <div className="relative w-full h-full rounded-[38px] bg-[#0f1118] overflow-hidden flex flex-col justify-between border border-white/10">
                {/* Phone Top Header */}
                <div className="pt-8 px-4 pb-2.5 bg-[#141620] border-b border-white/10 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10">
                      <span className="text-[9px] font-black text-[#E5B869]">M</span>
                    </div>
                    <span className="text-xs font-black tracking-wider text-white">
                      HOW IT WORKS
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Step {activeStep.step}/3
                  </span>
                </div>

                {/* Tutorial Body Inside Screen */}
                <div className="flex-1 p-3.5 flex flex-col justify-between overflow-hidden">
                  {/* Tutorial Role Switcher (3 Tabs) */}
                  <div className="grid grid-cols-3 p-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-bold gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneTutorialRole("staff");
                        setPhoneTutorialStep(0);
                      }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                        phoneTutorialRole === "staff"
                          ? "bg-[#E5B869] text-black shadow font-black"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Staff Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneTutorialRole("recondition");
                        setPhoneTutorialStep(0);
                      }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                        phoneTutorialRole === "recondition"
                          ? "bg-[#E5B869] text-black shadow font-black"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Showroom
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneTutorialRole("seller");
                        setPhoneTutorialStep(0);
                      }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer truncate ${
                        phoneTutorialRole === "seller"
                          ? "bg-[#E5B869] text-black shadow font-black"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Seller
                    </button>
                  </div>

                  {/* Tutorial Card Content */}
                  <div className="space-y-2.5 py-1">
                    <span
                      className={`inline-block text-[9px] font-mono uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${activeStep.tagColor}`}
                    >
                      {activeStep.badge}
                    </span>

                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-tight">
                        {activeStep.title}
                      </h4>
                      <p className="text-[11px] text-[#E5B869] font-medium mt-0.5">
                        {activeStep.subtitle}
                      </p>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {activeStep.desc}
                    </p>

                    {/* Miniature UI Card Preview */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">
                          {activeStep.cardTitle}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 font-mono">
                          {activeStep.badgeText}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {activeStep.cardMeta}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Controls */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPhoneTutorialStep((prev) => (prev - 1 + 3) % 3)}
                        className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((idx) => (
                          <span
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === phoneTutorialStep ? "w-4 bg-[#E5B869]" : "w-1.5 bg-white/20"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPhoneTutorialStep((prev) => (prev + 1) % 3)}
                        className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>

                    <Link
                      href={`/signup?role=${phoneTutorialRole}`}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E5B869] to-[#d8ab5c] text-black font-black text-xs uppercase tracking-wider text-center block shadow hover:brightness-110 transition-all cursor-pointer"
                    >
                      <span>Create Account Now</span>
                    </Link>
                  </div>
                </div>

                {/* Minimalist Phone Bottom Bar */}
                <div className="p-2.5 bg-[#141620] border-t border-white/10 flex items-center justify-around text-neutral-400 text-xs z-20">
                  <span className="text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  <span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <span className="w-5 h-5 rounded-md border border-[#E5B869] text-[#E5B869] flex items-center justify-center text-[11px] font-black">
                    +
                  </span>
                  <span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </span>
                  <span className="w-4 h-4 rounded-full bg-white/20 border border-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: Classic Instagram Dual-Card Login Stack            */}
          {/* ========================================================= */}
          <div className="w-full max-w-[380px] space-y-3">
            {/* Top Primary Auth Box */}
            <div className="rounded-2xl bg-[#14161e] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-4 relative">
              {/* Back / Undo Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    window.history.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="absolute top-4 left-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Go back / Undo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              {/* Wordmark Logo */}
              <div className="text-center pt-1 pb-1">
                <Link href="/" className="inline-flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E5B869] flex items-center justify-center bg-[#E5B869]/10 shadow-[0_0_12px_rgba(229,184,105,0.4)]">
                    <svg className="w-5 h-5 text-[#E5B869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-2xl font-black tracking-widest text-white">
                    MULYANKAN
                  </span>
                </Link>
                <p className="text-[11px] text-neutral-400 mt-1 font-medium">
                  Showroom Hub &amp; Two-Wheeler Exchange
                </p>
              </div>

              {/* Role Toggle (3 Options) */}
              <div className="grid grid-cols-3 p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-bold gap-0.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("recondition")}
                  className={`py-2 rounded-lg transition-all cursor-pointer truncate ${
                    role === "recondition"
                      ? "bg-[#E5B869] text-black shadow font-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Showroom
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("staff")}
                  className={`py-2 rounded-lg transition-all cursor-pointer truncate ${
                    role === "staff"
                      ? "bg-[#E5B869] text-black shadow font-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("seller")}
                  className={`py-2 rounded-lg transition-all cursor-pointer truncate ${
                    role === "seller"
                      ? "bg-[#E5B869] text-black shadow font-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Seller
                </button>
              </div>

              {/* Notice for Pending Staff Approval */}
              {pendingNotice && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="leading-relaxed text-[11px]">{pendingNotice}</p>
                  </div>
                  <Link
                    href="/?tab=dealer&view=recruitment"
                    className="block text-center py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-[10px] transition-colors"
                  >
                    Go to Owner Console to Approve Application
                  </Link>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    {role === "staff" ? "Staff Email / Name" : "Email / Username"}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      role === "recondition"
                        ? "teku.workshop@mulyankan.np"
                        : role === "staff"
                        ? "bikash.tamang@gmail.com"
                        : "prashant.seller@gmail.com"
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-[#E5B869]"
                  />
                </div>

                {/* Company PAN for Staff login */}
                {role === "staff" && (
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Showroom Company PAN
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      value={companyPan}
                      onChange={(e) => setCompanyPan(e.target.value)}
                      placeholder="e.g. 601928471"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs placeholder:text-neutral-600 focus:outline-none focus:border-[#E5B869]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-[#E5B869]"
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

                {errorMessage && (
                  <p className="text-rose-400 text-xs text-center font-medium pt-1">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5B869] to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Log In to {role === "recondition" ? "Showroom" : role === "staff" ? "Staff Room" : "Dashboard"}</span>
                  )}
                </button>
              </form>

              {/* Quick Fill Shortcuts */}
              <div className="pt-2 border-t border-white/10 text-center space-y-1">
                <span className="text-[10px] text-neutral-500 block font-mono">Demo Accounts:</span>
                <div className="flex items-center justify-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("recondition")}
                    className="text-[#E5B869] hover:underline cursor-pointer"
                  >
                    Owner (Teku)
                  </button>
                  <span className="text-neutral-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("staff")}
                    className="text-cyan-400 hover:underline cursor-pointer"
                  >
                    Staff (Pending)
                  </button>
                  <span className="text-neutral-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("seller")}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Seller
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Card: Switch to Sign Up */}
            <div className="rounded-2xl bg-[#14161e] border border-white/10 p-4 text-center text-xs text-neutral-400">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?role=${role}`}
                className="font-bold text-[#E5B869] hover:underline cursor-pointer ml-1"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#121318] px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        Mulyankan Nepal • Authorized Recondition Houses &amp; Two-Wheeler Exchange Network
      </footer>
    </div>
  );
}
