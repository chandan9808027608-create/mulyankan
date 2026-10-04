"use client";

import React, { useState, useEffect } from "react";
import {
  StaffApplication,
  RegisteredCompany,
  getStaffApplications,
  updateStaffApplicationStatus,
  submitStaffApplication,
} from "./companyStaffData";

interface StaffRecruitmentConsoleProps {
  showroomName: string;
  panNumber: string;
  onStaffApproved?: (newStaff: StaffApplication) => void;
  onBackToAuctionFloor?: () => void;
}

export default function StaffRecruitmentConsole({
  showroomName,
  panNumber,
  onStaffApproved,
  onBackToAuctionFloor,
}: StaffRecruitmentConsoleProps) {
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "roster">("pending");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load applications on mount
  useEffect(() => {
    const all = getStaffApplications();
    // Filter for current showroom PAN
    setApplications(all.filter((a) => a.companyPan === panNumber));
  }, [panNumber]);

  const pendingApps = applications.filter((a) => a.status === "pending_owner_approval");
  const approvedApps = applications.filter((a) => a.status === "approved");

  // Handle Approve Action by Company Owner
  const handleApproveStaff = (app: StaffApplication) => {
    const updated = updateStaffApplicationStatus(app.id, "approved", showroomName);
    setApplications(updated.filter((a) => a.companyPan === panNumber));

    if (onStaffApproved) {
      onStaffApproved({ ...app, status: "approved" });
    }

    setActionNotice(`Authorized ${app.applicantName} (${app.role}) into ${showroomName} staff roster.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Reject Action
  const handleRejectStaff = (app: StaffApplication) => {
    const updated = updateStaffApplicationStatus(app.id, "rejected", showroomName);
    setApplications(updated.filter((a) => a.companyPan === panNumber));

    setActionNotice(`Declined recruitment request for ${app.applicantName}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Simulate new applicant applying with company PAN
  const handleSimulateNewApplicant = () => {
    const sampleCandidates = [
      {
        name: "Kiran Maharjan",
        role: "Senior Mechanic (Chassis & Transmission)",
        phone: "+977 9818-772910",
        email: "kiran.maharjan@gmail.com",
        citizenship: "27-01-75-08129",
      },
      {
        name: "Roshan Shrestha",
        role: "Valuation Appraiser & Test Rider",
        phone: "+977 9841-339281",
        email: "roshan.shrestha@hotmail.com",
        citizenship: "27-02-77-12903",
      },
      {
        name: "Aakash KC",
        role: "Procurement & Yatayat Liaison",
        phone: "+977 9860-221948",
        email: "aakash.kc@yahoo.com",
        citizenship: "27-03-76-99120",
      },
    ];

    const random = sampleCandidates[Math.floor(Math.random() * sampleCandidates.length)];

    const created = submitStaffApplication({
      companyPan: panNumber,
      companyName: showroomName,
      applicantName: random.name,
      role: random.role,
      phone: random.phone,
      email: random.email,
      citizenshipNumber: random.citizenship,
    });

    setApplications((prev) => [created, ...prev]);
    setActiveTab("pending");
    setActionNotice(`New recruitment application received from ${random.name}! Owner review required.`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 text-neutral-200 space-y-6">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#181a24] border border-[#E5B869] text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-top-4">
          <div className="w-7 h-7 rounded-full bg-[#E5B869]/20 text-[#E5B869] flex items-center justify-center font-bold text-xs shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold tracking-wide">{actionNotice}</p>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span>Showroom Administration</span>
            <span>/</span>
            <span className="text-[#E5B869]">Staff Recruitment & Approvals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>Staff Onboarding & Authorization</span>
            {pendingApps.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold animate-pulse">
                {pendingApps.length} ACTION REQUIRED
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Registered Company: <strong className="text-white">{showroomName}</strong> • Company PAN:{" "}
            <strong className="text-[#E5B869] font-mono">{panNumber}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateNewApplicant}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-[#E5B869]/20 border border-[#E5B869]/40 hover:border-[#E5B869] text-[#E5B869] hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Simulate a staff member submitting their account with this company's PAN"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Simulate Staff Signup</span>
          </button>

          {onBackToAuctionFloor && (
            <button
              type="button"
              onClick={onBackToAuctionFloor}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Floor</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Protocol Diagram Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#14161f] border border-[#E5B869]/20 relative overflow-hidden">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#E5B869] font-bold mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Staff Recruitment & Authorization Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <h4 className="font-bold text-white">Company Registered</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {showroomName} registered with Government PAN <span className="font-mono text-[#E5B869]">{panNumber}</span>.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <h4 className="font-bold text-white">Staff Signs Up with PAN</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Staff enters your company PAN during sign up. Verification alert routes here to owner console.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-[#E5B869]/40 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E5B869]/20 text-[#E5B869] font-mono font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <h4 className="font-bold text-white">Owner 1-Click Authorization</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Owner reviews credentials and approves. Staff gains access to War Room, Swipe Valuations, and Bidding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar: Pending Requests vs Approved Active Roster */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#E5B869] text-black shadow-lg"
                : "bg-white/5 text-neutral-300 hover:text-white"
            }`}
          >
            <span>Pending Approvals</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                activeTab === "pending" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {pendingApps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "roster"
                ? "bg-[#E5B869] text-black shadow-lg"
                : "bg-white/5 text-neutral-300 hover:text-white"
            }`}
          >
            <span>Active Showroom Roster</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                activeTab === "roster" ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {approvedApps.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
          Proprietor Authorization Level: Full Access
        </span>
      </div>

      {/* Main Content Area */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#14161f] border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">All Staff Applications Cleared</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                There are no pending staff applications for PAN {panNumber}. When a mechanic, appraiser, or sales staff
                signs up using your showroom PAN, their request will appear here for your review.
              </p>
              <button
                type="button"
                onClick={handleSimulateNewApplicant}
                className="mt-2 text-xs text-[#E5B869] hover:underline font-semibold cursor-pointer"
              >
                + Simulate a new staff application to test approval flow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-[#151722] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl ${app.avatarBg || "bg-amber-600 text-white"} flex items-center justify-center font-bold text-sm shadow`}
                      >
                        {app.initials || "ST"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{app.applicantName}</h3>
                        <p className="text-xs text-[#E5B869] font-medium">{app.role}</p>
                        <span className="text-[10px] text-neutral-400 font-mono">Applied: {app.appliedDate}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PENDING OWNER APPROVAL
                    </span>
                  </div>

                  {/* Candidate Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono uppercase block">Contact Phone</span>
                      <span className="font-semibold text-neutral-200 font-mono text-[11px]">{app.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono uppercase block">Email Address</span>
                      <span className="font-semibold text-neutral-200 truncate block text-[11px]">{app.email}</span>
                    </div>
                    {app.citizenshipNumber && (
                      <div className="col-span-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">
                          National ID / Citizenship
                        </span>
                        <span className="font-semibold text-neutral-300 font-mono text-[11px]">
                          {app.citizenshipNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Approval Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRejectStaff(app)}
                      className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Decline Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveStaff(app)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approve & Enlist</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Active Showroom Roster Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Showroom Proprietor (Root Admin) */}
            <div className="bg-[#151722] border border-[#E5B869]/40 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#E5B869] text-black font-black text-sm flex items-center justify-center shadow">
                    RS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ramesh Shrestha</h3>
                    <p className="text-xs text-[#E5B869]">Proprietor & Chief Appraiser</p>
                    <span className="text-[10px] text-neutral-400 font-mono">PAN Registered Owner</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold bg-[#E5B869]/20 text-[#E5B869] border border-[#E5B869]/30">
                  PROPRIETOR
                </span>
              </div>

              <div className="text-xs text-neutral-400 pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Permissions:</span>
                  <span className="text-white font-semibold">Full Live Bidding & Approval Authority</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Online
                  </span>
                </div>
              </div>
            </div>

            {/* Approved Staff Members */}
            {approvedApps.map((staff) => (
              <div
                key={staff.id}
                className="bg-[#151722] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${staff.avatarBg || "bg-cyan-600 text-white"} font-bold text-sm flex items-center justify-center shadow`}
                    >
                      {staff.initials || "ST"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{staff.applicantName}</h3>
                      <p className="text-xs text-cyan-400">{staff.role}</p>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Authorized: {staff.reviewedAt || "Active"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE STAFF
                  </span>
                </div>

                <div className="text-xs text-neutral-400 pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Contact:</span>
                    <span className="text-neutral-200 font-mono">{staff.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Permissions:</span>
                    <span className="text-white font-semibold">Staff Chat • Swipe Deck • Valuations</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
