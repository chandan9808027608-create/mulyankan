// Showroom Companies & Staff Recruitment Governance Data Store

export interface RegisteredCompany {
  panNumber: string;
  businessName: string;
  ownerName: string;
  location: string;
  phone: string;
  email: string;
  registrationNumber: string;
  registeredAt: string;
  isVerified: boolean;
}

export interface StaffApplication {
  id: string;
  companyPan: string;
  companyName: string;
  applicantName: string;
  role: string;
  phone: string;
  email: string;
  password?: string;
  citizenshipNumber?: string;
  appliedDate: string;
  status: "pending_owner_approval" | "approved" | "rejected";
  reviewedAt?: string;
  reviewedBy?: string;
  avatarBg?: string;
  initials?: string;
}

export const INITIAL_REGISTERED_COMPANIES: RegisteredCompany[] = [
  {
    panNumber: "601928471",
    businessName: "Teku Moto Recondition Hub Pvt. Ltd.",
    ownerName: "Ramesh Shrestha",
    location: "Teku (Near Yatayat Office), Kathmandu",
    phone: "+977 9851-092834",
    email: "teku.hub@mulyankan.np",
    registrationNumber: "248190/079/080",
    registeredAt: "2080-04-12",
    isVerified: true,
  },
  {
    panNumber: "602849182",
    businessName: "Lalitpur Wheels & Exchange Center",
    ownerName: "Bijay Shakya",
    location: "Lagankhel, Lalitpur",
    phone: "+977 9841-882910",
    email: "lalitpur.wheels@mulyankan.np",
    registrationNumber: "192840/078/079",
    registeredAt: "2079-08-15",
    isVerified: true,
  },
  {
    panNumber: "604128945",
    businessName: "Kupandole Superbikes Workshop",
    ownerName: "Anand Bajracharya",
    location: "Kupandole Heights, Lalitpur",
    phone: "+977 9801-239481",
    email: "kupandole.superbikes@mulyankan.np",
    registrationNumber: "261940/080/081",
    registeredAt: "2080-11-20",
    isVerified: true,
  },
  {
    panNumber: "603518290",
    businessName: "Balaju Riders Recondition Point",
    ownerName: "Nabin Khadka",
    location: "Balaju Ring Road, Kathmandu",
    phone: "+977 9860-192847",
    email: "balaju.riders@mulyankan.np",
    registrationNumber: "210482/079/080",
    registeredAt: "2080-01-10",
    isVerified: true,
  },
  {
    panNumber: "605912431",
    businessName: "Bhaktapur Two-Wheeler Exchange Hub",
    ownerName: "Gopal Prajapati",
    location: "Suryabinayak, Bhaktapur",
    phone: "+977 9818-492019",
    email: "bhaktapur.exchange@mulyankan.np",
    registrationNumber: "284019/081/082",
    registeredAt: "2081-02-05",
    isVerified: true,
  },
];

