#!/bin/bash
# Fix the chapter resolution in the webhook to match live class title to existing chapter
cd /opt/vi-smart-api

# Backup original
cp index.js index.js.bak

# Replace the chapter resolution logic to try matching by title first
python3 << 'PYEOF'
import re

with open("index.js", "r") as f:
    content = f.read()

old_block = """                // Resolve chapter_id: if null, find or create "Live Recordings" chapter
                let chapterId = liveClass.chapter_id;
                if (!chapterId) {
                  const { data: chapters } = await supabase
                    .from("chapters")
                    .select("id")
                    .eq("subject_id", liveClass.subject_id)
                    .eq("title", "Live Recordings")
                    .limit(1);

                  if (chapters && chapters.length > 0) {
                    chapterId = chapters[0].id;
                  } else {
                    const { data: newChapter, error: chErr } = await supabase
                      .from("chapters")
                      .insert({
                        subject_id: liveClass.subject_id,
                        batch_id: liveClass.batch_id,
                        title: "Live Recordings",
                        chapter_number: 999,
                        sort_order: 999,
                        is_active: true,
                      })
                      .select("id")
                      .single();

                    if (!chErr && newChapter) {
                      chapterId = newChapter.id;
                    }
                  }
                }"""

new_block = """                // Resolve chapter_id: match by title or create "Live Recordings"
                let chapterId = liveClass.chapter_id;
                if (!chapterId && liveClass.title) {
                  // Try to find an existing chapter matching the live class title
                  const titleNorm = liveClass.title.trim().toLowerCase().replace(/\\s+/g, "");
                  const { data: allChapters } = await supabase
                    .from("chapters")
                    .select("id, title")
                    .eq("subject_id", liveClass.subject_id)
                    .eq("batch_id", liveClass.batch_id)
                    .eq("is_active", true);

                  if (allChapters) {
                    const match = allChapters.find(ch => {
                      const chNorm = ch.title.trim().toLowerCase().replace(/\\s+/g, "");
                      return chNorm === titleNorm || titleNorm.includes(chNorm) || chNorm.includes(titleNorm);
                    });
                    if (match) {
                      chapterId = match.id;
                      console.log(`[MediaMTX] Matched chapter: ${match.title} (${match.id})`);
                    }
                  }
                }

                // Fallback: find or create "Live Recordings" chapter
                if (!chapterId) {
                  const { data: liveRecChapters } = await supabase
                    .from("chapters")
                    .select("id")
                    .eq("subject_id", liveClass.subject_id)
                    .eq("title", "Live Recordings")
                    .limit(1);

                  if (liveRecChapters && liveRecChapters.length > 0) {
                    chapterId = liveRecChapters[0].id;
                  } else {
                    const { data: newChapter, error: chErr } = await supabase
                      .from("chapters")
                      .insert({
                        subject_id: liveClass.subject_id,
                        batch_id: liveClass.batch_id,
                        title: "Live Recordings",
                        chapter_number: 999,
                        sort_order: 999,
                        is_active: true,
                      })
                      .select("id")
                      .single();

                    if (!chErr && newChapter) {
                      chapterId = newChapter.id;
                    }
                  }
                }"""

content = content.replace(old_block, new_block)

with open("index.js", "w") as f:
    f.write(content)

print("Patched index.js successfully")
PYEOF

# Restart the API
systemctl restart vi-smart-api
sleep 3
echo "API restarted"
curl -s http://127.0.0.1:3001/health
