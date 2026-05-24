const { execSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

async function checkStorage() {
  const rootDir = process.env.VI_SMART_ROOT_DIR || "/opt/vi-smart";
  const df = execSync(`df -BGB ${rootDir}`).toString();
  const parts = df.trim().split("\n")[1].trim().split(/\s+/);
  const availableGB = parseInt(parts[3], 10);
  const usedPercent = parseInt(parts[4], 10);

  console.log(`Storage: ${usedPercent}% used, ${availableGB}GB free`);

  if (usedPercent > Number(process.env.STORAGE_WARNING_THRESHOLD || 80) && supabase && process.env.ADMIN_USER_ID) {
    await supabase.from("notifications").insert({
      user_id: process.env.ADMIN_USER_ID,
      title: "Storage warning",
      message: `VPS storage is ${usedPercent}% full. Only ${availableGB}GB remaining.`,
      type: "warning",
    });
  }
}

checkStorage().catch((err) => {
  console.error(err);
  process.exit(1);
});