export const INITIAL_STAFF_APPLICATIONS: StaffApplication[] = [
  {
    id: "app-101",
    companyPan: "601928471",
    companyName: "Teku Moto Recondition Hub Pvt. Ltd.",
    applicantName: "Bikash Tamang",
    role: "Senior Mechanic (Chassis & Engine)",
    phone: "+977 9813-449102",
    email: "bikash.tamang@gmail.com",
    citizenshipNumber: "27-01-76-04921",
    appliedDate: "Today at 10:45 AM",
    status: "pending_owner_approval",
    avatarBg: "bg-blue-600 text-white",
    initials: "BT",
  },
  {
    id: "app-102",
    companyPan: "601928471",
    companyName: "Teku Moto Recondition Hub Pvt. Ltd.",
    applicantName: "Dipendra Shrestha",
    role: "Valuation Appraiser & Test Rider",
    phone: "+977 9841-992013",
    email: "dipendra.shrestha@outlook.com",
    citizenshipNumber: "27-02-74-11029",
    appliedDate: "Yesterday at 04:15 PM",
    status: "pending_owner_approval",
    avatarBg: "bg-purple-600 text-white",
    initials: "DS",
  },
  {
    id: "app-103",
    companyPan: "601928471",
    companyName: "Teku Moto Recondition Hub Pvt. Ltd.",
    applicantName: "Santosh Maharjan",
    role: "Senior Mechanic (Chassis/Engine)",
    phone: "+977 9851-229401",
    email: "santosh.mechanic@mulyankan.np",
    citizenshipNumber: "27-01-70-19284",
    appliedDate: "3 days ago",
    status: "approved",
    reviewedAt: "2081-05-12",
    reviewedBy: "Ramesh Shrestha (Proprietor)",
    avatarBg: "bg-blue-600 text-white",
    initials: "SM",
  },
  {
    id: "app-104",
    companyPan: "601928471",
    companyName: "Teku Moto Recondition Hub Pvt. Ltd.",
    applicantName: "Sunil Thapa",
    role: "Procurement & Yatayat Liaison",
    phone: "+977 9849-019283",
    email: "sunil.procurement@mulyankan.np",
    citizenshipNumber: "27-03-72-88402",
    appliedDate: "1 week ago",
    status: "approved",
    reviewedAt: "2081-05-08",
    reviewedBy: "Ramesh Shrestha (Proprietor)",
    avatarBg: "bg-emerald-600 text-white",
    initials: "ST",
  },
];

// Helper to retrieve registered companies (merging defaults with localStorage)
export function getRegisteredCompanies(): RegisteredCompany[] {
  if (typeof window === "undefined") return INITIAL_REGISTERED_COMPANIES;
  try {
    const raw = localStorage.getItem("mulyankan_registered_companies");
    if (!raw) {
      localStorage.setItem("mulyankan_registered_companies", JSON.stringify(INITIAL_REGISTERED_COMPANIES));
      return INITIAL_REGISTERED_COMPANIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REGISTERED_COMPANIES;
  }
}

// Helper to register a new company
export function saveRegisteredCompany(company: RegisteredCompany): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRegisteredCompanies();
    const exists = current.some((c) => c.panNumber === company.panNumber);
    const updated = exists
      ? current.map((c) => (c.panNumber === company.panNumber ? company : c))
      : [company, ...current];
    localStorage.setItem("mulyankan_registered_companies", JSON.stringify(updated));
  } catch {}
}

// Helper to retrieve staff applications (merging defaults with localStorage)
export function getStaffApplications(): StaffApplication[] {
  if (typeof window === "undefined") return INITIAL_STAFF_APPLICATIONS;
  try {
    const raw = localStorage.getItem("mulyankan_staff_applications");
    if (!raw) {
      localStorage.setItem("mulyankan_staff_applications", JSON.stringify(INITIAL_STAFF_APPLICATIONS));
      return INITIAL_STAFF_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STAFF_APPLICATIONS;
  }
}

// Helper to save a new staff recruitment request
export function submitStaffApplication(app: Omit<StaffApplication, "id" | "appliedDate" | "status">): StaffApplication {
  const newApp: StaffApplication = {
    ...app,
    id: `staff-app-${Date.now()}`,
    appliedDate: "Just now",
    status: "pending_owner_approval",
    avatarBg: app.avatarBg || "bg-cyan-600 text-white",
    initials: app.applicantName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getStaffApplications();
      const updated = [newApp, ...current];
      localStorage.setItem("mulyankan_staff_applications", JSON.stringify(updated));
    } catch {}
  }

  return newApp;
}

// Helper for showroom proprietor to approve or reject a staff member
export function updateStaffApplicationStatus(
  appId: string,
  newStatus: "approved" | "rejected",
  reviewedByName: string
): StaffApplication[] {
  if (typeof window === "undefined") return INITIAL_STAFF_APPLICATIONS;
  try {
    const current = getStaffApplications();
    const updated = current.map((app) =>
      app.id === appId
        ? {
            ...app,
            status: newStatus,
            reviewedAt: new Date().toLocaleDateString(),
            reviewedBy: `${reviewedByName} (Owner)`,
          }
        : app
    );
    localStorage.setItem("mulyankan_staff_applications", JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_STAFF_APPLICATIONS;
  }
}
