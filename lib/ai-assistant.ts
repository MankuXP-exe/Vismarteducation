export interface FAQEntry {
  keywords: string[];
  reply: string;
  category?: string;
}

const faqDatabase: FAQEntry[] = [
  {
    keywords: ["xp", "points", "level up", "increase xp", "earn xp", "more xp", "xp kaise"],
    reply: "Attend live classes (+10 XP), watch lectures (+20 XP), attempt tests (+25 XP), and maintain your daily streak for multiplier bonuses! Visit your Study Dashboard to track progress.",
    category: "xp",
  },
  {
    keywords: ["streak", "break", "lost streak", "daily streak", "streak kaise"],
    reply: "Log in daily to keep your streak alive! If you missed a day, don't worry — your streak resets but your best streak stays saved. Keep going 🔥",
    category: "xp",
  },
  {
    keywords: ["notes", "study material", "pdf", "materials", "notes kahan"],
    reply: "Go to Dashboard → My Batches → Select your batch/subject → Scroll down to Notes & PDFs section. All uploaded materials are there.",
    category: "navigation",
  },
  {
    keywords: ["live class", "join live", "live kaise", "attend live", "live session"],
    reply: "Go to Dashboard → Live Classes. If a live class is scheduled, you'll see a 'Join Now' button. Make sure your camera/mic permissions are enabled.",
    category: "navigation",
  },
  {
    keywords: ["batch", "my batch", "enroll", "course", "batch kaise", "join batch"],
    reply: "Browse all available batches on the Batches page. Click 'Enroll Now' and complete the payment to get instant access to lectures and materials.",
    category: "navigation",
  },
  {
    keywords: ["class", "time", "schedule", "timetable", "class kab"],
    reply: "Check your Dashboard → Live Classes section for upcoming scheduled classes. Teachers post schedules there with dates and times.",
    category: "navigation",
  },
  {
    keywords: ["assignment", "homework", "submit", "hw", "homework kahan"],
    reply: "Assignments are inside your Batch → Materials section. Complete and submit before the deadline to earn XP and badges!",
    category: "navigation",
  },
  {
    keywords: ["test", "exam", "quiz", "practice", "test kaise"],
    reply: "Go to Dashboard → Tests section. Attempt tests to earn +25 XP per test and unlock the 'Test Champion' badge!",
    category: "navigation",
  },
  {
    keywords: ["badge", "achievement", "medal", "trophy", "badge kaise"],
    reply: "Badges are auto-earned! Watch 50 lectures → 'Lecture Master', maintain 30-day streak → 'Monthly Legend', earn 10,000 XP → 'XP Overlord'. Check your badges on the Study Dashboard.",
    category: "xp",
  },
  {
    keywords: ["leaderboard", "rank", "top", "ranking", "number one"],
    reply: "Visit the Leaderboard page to see weekly and all-time rankings. Climb the ranks by earning more XP through lectures, live classes, and tests!",
    category: "xp",
  },
  {
    keywords: ["fee", "payment", "refund", "concession", "discount", "scholarship", "fee kaise"],
    reply: "For fee-related queries, visit the Fee Concession page to apply for discounts. Army, Single Parent, and Disability concessions are available with document verification.",
    category: "support",
  },
  {
    keywords: ["profile", "name change", "photo", "avatar", "setting", "edit profile"],
    reply: "Go to Dashboard → Profile/Settings to update your name, photo, and preferences.",
    category: "navigation",
  },
  {
    keywords: ["password", "forgot", "login", "sign in", "account"],
    reply: "On the login page, click 'Forgot Password' to reset. If you're having trouble signing in, contact support.",
    category: "support",
  },
  {
    keywords: ["recording", "recorded lecture", "missed class", "playback", "video"],
    reply: "Missed a live class? Recordings are available in your Batch → Subject → Lectures section after the teacher processes them.",
    category: "navigation",
  },
  {
    keywords: ["slow", "buffering", "video not playing", "loading", "error"],
    reply: "Try refreshing the page, checking your internet connection, or switching to a lower quality. If the issue persists, contact support.",
    category: "support",
  },
  {
    keywords: ["motivate", "demotivated", "bored", "tired", "give up", "inspire", "keep going"],
    reply: "Small daily progress creates big results! 💪 Every lecture you watch, every test you take brings you closer to your goals. You've got this! 🔥",
    category: "motivation",
  },
  {
    keywords: ["hello", "hi", "hey", "namaste", "namaskar"],
    reply: "Namaste! 🙏 I'm your Vi Smart assistant. Ask me about XP, batches, lectures, or anything else you need help with!",
    category: "greeting",
  },
  {
    keywords: ["teacher", "instructor", "faculty", "who teaches"],
    reply: "You can see teacher details on the batch info page. Each batch has assigned teachers for different subjects.",
    category: "navigation",
  },
];

export function findFAQReply(message: string): FAQEntry | null {
  const lower = message.toLowerCase().trim();

  for (const entry of faqDatabase) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry;
      }
    }
  }

  return null;
}

export function getDailyTip(): string {
  const tips = [
    "🔥 Watch lectures before bedtime — better retention!",
    "📝 Attempt at least one test daily to stay sharp.",
    "⭐ Maintain a 7-day streak to unlock 'Week Warrior' badge!",
    "🎯 Set a goal: 100 XP every day.",
    "📚 Revise notes within 24 hours of a lecture.",
    "💡 Join live classes — you get +10 XP just for attending!",
    "🏆 Top 3 in weekly leaderboard earns a rare badge!",
    "⏰ Study in 45-minute focused blocks.",
    "🤝 Discuss what you learned with friends.",
    "🚀 Complete homework on the same day.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

export const AI_SYSTEM_PROMPT = `You are Vi Smart Assistant — a helpful, friendly AI for an EdTech platform.

Rules:
- Reply in short, clear sentences (max 3-4 lines).
- Mix Hindi and English naturally (Hinglish) when appropriate.
- Be encouraging and motivating.
- Help students with: XP system, batches, lectures, tests, streaks, badges, navigation.
- Never generate harmful, inappropriate, or off-topic content.
- If asked something outside education, politely redirect.
- Use emojis moderately (1-2 per response max).

Example style:
User: "How to increase XP?"
Assistant: "Attend live classes (+10 XP), watch lectures (+20 XP), attempt tests (+25 XP). Daily login gives +5 XP too! 🔥"

User: "Mujhe physics nahi samajh aa rahi"
Assistant: "Physics tough lagti hai but daily practice se easy ho jayegi! Check your batch lectures — wahan detailed explanations hain. 📚"

Keep responses student-friendly and actionable.`;
