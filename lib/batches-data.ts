export type Batch = {
  id: string;
  title: string;
  category: string;
  stream: string;
  subjects: string[];
  duration: string;
  price: number;
  originalPrice: number;
  image: string;
  banner?: string;
  teacher: string;
  students: number;
  rating: number;
  badge: "POPULAR" | "NEW" | "HOT" | "LIVE";
  type: string[];
  includes: string[];
  discount: {
    army?: number;
    disabled?: number;
    singleParent?: string;
  };
};

export const batches: Batch[] = [
  {
    id: "class-11-science",
    title: "Class 11th Science Batch",
    category: "class-11",
    stream: "Science",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    duration: "1 Year",
    price: 5000,
    originalPrice: 8000,
    image: "/images/preview-class11th-batch.png",
    banner: "/images/banner-class12th-batch.png",
    teacher: "Vi Smart Faculty",
    students: 85,
    rating: 4.8,
    badge: "POPULAR",
    type: ["Live", "Recorded"],
    includes: ["Notes", "PDFs", "Doubt Sessions"],
    discount: { army: 50, disabled: 50, singleParent: "₹5000 flat" },
  },
  {
    id: "class-12-science",
    title: "Class 12th Science Batch",
    category: "class-12",
    stream: "Science",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    duration: "1 Year",
    price: 5000,
    originalPrice: 8000,
    image: "/images/preview-class12th-batch.png",
    banner: "/images/banner-class12th-batch.png",
    teacher: "Vi Smart Faculty",
    students: 120,
    rating: 4.9,
    badge: "POPULAR",
    type: ["Live", "Recorded"],
    includes: ["Notes", "PDFs", "Doubt Sessions"],
    discount: { army: 50, disabled: 50, singleParent: "₹5000 flat" },
  },
  {
    id: "class-12-accountancy",
    title: "Class 12th Commerce Batch",
    category: "class-12",
    stream: "Commerce",
    subjects: ["Accountancy", "Business Studies", "Economics"],
    duration: "1 Year",
    price: 5000,
    originalPrice: 8000,
    image: "/images/preview-class12th-batch-Accountancy.png",
    banner: "/images/banner-class12th-batch-Accountancy.png",
    teacher: "Vi Smart Faculty",
    students: 95,
    rating: 4.7,
    badge: "NEW",
    type: ["Live", "Recorded"],
    includes: ["Notes", "PDFs", "Doubt Sessions"],
    discount: { army: 50, disabled: 50, singleParent: "₹5000 flat" },
  },
  {
    id: "class-11-commerce",
    title: "Class 11th Commerce Batch",
    category: "class-11",
    stream: "Commerce",
    subjects: ["Accountancy", "Business Studies", "Economics"],
    duration: "1 Year",
    price: 5000,
    originalPrice: 8000,
    image: "/images/preview-class12th-batch-Accountancy.png",
    teacher: "Vi Smart Faculty",
    students: 60,
    rating: 4.6,
    badge: "NEW",
    type: ["Live", "Recorded"],
    includes: ["Notes", "PDFs", "Doubt Sessions"],
    discount: { army: 50, disabled: 50, singleParent: "₹5000 flat" },
  },
  {
    id: "class-9-10",
    title: "Class 9th & 10th Batch",
    category: "class-9-10",
    stream: "Science + Math",
    subjects: ["Mathematics", "Science", "English", "Social Science"],
    duration: "1 Year",
    price: 4000,
    originalPrice: 6000,
    image: "/images/preview-class11th-batch.png",
    teacher: "Vi Smart Faculty",
    students: 75,
    rating: 4.7,
    badge: "POPULAR",
    type: ["Live", "Recorded"],
    includes: ["Notes", "PDFs"],
    discount: { army: 50, disabled: 50, singleParent: "₹5000 flat" },
  },
  {
    id: "tally-gst",
    title: "Tally Prime ERP9 + GST",
    category: "accounting",
    stream: "Accounting",
    subjects: ["Tally Prime ERP9", "GST Filing", "Registration"],
    duration: "3 Months",
    price: 3000,
    originalPrice: 5000,
    image: "/images/preview-class12th-batch-Accountancy.png",
    teacher: "Vi Smart Faculty",
    students: 45,
    rating: 4.8,
    badge: "HOT",
    type: ["Recorded"],
    includes: ["Practice Files", "Certificate"],
    discount: {},
  },
  {
    id: "income-tax",
    title: "Income Tax Return + TDS/TCS",
    category: "accounting",
    stream: "Accounting",
    subjects: ["Income Tax Return", "TDS", "TCS", "Balance Sheet"],
    duration: "2 Months",
    price: 2500,
    originalPrice: 4000,
    image: "/images/preview-class12th-batch-Accountancy.png",
    teacher: "Vi Smart Faculty",
    students: 38,
    rating: 4.9,
    badge: "HOT",
    type: ["Recorded"],
    includes: ["Practice Files", "Certificate"],
    discount: {},
  },
  {
    id: "dca-adca",
    title: "DCA / ADCA Computer Course",
    category: "accounting",
    stream: "Computer",
    subjects: ["Basic Computer", "MS Office", "Internet", "DCA", "ADCA"],
    duration: "6 Months",
    price: 3500,
    originalPrice: 6000,
    image: "/images/preview-class11th-batch.png",
    teacher: "Vi Smart Faculty",
    students: 52,
    rating: 4.6,
    badge: "NEW",
    type: ["Live", "Recorded"],
    includes: ["Practice Lab", "Certificate"],
    discount: {},
  },
];

export function getBatchById(id: string): Batch | undefined {
  return batches.find((b) => b.id === id);
}

export const categories = [
  { label: "All", value: "all" },
  { label: "Class 9-10", value: "class-9-10" },
  { label: "Class 11", value: "class-11" },
  { label: "Class 12", value: "class-12" },
  { label: "B.COM/BBA", value: "bcom-bba" },
  { label: "Accounting", value: "accounting" },
];
