import { API_BASE_URL } from "./config";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // send and receive HTTP-only session cookies
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        data: null,
        error: json.error || `Request failed with status ${res.status}`,
      };
    }

    return { data: json as T, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || "Network request to VPS API failed",
    };
  }
}

// ─── TYPED CLIENT MODULES ──────────────────────────────────────────

export const api = {
  // ── Auth
  auth: {
    async register(data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      currentClass?: string;
      role?: "student" | "teacher";
    }) {
      return apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
    },
    async login(data: { email: string; password: string }) {
      return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
    },
    async logout(token?: string) {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Cookie"] = `vi_session=${token}`;
        headers["Authorization"] = `Bearer ${token}`;
      }
      return apiFetch("/auth/logout", { method: "POST", headers });
    },
    async getMe() {
      return apiFetch("/auth/me");
    },
  },

  // ── Batches
  batches: {
    async list(category?: string) {
      const q = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
      return apiFetch<{ batches: any[] }>(`/batches${q}`);
    },
    async getBySlug(idOrSlug: string) {
      return apiFetch<{ batch: any }>(`/batches/${encodeURIComponent(idOrSlug)}`);
    },
    async getSubjects(batchId: string) {
      return apiFetch<{ subjects: any[] }>(`/batches/${batchId}/subjects`);
    },
    async getChapters(subjectId: string) {
      return apiFetch<{ chapters: any[] }>(`/batches/subjects/${subjectId}/chapters`);
    },
    async getLectures(chapterId: string) {
      return apiFetch<{ lectures: any[] }>(`/batches/chapters/${chapterId}/lectures`);
    },
    async getMaterials(chapterId: string) {
      return apiFetch<{ materials: any[] }>(`/batches/chapters/${chapterId}/materials`);
    },
  },

  // ── Lectures & Streaming
  lectures: {
    async list(params?: { batchId?: string; subjectId?: string; chapterId?: string }) {
      const sp = new URLSearchParams();
      if (params?.batchId) sp.set("batchId", params.batchId);
      if (params?.subjectId) sp.set("subjectId", params.subjectId);
      if (params?.chapterId) sp.set("chapterId", params.chapterId);
      const query = sp.toString() ? `?${sp.toString()}` : "";
      return apiFetch<{ lectures: any[] }>(`/lectures${query}`);
    },
    async getById(id: string) {
      return apiFetch<{ lecture: any; streamUrl?: string; playbackToken?: string }>(`/lectures/${id}`);
    },
    async updateProgress(
      id: string,
      progress: { watchedSeconds: number; totalSeconds: number; lastPosition?: number },
      options: RequestInit = {}
    ) {
      return apiFetch(`/lectures/${id}/progress`, {
        ...options,
        method: "POST",
        body: JSON.stringify(progress),
      });
    },
    async getProgress(batchId?: string, options: RequestInit = {}) {
      const q = batchId ? `?batchId=${encodeURIComponent(batchId)}` : "";
      return apiFetch<{ progress: any[] }>(`/lectures/progress${q}`, options);
    },
    async getPlaybackToken(id: string) {
      return apiFetch<{ playbackToken: string; streamUrl: string }>(`/lectures/${id}/playback-token`);
    },
    getStreamUrl(token: string) {
      return `${API_BASE_URL}/recordings/stream/${encodeURIComponent(token)}`;
    },
  },

  // ── Study Materials & Notes
  notes: {
    async list(params?: { batchId?: string; subjectId?: string; chapterId?: string; type?: string }) {
      const sp = new URLSearchParams();
      if (params?.batchId) sp.set("batchId", params.batchId);
      if (params?.subjectId) sp.set("subjectId", params.subjectId);
      if (params?.chapterId) sp.set("chapterId", params.chapterId);
      if (params?.type && params.type !== "all") sp.set("type", params.type);
      const query = sp.toString() ? `?${sp.toString()}` : "";
      return apiFetch<{ materials: any[] }>(`/notes${query}`);
    },
    getDownloadUrl(id: string) {
      return `${API_BASE_URL}/notes/${id}/download`;
    },
  },

  // ── Live Streaming
  live: {
    async list(params?: { batchId?: string; status?: string }, options: RequestInit = {}) {
      const sp = new URLSearchParams();
      if (params?.batchId) sp.set("batchId", params.batchId);
      if (params?.status) sp.set("status", params.status);
      const query = sp.toString() ? `?${sp.toString()}` : "";
      return apiFetch<{ classes: any[]; liveClasses?: any[] }>(`/live${query}`, options);
    },
    async getById(id: string, options: RequestInit = {}) {
      return apiFetch<{ liveClass: any; data?: any }>(`/live/${id}`, options);
    },
    async getPlaybackToken(id: string, options: RequestInit = {}) {
      return apiFetch<{ token: string; status: string; whepUrl: string; hlsUrl: string; roomName?: string }>(
        `/live/${id}/playback-token`,
        options
      );
    },
    async start(id: string, options: RequestInit = {}) {
      return apiFetch<{ success: boolean; liveClass: any; hlsUrl?: string; publishing?: any }>(
        `/live/${id}/start`,
        { ...options, method: "POST" }
      );
    },
    async end(id: string, options: RequestInit = {}) {
      return apiFetch<{ success: boolean; liveClass: any; status: string }>(
        `/live/${id}/end`,
        { ...options, method: "POST" }
      );
    },
    async heartbeat(id: string, options: RequestInit = {}) {
      return apiFetch<{ ok: boolean; status: string }>(
        `/live/${id}/heartbeat`,
        { ...options, method: "POST" }
      );
    },
    async create(body: any, options: RequestInit = {}) {
      return apiFetch<{ liveClass: any }>(`/live`, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    async instant(body: any, options: RequestInit = {}) {
      return apiFetch<{ liveClass: any }>(`/live/instant`, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    async getRecording(id: string, options: RequestInit = {}) {
      return apiFetch<{ available: boolean; recordingUrl: string | null; fileSizeMb: number | null; title: string }>(
        `/live/${id}/recording`,
        options
      );
    },
  },

  // ── Tests & Assessments
  tests: {
    async list(batchId?: string, options: RequestInit = {}) {
      const q = batchId ? `?batchId=${batchId}` : "";
      return apiFetch<{ tests: any[] }>(`/tests${q}`, options);
    },
    async getById(id: string, options: RequestInit = {}) {
      return apiFetch<{ test: any; hasCompleted: boolean; lastAttempt?: any }>(`/tests/${id}`, options);
    },
    async start(id: string, options: RequestInit = {}) {
      return apiFetch<{ attempt: any }>(`/tests/${id}/start`, { ...options, method: "POST" });
    },
    async submit(id: string, body: { attempt_id?: string; answers: Record<string, string>; time_taken_seconds: number }, options: RequestInit = {}) {
      return apiFetch(`/tests/${id}/submit`, { ...options, method: "POST", body: JSON.stringify(body) });
    },
    async getAttempts(id: string, options: RequestInit = {}) {
      return apiFetch<{ attempts: any[] }>(`/tests/${id}/attempts`, options);
    },
    async getLeaderboard(id: string, options: RequestInit = {}) {
      return apiFetch<{ leaderboard: any[] }>(`/tests/${id}/leaderboard`, options);
    },
    // ── Feature 5 additions ──
    async myAttempts(options: RequestInit = {}) {
      return apiFetch<{ attempts: any[] }>("/tests/my-attempts", options);
    },
    async getAttemptById(attemptId: string, options: RequestInit = {}) {
      return apiFetch<{ attempt: any; test: any; hasCompleted: boolean }>(`/tests/attempts/${attemptId}`, options);
    },
    async submitAttempt(attemptId: string, body: { answers: Record<string, string>; time_taken_seconds: number }, options: RequestInit = {}) {
      return apiFetch(`/tests/attempts/${attemptId}/submit`, { ...options, method: "POST", body: JSON.stringify(body) });
    },
    async create(body: {
      batch_id: string;
      subject_id?: string;
      title: string;
      description?: string;
      duration_minutes?: number;
      total_marks?: number;
      negative_marking?: number;
      pass_percentage?: number;
      starts_at?: string;
      ends_at?: string;
    }, options: RequestInit = {}) {
      return apiFetch<{ test: any }>("/tests", { ...options, method: "POST", body: JSON.stringify(body) });
    },
    async update(id: string, body: Record<string, any>, options: RequestInit = {}) {
      return apiFetch<{ test: any }>(`/tests/${id}`, { ...options, method: "PUT", body: JSON.stringify(body) });
    },
    async publish(id: string, isPublished: boolean, options: RequestInit = {}) {
      return apiFetch<{ test: any }>(`/tests/${id}/publish`, { ...options, method: "PUT", body: JSON.stringify({ is_published: isPublished }) });
    },
    async deleteTest(id: string, options: RequestInit = {}) {
      return apiFetch(`/tests/${id}`, { ...options, method: "DELETE" });
    },
    async getQuestions(testId: string, options: RequestInit = {}) {
      return apiFetch<{ questions: any[] }>(`/tests/${testId}/questions`, options);
    },
    async addQuestion(testId: string, body: {
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: string;
      explanation?: string;
      marks?: number;
      question_order?: number;
    }, options: RequestInit = {}) {
      return apiFetch<{ question: any }>(`/tests/${testId}/questions`, { ...options, method: "POST", body: JSON.stringify(body) });
    },
    async removeQuestion(questionId: string, options: RequestInit = {}) {
      return apiFetch(`/tests/questions/${questionId}`, { ...options, method: "DELETE" });
    },
  },

  // ── Doubts & AI Tutor
  doubts: {
    async list(params?: { batchId?: string; lectureId?: string; status?: string }) {
      const sp = new URLSearchParams();
      if (params?.batchId) sp.set("batchId", params.batchId);
      if (params?.lectureId) sp.set("lectureId", params.lectureId);
      if (params?.status) sp.set("status", params.status);
      const query = sp.toString() ? `?${sp.toString()}` : "";
      return apiFetch<{ doubts: any[] }>(`/doubts${query}`);
    },
    async getById(id: string) {
      return apiFetch<{ doubt: any }>(`/doubts/${id}`);
    },
    async ask(body: {
      question: string;
      batch_id?: string;
      lecture_id?: string;
      subject_id?: string;
      question_image_url?: string;
      request_ai?: boolean;
    }) {
      return apiFetch(`/doubts`, { method: "POST", body: JSON.stringify(body) });
    },
    async answer(id: string, answer: string) {
      return apiFetch(`/doubts/${id}/answer`, { method: "POST", body: JSON.stringify({ answer }) });
    },
  },

  // ── Gamification & Leaderboard
  gamification: {
    async getProfile() {
      return apiFetch<{ profile: any; badges: any[] }>("/gamification/profile");
    },
    async getBadges() {
      return apiFetch<{ badges: any[] }>("/gamification/badges");
    },
    async getLeaderboard() {
      return apiFetch<{ leaderboard: any[] }>("/gamification/leaderboard");
    },
    async dailyCheckin() {
      return apiFetch<{ alreadyCheckedIn: boolean; streakDays: number; xpEarned?: number; message: string }>(
        "/gamification/daily-checkin",
        { method: "POST" }
      );
    },
  },

  // ── Bookmarks & History
  bookmarks: {
    async list(params?: { q?: string; sort?: string }, options: RequestInit = {}) {
      const sp = new URLSearchParams();
      if (params?.q) sp.set("q", params.q);
      if (params?.sort) sp.set("sort", params.sort);
      const query = sp.toString() ? `?${sp.toString()}` : "";
      return apiFetch<{ bookmarks: any[] }>(`/bookmarks${query}`, options);
    },
    async toggle(
      body: {
        lecture_id?: string;
        material_id?: string;
        lectureId?: string;
        materialId?: string;
        bookmark_type?: string;
        bookmarkType?: string;
        note_type?: string;
        noteType?: string;
        note_title?: string;
        noteTitle?: string;
        note_url?: string;
        noteUrl?: string;
      },
      options: RequestInit = {}
    ) {
      return apiFetch("/bookmarks", {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    async remove(idOrBody: string | { bookmarkId: string }, options: RequestInit = {}) {
      if (typeof idOrBody === "string") {
        return apiFetch(`/bookmarks/${idOrBody}`, { ...options, method: "DELETE" });
      }
      return apiFetch(`/bookmarks`, {
        ...options,
        method: "DELETE",
        body: JSON.stringify(idOrBody),
      });
    },
  },
  history: {
    async list(options: RequestInit = {}) {
      return apiFetch<{ history: any[] }>("/history", options);
    },
    async record(
      body: {
        lecture_id?: string;
        lectureId?: string;
        watched_seconds?: number;
        watchedSeconds?: number;
        total_seconds?: number;
        totalSeconds?: number;
        completed?: boolean;
      },
      options: RequestInit = {}
    ) {
      const payload = {
        lecture_id: body.lecture_id || body.lectureId,
        watched_seconds: body.watched_seconds ?? body.watchedSeconds ?? 0,
        total_seconds: body.total_seconds ?? body.totalSeconds ?? 0,
        completed: body.completed || false,
      };
      return apiFetch("/history", {
        ...options,
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async clear(options: RequestInit = {}) {
      return apiFetch("/history", { ...options, method: "DELETE" });
    },
  },

  // ── Notifications
  notifications: {
    async list() {
      return apiFetch<{ notifications: any[]; unreadCount: number }>("/notifications");
    },
    async markRead(id: string) {
      return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    },
    async markAllRead() {
      return apiFetch("/notifications/mark-all-read", { method: "POST" });
    },
  },

  // ── Concessions & Payments
  concessions: {
    async request(body: { concession_type: string; document_url: string; document_original_name?: string }) {
      return apiFetch("/concessions/request", { method: "POST", body: JSON.stringify(body) });
    },
    async myRequests() {
      return apiFetch<{ requests: any[] }>("/concessions/my-requests");
    },
  },
  payments: {
    async createOrder(batchId: string, concessionId?: string, discountType?: string) {
      return apiFetch("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ batch_id: batchId, concession_id: concessionId, discount_type: discountType }),
      });
    },
    async verify(data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) {
      return apiFetch("/payments/verify", { method: "POST", body: JSON.stringify(data) });
    },
    async history() {
      return apiFetch<{ payments: any[] }>("/payments/history");
    },
  },

  // ── System
  system: {
    async health() {
      return apiFetch("/system/health");
    },
    async ready() {
      return apiFetch("/system/ready");
    },
  },
};
