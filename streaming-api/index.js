require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");
const { AccessToken, RoomServiceClient } = require("livekit-server-sdk");

const app = express();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "127.0.0.1";
const API_SECRET = process.env.VPS_API_SECRET || process.env.API_SECRET || "replace_with_long_random_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://vismart.com";
const LIVEKIT_HOST = process.env.LIVEKIT_HOST || process.env.NEXT_PUBLIC_LIVEKIT_URL || "http://127.0.0.1:7880";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";
const VPS_STREAM_URL = process.env.VPS_STREAM_URL || "https://stream.vismart.com";

const ROOT_DIR = process.env.VI_SMART_ROOT_DIR || "/opt/vi-smart";
const RECORDINGS_DIR = process.env.RECORDINGS_DIR || path.join(ROOT_DIR, "recordings");
const NOTES_DIR = process.env.NOTES_DIR || path.join(ROOT_DIR, "notes");
const THUMBNAILS_DIR = process.env.THUMBNAILS_DIR || path.join(ROOT_DIR, "thumbnails");
const TEMP_DIR = process.env.TEMP_DIR || path.join(ROOT_DIR, "temp");

for (const dir of [RECORDINGS_DIR, NOTES_DIR, THUMBNAILS_DIR, TEMP_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const hasRealSupabaseCredentials =
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_KEY &&
  !process.env.SUPABASE_URL.includes("xxx.supabase.co") &&
  process.env.SUPABASE_SERVICE_KEY !== "eyJxxx";

const supabase =
  hasRealSupabaseCredentials
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

const roomService = new RoomServiceClient(LIVEKIT_HOST.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
const activeRecordings = new Map();

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: FRONTEND_URL === "*" ? "*" : [FRONTEND_URL, "http://localhost:3000"], credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

function requireSecret(req, res, next) {
  const secret = req.headers["x-api-secret"];
  if (secret !== API_SECRET) {
    return res.status(401).json({ error: "Invalid API secret" });
  }
  next();
}

function cleanName(name) {
  return String(name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

function publicRecordingUrl(batchId, fileName) {
  return `${VPS_STREAM_URL}/recordings/${batchId}/${fileName}`;
}

function publicThumbnailUrl(fileName) {
  return `${VPS_STREAM_URL}/thumbnails/${fileName}`;
}

function getVideoDuration(filePath) {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", filePath]);
    let output = "";
    ffprobe.stdout.on("data", (data) => (output += data.toString()));
    ffprobe.on("close", () => {
      try {
        const parsed = JSON.parse(output);
        resolve(Math.floor(Number(parsed.format?.duration || 0)));
      } catch {
        resolve(0);
      }
    });
    ffprobe.on("error", () => resolve(0));
  });
}

function generateThumbnail(videoPath, thumbPath) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(thumbPath), { recursive: true });
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      videoPath,
      "-ss",
      "00:00:00",
      "-vframes",
      "1",
      "-vf",
      "scale=640:360",
      "-q:v",
      "2",
      "-y",
      thumbPath,
    ]);
    ffmpeg.on("close", () => resolve(fs.existsSync(thumbPath)));
    ffmpeg.on("error", () => resolve(false));
  });
}

async function updateSupabase(table, values, filterColumn, filterValue) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(values).eq(filterColumn, filterValue).select().single();
  if (error) console.error(`Supabase update error on ${table}:`, error.message);
  return data;
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "vi-smart-api",
    storageRoot: ROOT_DIR,
    livekitHost: LIVEKIT_HOST,
  });
});

app.post("/live/create-room", requireSecret, async (req, res) => {
  try {
    const { roomName, maxParticipants = 500 } = req.body;
    if (!roomName) return res.status(400).json({ error: "roomName is required" });

    let room;
    try {
      room = await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60 * 30,
        departureTimeout: 60 * 10,
        maxParticipants,
      });
    } catch (err) {
      if (!String(err.message || "").includes("already exists")) throw err;
    }

    res.json({ success: true, roomName, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function createJoinToken({ roomName, identity, name, role }) {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: "4h",
    metadata: JSON.stringify({ role }),
  });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: role === "teacher",
    canSubscribe: true,
    canPublishData: true,
  });
  return token.toJwt();
}

