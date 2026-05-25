export type Batch = {
  id: string;
  uuid: string;
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

export function toBatchDisplay(row: any): Batch {
  const months = row.duration_months || 12;
  const p = Number(row.price) || 0;
  const op = row.original_price ? Number(row.original_price) : Math.round(p * 1.5);

  const typeArr: string[] = [];
  if (row.has_live_classes !== false) typeArr.push("Live");
  if (row.has_recorded_lectures !== false) typeArr.push("Recorded");
  if (typeArr.length === 0) typeArr.push("Recorded");

  const includesArr: string[] = [];
  if (row.has_notes !== false) includesArr.push("Notes");
  if (row.has_doubt_support !== false) includesArr.push("Doubt Sessions");
  if (row.has_tests) includesArr.push("Tests");

  const discount: Batch["discount"] = {};
  if (row.army_discount_percent) discount.army = row.army_discount_percent;
  if (row.disabled_discount_percent) discount.disabled = row.disabled_discount_percent;
  if (row.single_parent_flat_price) discount.singleParent = `₹${Number(row.single_parent_flat_price).toLocaleString("en-IN")} flat`;

  return {
    id: row.slug || row.id,
    uuid: row.id,
    title: row.title,
    category: row.category,
    stream: row.stream || "All Subjects",
    subjects: row.subjects || [],
    duration: months >= 12
      ? `${months / 12} Year${months > 12 ? "s" : ""}`
      : `${months} Month${months > 1 ? "s" : ""}`,
    price: p,
    originalPrice: op,
    image: row.thumbnail_url || "/images/preview-class11th-batch.png",
    banner: row.banner_url || row.thumbnail_url,
    teacher: row.teacher_name || "Vi Smart Faculty",
    students: row.total_students || 0,
    rating: Number(row.rating) || 4.5,
    badge: (row.badge as Batch["badge"]) || (row.is_featured ? "POPULAR" : "NEW"),
    type: typeArr,
    includes: includesArr.length > 0 ? includesArr : ["Notes", "PDFs"],
    discount,
  };
}

export async function fetchActiveBatches(): Promise<Batch[]> {
  try {
    const res = await fetch("/api/batches");
    if (!res.ok) return [];
    const json = await res.json();
    return (json.batches || []).map(toBatchDisplay);
  } catch {
    return [];
  }
}

export async function fetchBatchBySlug(slug: string): Promise<Batch | null> {
  try {
    const res = await fetch(`/api/batches/slug/${slug}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.batch ? toBatchDisplay(json.batch) : null;
  } catch {
    return null;
  }
}

export async function fetchBatchById(supabase: any, id: string): Promise<Batch | null> {
  const { data, error } = await supabase
    .from("batches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return toBatchDisplay(data);
}

export const categories = [
  { label: "All", value: "all" },
  { label: "Class 9", value: "class-9" },
  { label: "Class 10", value: "class-10" },
  { label: "Class 11", value: "class-11" },
  { label: "Class 12", value: "class-12" },
  { label: "B.COM/BBA", value: "bcom-bba" },
  { label: "Accounting", value: "accounting" },
];
