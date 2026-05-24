import type { Metadata } from "next";
import LecturePlayerClient from "./LecturePlayerClient";

export const metadata: Metadata = {
  title: "Watch Lecture | Vi Smart Learning Education",
  robots: { index: false, follow: false },
};

export default function LecturePage() {
  return <LecturePlayerClient />;
}