app.post("/live/teacher-token", requireSecret, async (req, res) => {
  try {
    const { roomName, teacherId, teacherName } = req.body;
    const token = await createJoinToken({
      roomName,
      identity: teacherId || `teacher-${Date.now()}`,
      name: teacherName || "Teacher",
      role: "teacher",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/live/student-token", requireSecret, async (req, res) => {
  try {
    const { roomName, studentId, studentName } = req.body;
    const token = await createJoinToken({
      roomName,
      identity: studentId || `student-${Date.now()}`,
      name: studentName || "Student",
      role: "student",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const batchId = cleanName(req.body.batchId || "general");
    const batchDir = path.join(RECORDINGS_DIR, batchId);
    fs.mkdirSync(batchDir, { recursive: true });
    cb(null, batchDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${cleanName(file.originalname)}`),
});

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const batchId = cleanName(req.body.batchId || "general");
    const batchDir = path.join(NOTES_DIR, batchId);
    fs.mkdirSync(batchDir, { recursive: true });
    cb(null, batchDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${cleanName(file.originalname)}`),
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["video/mp4", "video/webm", "video/avi", "video/x-msvideo"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

const uploadVideoFields = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "thumbnail") {
        cb(null, THUMBNAILS_DIR);
      } else {
        const batchId = cleanName(req.body.batchId || "general");
        const batchDir = path.join(RECORDINGS_DIR, batchId);
        fs.mkdirSync(batchDir, { recursive: true });
        cb(null, batchDir);
      }
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${cleanName(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      cb(null, true);
    } else if (["video/mp4", "video/webm", "video/avi", "video/x-msvideo"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

app.post("/upload/video", requireSecret, uploadVideoFields.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), async (req, res) => {
  const files = req.files;
  const videoFile = files?.["video"]?.[0];
  if (!videoFile) return res.status(400).json({ error: "No video file uploaded" });

  try {
    const { title, batchId, subjectId, chapterId, teacherId, sortOrder, description } = req.body;
    const duration = await getVideoDuration(videoFile.path);

    let thumbUrl = null;
    const thumbnailFile = files?.["thumbnail"]?.[0];
    if (thumbnailFile) {
      const thumbName = thumbnailFile.filename;
      thumbUrl = publicThumbnailUrl(thumbName);
    } else {
      const thumbName = `${Date.now()}-thumb.jpg`;
      const thumbPath = path.join(THUMBNAILS_DIR, thumbName);
      await generateThumbnail(videoFile.path, thumbPath);
      thumbUrl = publicThumbnailUrl(thumbName);
    }

    const stats = fs.statSync(videoFile.path);
    const videoUrl = publicRecordingUrl(cleanName(batchId || "general"), videoFile.filename);

    let lecture = null;
    if (supabase) {
      const { data, error } = await supabase
        .from("lectures")
        .insert({
          title,
          description,
          batch_id: batchId,
          subject_id: subjectId,
          chapter_id: chapterId,
          teacher_id: teacherId || null,
          cloudflare_playback_url: videoUrl,
          cloudflare_thumbnail_url: thumbUrl,
          duration_seconds: duration,
          duration_label: formatDuration(duration),
          sort_order: Number(sortOrder || 0),
          is_active: true,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      lecture = data;
      if (chapterId) await supabase.rpc("increment_chapter_lectures", { chapter_id_param: chapterId });
    }

    res.json({
      success: true,
      lecture,
      videoUrl,
      thumbnailUrl: thumbUrl,
      fileSizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
      durationSeconds: duration,
    });
  } catch (err) {
    if (videoFile?.path && fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
    res.status(500).json({ error: err.message });
  }
});

app.post("/upload/pdf", requireSecret, uploadPdf.single("pdf"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No PDF file uploaded" });

  try {
    const { title, batchId, subjectId, chapterId, materialType, lectureId, teacherId } = req.body;
    const stats = fs.statSync(file.path);
    const fileUrl = `${VPS_STREAM_URL}/notes/${cleanName(batchId || "general")}/${file.filename}`;

    let material = null;
    if (supabase) {
      const { data, error } = await supabase
        .from("study_materials")
        .insert({
          title,
          batch_id: batchId,
          subject_id: subjectId,
          chapter_id: chapterId,
          lecture_id: lectureId || null,
          teacher_id: teacherId || null,
          file_url: fileUrl,
          file_path: file.path,
          file_name: file.originalname,
          file_size_bytes: stats.size,
          file_type: "pdf",
          material_type: materialType || "notes",
          is_active: true,
          is_downloadable: true,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      material = data;
    }

    res.json({ success: true, material, fileUrl, fileSizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)) });
  } catch (err) {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: err.message });
  }
});

app.post("/record/start", requireSecret, async (req, res) => {
  try {
    const { roomName, liveClassId, batchId, inputUrl, title } = req.body;
    if (!roomName || !liveClassId || !batchId) {
      return res.status(400).json({ error: "roomName, liveClassId, and batchId are required" });
    }

    if (activeRecordings.has(roomName)) {
      return res.json({ success: true, message: "Already recording" });
    }

    const batchDir = path.join(RECORDINGS_DIR, cleanName(batchId));
    fs.mkdirSync(batchDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${cleanName(liveClassId)}-${timestamp}.mp4`;
    const outputPath = path.join(batchDir, fileName);
    const sourceUrl = inputUrl || `rtmp://127.0.0.1:1935/live/${roomName}`;

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      sourceUrl,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => console.log(`[record ${roomName}] ${data.toString().slice(0, 160)}`));
    ffmpeg.on("error", (err) => {
      console.error(`FFmpeg error for ${roomName}:`, err.message);
      activeRecordings.delete(roomName);
    });
    ffmpeg.on("close", async () => {
      activeRecordings.delete(roomName);
      if (!fs.existsSync(outputPath)) return;

      const stats = fs.statSync(outputPath);
      const thumbName = `${cleanName(liveClassId)}.jpg`;
      const thumbPath = path.join(THUMBNAILS_DIR, thumbName);
      await generateThumbnail(outputPath, thumbPath);

      await updateSupabase(
        "live_classes",
        {
          recording_path: outputPath,
          recording_url: publicRecordingUrl(cleanName(batchId), fileName),
          recording_file_size_mb: Number((stats.size / (1024 * 1024)).toFixed(2)),
          thumbnail_url: publicThumbnailUrl(thumbName),
          is_recording_available: true,
          status: "completed",
          ended_at: new Date().toISOString(),
        },
        "id",
        liveClassId
      );
    });

    activeRecordings.set(roomName, {
      process: ffmpeg,
      outputPath,
      fileName,
      liveClassId,
      batchId,
      title,
      startTime: Date.now(),
    });

    await updateSupabase("live_classes", { status: "live", started_at: new Date().toISOString() }, "id", liveClassId);

    res.json({ success: true, message: "Recording started", file: fileName, path: outputPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/record/stop", requireSecret, (req, res) => {
  const { roomName } = req.body;
  const recording = activeRecordings.get(roomName);
  if (!recording) return res.status(404).json({ error: "No active recording found" });

  if (recording.process.stdin.writable) recording.process.stdin.write("q");
  setTimeout(() => recording.process.kill("SIGTERM"), 3000);
  res.json({ success: true, message: "Recording stopping", file: recording.fileName });
});

app.get("/record/status/:roomName", requireSecret, (req, res) => {
  const recording = activeRecordings.get(req.params.roomName);
  if (!recording) return res.json({ isRecording: false });

  const durationSeconds = Math.floor((Date.now() - recording.startTime) / 1000);
  res.json({
    isRecording: true,
    fileName: recording.fileName,
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
  });
});

app.get("/record/list/:batchId", requireSecret, (req, res) => {
  const batchDir = path.join(RECORDINGS_DIR, cleanName(req.params.batchId));
  if (!fs.existsSync(batchDir)) return res.json({ recordings: [] });

  const recordings = fs
    .readdirSync(batchDir)
    .filter((file) => file.endsWith(".mp4") || file.endsWith(".webm"))
    .map((fileName) => {
      const filePath = path.join(batchDir, fileName);
      const stats = fs.statSync(filePath);
      return {
        fileName,
        sizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
        createdAt: stats.birthtime,
        url: publicRecordingUrl(cleanName(req.params.batchId), fileName),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ recordings });
});

app.delete("/record/delete", requireSecret, async (req, res) => {
  try {
    const { batchId, fileName, liveClassId } = req.body;
    const filePath = path.join(RECORDINGS_DIR, cleanName(batchId), cleanName(fileName));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (liveClassId) {
      const thumbPath = path.join(THUMBNAILS_DIR, `${cleanName(liveClassId)}.jpg`);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      await updateSupabase(
        "live_classes",
        { recording_path: null, recording_url: null, is_recording_available: false },
        "id",
        liveClassId
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/storage-stats", requireSecret, (req, res) => {
  try {
    const dfOutput = execSync(`df -BGB ${ROOT_DIR}`).toString();
    const parts = dfOutput.trim().split("\n")[1].trim().split(/\s+/);
    let totalFiles = 0;
    let totalSizeMB = 0;

    function visit(dir) {
      if (!fs.existsSync(dir)) return;
      for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) visit(fullPath);
        else if (item.endsWith(".mp4") || item.endsWith(".webm")) {
          totalFiles++;
          totalSizeMB += stat.size / (1024 * 1024);
        }
      }
    }

    visit(RECORDINGS_DIR);

    res.json({
      disk: {
        totalGB: parseInt(parts[1], 10),
        usedGB: parseInt(parts[2], 10),
        availableGB: parseInt(parts[3], 10),
        usedPercent: parts[4],
      },
      recordings: {
        totalFiles,
        totalSizeMB: Number(totalSizeMB.toFixed(2)),
        totalSizeGB: Number((totalSizeMB / 1024).toFixed(2)),
      },
      activeRecordings: activeRecordings.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/recordings", express.static(RECORDINGS_DIR, { acceptRanges: true, maxAge: "1h" }));
app.use("/thumbnails", express.static(THUMBNAILS_DIR, { maxAge: "1d" }));
app.use("/notes", express.static(NOTES_DIR, { maxAge: "1h" }));

app.listen(PORT, HOST, () => console.log(`Vi Smart API running on ${HOST}:${PORT}`));
