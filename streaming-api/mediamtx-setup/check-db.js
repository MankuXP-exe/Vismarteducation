const {createClient}=require("@supabase/supabase-js");
const ws=require("ws");
const url="https://nimjimjxkteknlbdgvto.supabase.co";
const key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbWppbWp4a3Rla25sYmRndnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU5MTE5NywiZXhwIjoyMDk1MTY3MTk3fQ.o6F2F6jrYbh6Ru4-JO2s1IL6wsxrkVpD8WUGUVk67Uw";
const s=createClient(url,key,{realtime:{transport:ws}});
(async()=>{
  const{data:lc}=await s.from("live_classes").select("id,title,subject_id,batch_id,chapter_id,recording_url,status").order("created_at",{ascending:false}).limit(3);
  console.log("LIVE:",JSON.stringify(lc,null,2));
  const{data:ch}=await s.from("chapters").select("id,title,chapter_number,subject_id,batch_id").eq("batch_id","b9f86469-2c07-4d03-a99e-be7282a273f6");
  console.log("CHAPTERS:",JSON.stringify(ch,null,2));
  const{data:le}=await s.from("lectures").select("id,title,subject_id,chapter_id,batch_id,is_active").order("created_at",{ascending:false}).limit(5);
  console.log("LECTURES:",JSON.stringify(le,null,2));
})();
