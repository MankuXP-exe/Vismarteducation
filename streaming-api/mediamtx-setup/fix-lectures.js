const {createClient}=require("@supabase/supabase-js");
const ws=require("ws");
const url="https://nimjimjxkteknlbdgvto.supabase.co";
const key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWppbWp4a3Rla25sYmRndnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU5MTE5NywiZXhwIjoyMDk1MTY3MTk3fQ.o6F2F6jrYbh6Ru4-JO2s1IL6wsxrkVpD8WUGUVk67Uw";
const s=createClient(url,key,{realtime:{transport:ws}});

(async()=>{
  // Find "CH 2" chapter for this subject
  const {data: ch2} = await s.from("chapters").select("id, title").eq("subject_id", "e05a4b61-5450-4540-b3ff-f2bd6acd63b3").eq("batch_id", "b9f86469-2c07-4d03-a99e-be7282a273f6").ilike("title", "%ch 2%").limit(1).single();
  
  if (!ch2) { console.log("No CH 2 chapter found"); return; }
  console.log("Found chapter:", ch2.title, ch2.id);

  // Move all lectures from "Live Recordings" to "CH 2" chapter
  const {data: moved, error} = await s.from("lectures").update({chapter_id: ch2.id}).eq("chapter_id", "37481517-6708-43cc-87af-7f48737cec2e").eq("subject_id", "e05a4b61-5450-4540-b3ff-f2bd6acd63b3").select();
  
  if (error) console.log("Error:", error.message);
  else console.log("Moved", moved.length, "lectures to", ch2.title);
})();
