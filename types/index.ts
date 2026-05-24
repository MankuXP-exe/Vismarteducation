export type UserRole = "student" | "teacher" | "admin";

export type DiscountCategory = "none" | "army" | "disabled" | "single_parent";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  current_class?: string;
  school_name?: string;
  avatar_url?: string;
  xp_points: number;
  streak_days: number;
  discount_category: DiscountCategory;
  discount_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type Batch = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  stream?: string;
  class_level?: string;
  price: number;
  original_price?: number;
  army_discount_percent: number;
  disabled_discount_percent: number;
  single_parent_flat_price: number;
  thumbnail_url?: string;
  banner_url?: string;
  subjects: string[];
  badge?: string;
  is_featured: boolean;
  is_active: boolean;
  total_students: number;
  rating: number;
  teacher_name?: string;
  language: string;
  has_live_classes: boolean;
  has_recorded_lectures: boolean;
  has_notes: boolean;
  duration_months: number;
  start_date?: string;
  end_date?: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  batch_id: string;
  amount_paid: number;
  discount_applied: string;
  status: "active" | "expired" | "cancelled" | "pending";
  access_start_date: string;
  access_end_date?: string;
  completion_percent: number;
  last_accessed_at?: string;
  enrolled_at: string;
  batch?: Batch;
};

export type Subject = {
  id: string;
  batch_id: string;
  name: string;
  abbreviation: string;
  color: string;
  sort_order: number;
};

export type Chapter = {
  id: string;
  subject_id: string;
  batch_id: string;
  chapter_number: string;
  title: string;
  sort_order: number;
  total_lectures: number;
  total_notes: number;
};

export type Lecture = {
  id: string;
  chapter_id: string;
  subject_id: string;
  batch_id: string;
  title: string;
  description?: string;
  cloudflare_video_id?: string;
  cloudflare_thumbnail_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds: number;
  duration_label: string;
  sort_order: number;
  is_free_preview: boolean;
  total_views: number;
  published_at?: string;
};

export type LiveClass = {
  id: string;
  batch_id: string;
  subject_id?: string;
  teacher_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  hms_room_id?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  recording_cloudflare_id?: string;
  recording_url?: string;
  recording_path?: string;
  is_recording_available: boolean;
  total_attendees: number;
};

export type StudyMaterial = {
  id: string;
  chapter_id: string;
  subject_id: string;
  batch_id: string;
  lecture_id?: string;
  title: string;
  file_url: string;
  file_name?: string;
  file_type: string;
  material_type: "notes" | "dpp" | "dpp_solutions" | "assignment";
  is_downloadable: boolean;
  total_downloads: number;
};

export type LectureProgress = {
  id: string;
  student_id: string;
  lecture_id: string;
  batch_id: string;
  watched_seconds: number;
  total_seconds: number;
  completion_percent: number;
  is_completed: boolean;
  last_position_seconds: number;
  last_watched_at: string;
};

export type Payment = {
  id: string;
  student_id: string;
  batch_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  original_amount?: number;
  discount_type: string;
  discount_amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  payment_method?: string;
  paid_at?: string;
  created_at: string;
};

export type Doubt = {
  id: string;
  student_id: string;
  lecture_id?: string;
  batch_id: string;
  question: string;
  answer?: string;
  status: "pending" | "answered" | "closed";
  asked_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
};
