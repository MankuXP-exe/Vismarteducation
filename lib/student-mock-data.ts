// ─── Student Mock Data ────────────────────────────────────────────────────────

export const studentData = {
  name: "Rahul Sharma",
  email: "rahul@example.com",
  phone: "9876543210",
  xp: 0,
  avatar: "RS",

  enrolledBatches: [
    {
      id: "class-12-science",
      title: "Class 12th Science Batch",
      subtitle: "CBSE Board · 2024-25",
      image: "/images/preview-class12th-batch.png",
      status: "active",
      subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
      enrolledOn: "2025-01-15",
      expiresOn: "2026-01-14",
      language: "Hindi + English",
    },
    {
      id: "class-12-accountancy",
      title: "Class 12th Commerce Batch",
      subtitle: "CBSE Board · 2024-25",
      image: "/images/preview-class12th-batch-Accountancy.png",
      status: "active",
      subjects: ["Accountancy", "Business Studies", "Economics", "Maths"],
      enrolledOn: "2025-02-01",
      expiresOn: "2026-01-31",
      language: "Hindi",
    },
  ] as BatchItem[],

  recentLectures: [
    {
      id: "lec-001",
      title: "Introduction to Accounting — Basics",
      subject: "Accountancy",
      chapter: "CH-01",
      batchId: "class-12-accountancy",
      batchTitle: "Class 12th Commerce Batch",
      lastWatched: "2025-05-23T14:30:00",
      progress: 60,
      cloudflareId: "demo-video-id",
      thumbnail: null,
    },
  ],

  bookmarks: [] as BookmarkItem[],
  doubts: [] as DoubtItem[],
};

export interface BatchItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  status: "active" | "expired";
  subjects: string[];
  enrolledOn: string;
  expiresOn: string;
  language: string;
}

export interface RecentLecture {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  batchId: string;
  batchTitle: string;
  lastWatched: string;
  progress: number;
  cloudflareId: string;
  thumbnail: string | null;
}

export interface BookmarkItem {
  id: string;
  type: "lecture" | "note";
  title: string;
  subject: string;
  chapter: string;
  bookmarkedOn: string;
  cloudflareId?: string;
  fileUrl?: string;
}

export interface DoubtItem {
  id: string;
  lectureTitle: string;
  subject: string;
  chapter: string;
  batchId: string;
  askedOn: string;
  question: string;
  status: "pending" | "resolved";
  answer?: string;
}

// ─── Subjects per Batch ───────────────────────────────────────────────────────

export const subjectsData: Record<
  string,
  { id: string; abbr: string; name: string; completion: number }[]
> = {
  "class-12-science": [
    { id: "physics",   abbr: "Ph", name: "Physics",     completion: 0 },
    { id: "chemistry", abbr: "Ch", name: "Chemistry",   completion: 0 },
    { id: "maths",     abbr: "Ma", name: "Mathematics", completion: 0 },
    { id: "biology",   abbr: "Bi", name: "Biology",     completion: 0 },
  ],
  "class-12-accountancy": [
    { id: "accountancy", abbr: "Ac", name: "Accountancy",      completion: 0 },
    { id: "bst",         abbr: "Bu", name: "Business Studies", completion: 0 },
    { id: "economics",   abbr: "Ec", name: "Economics",        completion: 0 },
    { id: "maths",       abbr: "Ma", name: "Mathematics",      completion: 0 },
    { id: "english",     abbr: "En", name: "English",          completion: 0 },
  ],
};

// ─── Chapters per Subject ─────────────────────────────────────────────────────

export const chaptersData: Record<
  string,
  { id: string; number: string; title: string }[]
> = {
  accountancy: [
    { id: "ch-01", number: "CH-01", title: "Introduction to Accounting" },
    { id: "ch-02", number: "CH-02", title: "Theory Base of Accounting" },
    { id: "ch-03", number: "CH-03", title: "Recording of Transactions" },
    { id: "ch-04", number: "CH-04", title: "Bank Reconciliation Statement" },
    { id: "ch-05", number: "CH-05", title: "Depreciation" },
  ],
  bst: [
    { id: "ch-01", number: "CH-01", title: "Nature & Purpose of Business" },
    { id: "ch-02", number: "CH-02", title: "Forms of Business Organisation" },
    { id: "ch-03", number: "CH-03", title: "Private, Public & Global Enterprises" },
    { id: "ch-04", number: "CH-04", title: "Business Services" },
    { id: "ch-05", number: "CH-05", title: "Emerging Modes of Business" },
  ],
  economics: [
    { id: "ch-01", number: "CH-01", title: "Introduction to Economics" },
    { id: "ch-02", number: "CH-02", title: "Theory of Consumer Behaviour" },
    { id: "ch-03", number: "CH-03", title: "Production & Costs" },
    { id: "ch-04", number: "CH-04", title: "Theory of Firm Under Perfect Competition" },
    { id: "ch-05", number: "CH-05", title: "Market Equilibrium" },
  ],
  physics: [
    { id: "ch-01", number: "CH-01", title: "Physical World & Measurement" },
    { id: "ch-02", number: "CH-02", title: "Kinematics" },
    { id: "ch-03", number: "CH-03", title: "Laws of Motion" },
    { id: "ch-04", number: "CH-04", title: "Work, Energy & Power" },
    { id: "ch-05", number: "CH-05", title: "Motion of System of Particles" },
  ],
  chemistry: [
    { id: "ch-01", number: "CH-01", title: "Some Basic Concepts of Chemistry" },
    { id: "ch-02", number: "CH-02", title: "Structure of Atom" },
    { id: "ch-03", number: "CH-03", title: "Classification of Elements" },
    { id: "ch-04", number: "CH-04", title: "Chemical Bonding" },
    { id: "ch-05", number: "CH-05", title: "States of Matter" },
  ],
  maths: [
    { id: "ch-01", number: "CH-01", title: "Sets" },
    { id: "ch-02", number: "CH-02", title: "Relations & Functions" },
    { id: "ch-03", number: "CH-03", title: "Trigonometric Functions" },
    { id: "ch-04", number: "CH-04", title: "Principle of Mathematical Induction" },
    { id: "ch-05", number: "CH-05", title: "Complex Numbers" },
  ],
  biology: [
    { id: "ch-01", number: "CH-01", title: "The Living World" },
    { id: "ch-02", number: "CH-02", title: "Biological Classification" },
    { id: "ch-03", number: "CH-03", title: "Plant Kingdom" },
    { id: "ch-04", number: "CH-04", title: "Animal Kingdom" },
    { id: "ch-05", number: "CH-05", title: "Morphology of Flowering Plants" },
  ],
  english: [
    { id: "ch-01", number: "CH-01", title: "The Portrait of a Lady" },
    { id: "ch-02", number: "CH-02", title: "A Photograph" },
    { id: "ch-03", number: "CH-03", title: "We're Not Afraid to Die" },
    { id: "ch-04", number: "CH-04", title: "Discovering Tut" },
    { id: "ch-05", number: "CH-05", title: "The Ailing Planet" },
  ],
};

