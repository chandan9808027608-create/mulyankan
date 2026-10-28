"use client";

import React, { useState, useEffect } from "react";
import {
  StaffApplication,
  getStaffApplications,
  updateStaffApplicationStatus,
  getRegisteredCompanies,
} from "./companyStaffData";
import { ScreenHeader, SegmentedTabs, Toast } from "./ScreenHeader";

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
    setApplications(all.filter((a) => a.companyPan === panNumber));
  }, [panNumber]);

  const pendingApps = applications.filter((a) => a.status === "pending_owner_approval");
  const approvedApps = applications.filter((a) => a.status === "approved");

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleApproveStaff = (app: StaffApplication) => {
    const updated = updateStaffApplicationStatus(app.id, "approved", showroomName);
    setApplications(updated.filter((a) => a.companyPan === panNumber));
    onStaffApproved?.({ ...app, status: "approved" });
    notify(`${app.applicantName} is now on your team!`);
  };

  const handleRejectStaff = (app: StaffApplication) => {
    const updated = updateStaffApplicationStatus(app.id, "rejected", showroomName);
    setApplications(updated.filter((a) => a.companyPan === panNumber));
    notify(`You said no to ${app.applicantName}.`);
  };

  // Real owner name from the registered company record
  const ownerName =
    (typeof window !== "undefined" && getRegisteredCompanies().find((c) => c.panNumber === panNumber)?.ownerName) ||
    "Shop Owner";
  const ownerInitials = ownerName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="min-h-full bg-[#0d0e12]">
      <Toast message={actionNotice} />
      <ScreenHeader title="Hire people" subtitle={`${showroomName} • PAN ${panNumber}`} onBack={onBackToAuctionFloor} />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* How it works */}
        <div className="rounded-2xl bg-[#16171d] border border-white/10 p-4 space-y-3">
          <p className="text-xs font-bold text-[#E5B869]">How hiring works</p>
          {[
            ["1", "Worker signs up", `They type your shop's PAN number (${panNumber}).`],
            ["2", "They show up here", "You see their name, phone and email."],
            ["3", "You say yes or no", "Say yes and they can chat, swipe and make offers for your shop."],
          ].map(([n, title, desc]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-lg bg-[#E5B869]/15 text-[#E5B869] text-xs font-black flex items-center justify-center">{n}</span>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                <p className="text-[11px] text-neutral-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <SegmentedTabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { key: "pending", label: `Waiting (${pendingApps.length})` },
            { key: "roster", label: `My team (${approvedApps.length + 1})` },
          ]}
        />

        {activeTab === "pending" ? (
          pendingApps.length === 0 ? (
            <div className="py-14 text-center rounded-2xl border border-dashed border-white/10 space-y-1 px-6">
              <p className="text-sm font-bold text-white">No one is waiting</p>
              <p className="text-xs text-neutral-500">When someone signs up with your PAN number, they show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="rounded-2xl bg-[#16171d] border border-white/10 p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={app.initials || "ST"} className={app.avatarBg || "bg-amber-600 text-white"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{app.applicantName}</p>
                      <p className="text-xs text-[#E5B869] truncate">{app.role}</p>
                      <p className="text-[10px] text-neutral-500">Applied {app.appliedDate}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase">Waiting</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] space-y-1">
                    <Row label="Phone" value={app.phone} />
                    <Row label="Email" value={app.email} />
                    {app.citizenshipNumber && <Row label="Citizenship" value={app.citizenshipNumber} />}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRejectStaff(app)}
                      className="flex-1 h-11 rounded-xl bg-white/5 border border-white/15 text-white text-sm font-bold cursor-pointer"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveStaff(app)}
                      className="flex-[2] h-11 rounded-xl bg-[#E5B869] text-black text-sm font-black cursor-pointer"
                    >
                      ✓ Yes, add to team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl bg-[#16171d] border border-white/10 divide-y divide-white/10 overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <Avatar initials={ownerInitials} className="bg-[#E5B869] text-black" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{ownerName}</p>
                <p className="text-xs text-neutral-400">Owner • can do everything</p>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-[#E5B869]/15 text-[#E5B869] text-[9px] font-black uppercase">Owner</span>
            </div>
            {approvedApps.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 p-3">
                <Avatar initials={staff.initials || "ST"} className={staff.avatarBg || "bg-cyan-600 text-white"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{staff.applicantName}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {staff.role} •{" "}
                    <a href={`tel:${staff.phone}`} className="text-emerald-400">
                      {staff.phone}
                    </a>
                  </p>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase">Team</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ initials, className }: { initials: string; className: string }) {
  return <div className={`w-11 h-11 shrink-0 rounded-xl ${className} flex items-center justify-center font-black text-sm`}>{initials}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-200 font-mono truncate">{value}</span>
    </div>
  );
}