// ─── Lectures per Chapter ─────────────────────────────────────────────────────

export const lecturesData: Record<
  string,
  {
    id: string;
    title: string;
    duration: string;
    uploadedOn: string;
    cloudflareId: string;
    watched: boolean;
  }[]
> = {
  "ch-01-accountancy": [
    {
      id: "lec-001",
      title: "Basic Accounting Terms — Part 1",
      duration: "45 min",
      uploadedOn: "5 May 2025",
      cloudflareId: "demo-video-id-1",
      watched: false,
    },
    {
      id: "lec-002",
      title: "Basic Accounting Terms — Part 2",
      duration: "38 min",
      uploadedOn: "6 May 2025",
      cloudflareId: "demo-video-id-2",
      watched: false,
    },
    {
      id: "lec-003",
      title: "Assets, Liabilities & Capital",
      duration: "52 min",
      uploadedOn: "8 May 2025",
      cloudflareId: "demo-video-id-3",
      watched: false,
    },
  ],
  "ch-02-accountancy": [
    {
      id: "lec-004",
      title: "GAAP — Generally Accepted Accounting Principles",
      duration: "41 min",
      uploadedOn: "10 May 2025",
      cloudflareId: "demo-video-id-4",
      watched: false,
    },
    {
      id: "lec-005",
      title: "Accounting Concepts & Conventions",
      duration: "37 min",
      uploadedOn: "12 May 2025",
      cloudflareId: "demo-video-id-5",
      watched: false,
    },
  ],
  "ch-01-physics": [
    {
      id: "lec-p01",
      title: "Introduction to Physics & Measurement",
      duration: "48 min",
      uploadedOn: "2 May 2025",
      cloudflareId: "demo-video-id-p1",
      watched: false,
    },
    {
      id: "lec-p02",
      title: "Units & Dimensions",
      duration: "55 min",
      uploadedOn: "4 May 2025",
      cloudflareId: "demo-video-id-p2",
      watched: false,
    },
  ],
};

// ─── Notes per Chapter ────────────────────────────────────────────────────────

export const notesData: Record<
  string,
  { id: string; title: string; uploadedOn: string; fileUrl: string; type: string }[]
> = {
  "ch-01-accountancy": [
    {
      id: "note-001",
      title: "Basic Accounting Terms: Class Notes",
      uploadedOn: "5 May 2025",
      fileUrl: "/notes/basic-accounting-terms.pdf",
      type: "Notes",
    },
    {
      id: "note-002",
      title: "Short Notes — Important Definitions",
      uploadedOn: "7 May 2025",
      fileUrl: "/notes/definitions.pdf",
      type: "Notes",
    },
  ],
  "ch-01-physics": [
    {
      id: "note-p01",
      title: "Physical World — Complete Notes",
      uploadedOn: "3 May 2025",
      fileUrl: "/notes/physical-world.pdf",
      type: "Notes",
    },
  ],
};

// ─── DPPs per Chapter ─────────────────────────────────────────────────────────

export const dppsData: Record<
  string,
  { id: string; title: string; questions: number; duration: string }[]
> = {
  "ch-01-accountancy": [
    {
      id: "dpp-001",
      title: "DPP - 01: Introduction to Accounting",
      questions: 20,
      duration: "30 min",
    },
    {
      id: "dpp-002",
      title: "DPP - 02: Basic Terms Practice",
      questions: 15,
      duration: "20 min",
    },
  ],
  "ch-01-physics": [
    {
      id: "dpp-p01",
      title: "DPP - 01: Physical World",
      questions: 25,
      duration: "35 min",
    },
  ],
};

// ─── Batch Resources ──────────────────────────────────────────────────────────

export const batchResources = [
  { id: "res-01", name: "Batch Schedule & Timetable", fileUrl: "#" },
  { id: "res-02", name: "Important Dates & Exam Calendar", fileUrl: "#" },
  { id: "res-03", name: "Reference Book List", fileUrl: "#" },
  { id: "res-04", name: "Syllabus Overview PDF", fileUrl: "#" },
];
