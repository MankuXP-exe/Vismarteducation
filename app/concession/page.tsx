"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

type Step = "select" | "upload" | "processing" | "result";
type ConcessionType = "army" | "single_parent" | "disabled";

const TYPE_CONFIG = {
  army: { label: "Army Privilege", desc: "50% off on all batches", discount: "50% off", color: "bg-green-100 text-green-800" },
  single_parent: { label: "Single Parent Support", desc: "₹5,000 flat discount", discount: "₹5,000 off", color: "bg-blue-100 text-blue-800" },
  disabled: { label: "Specially Abled", desc: "50% off on all batches", discount: "50% off", color: "bg-purple-100 text-purple-800" },
};

export default function ConcessionPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [type, setType] = useState<ConcessionType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  function validateAndSetFile(f: File) {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(f.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    setStep("upload");
  }

  async function handleSubmit() {
    if (!user || !type || !file) return;
    setProcessing(true);
    setStep("processing");

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("userId", user.id);
      formData.append("concessionType", type);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("/api/concession/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult(data);
      setStep("result");
      if (data.status === "approved") {
        toast.success("Concession approved! Discount applied automatically.");
      } else {
        toast.error("Concession rejected. Admin will review your document.");
      }
    } catch (err: any) {
      toast.error(err.message);
      setStep("upload");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setStep("select");
    setType(null);
    setFile(null);
    setPreview(null);
    setResult(null);
  }

  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAuthTimeout(true), 5000); return () => clearTimeout(t); }, []);

  if (authLoading && !authTimeout) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Please log in to apply for fee concession.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 sm:mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 sm:mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Fee Concession</h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Upload your document for automatic verification</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 text-xs sm:text-sm">
          {["select", "upload", "result"].map((s, i) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${step === s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step === "select" ? 1 : step === "upload" ? 2 : 3}
              </div>
              <span className={`hidden sm:inline ${step === s ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                {s === "select" ? "Select Type" : s === "upload" ? "Upload Document" : "Result"}
              </span>
              {i < 2 && <div className="w-4 sm:w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Select type */}
        {step === "select" && (
          <div className="space-y-3">
            {(Object.entries(TYPE_CONFIG) as [ConcessionType, typeof TYPE_CONFIG[ConcessionType]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { setType(key); setStep("upload"); }}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${type === key ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-purple-300"}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cfg.label}</h3>
                    <p className="text-sm text-gray-500">{cfg.desc}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.discount}</span>
                </div>
              </button>
            ))}
            <p className="text-xs text-gray-400 text-center pt-2">
              You can only have one active concession at a time.
            </p>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === "upload" && type && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{TYPE_CONFIG[type].label}</h2>
              <button onClick={() => setStep("select")} className="text-sm text-purple-600 hover:underline">
                Change
              </button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400"}`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              ) : file ? (
                <p className="text-gray-700 font-medium">{file.name}</p>
              ) : (
                <div>
                  <p className="text-gray-500">Drag & drop your document here, or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF (max 10MB)</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} className="hidden" />
            </div>

            {file && (
              <button
                onClick={handleSubmit}
                disabled={processing}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {processing ? "Uploading..." : "Submit for Verification"}
              </button>
            )}
          </div>
        )}

        {/* Processing */}
        {step === "processing" && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Processing your document...</p>
            <p className="text-sm text-gray-400 mt-1">Running OCR verification</p>
            <button onClick={() => { setProcessing(false); setStep("upload"); }} className="mt-6 text-sm text-purple-600 hover:underline">
              Cancel
            </button>
          </div>
        )}

        {/* Result */}
        {step === "result" && result && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className={`text-center p-4 rounded-xl ${result.status === "approved" ? "bg-green-50" : "bg-red-50"}`}>
              {result.status === "approved" ? (
                <>
                  <div className="text-4xl mb-2">&#10003;</div>
                  <h2 className="text-xl font-bold text-green-800">Approved!</h2>
                  <p className="text-green-600">
                    {result.concessionLabel} &mdash; {result.discountPercent ? `${result.discountPercent}% off` : `₹${(result.discountFlat || 0) / 100} off`}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">&#10007;</div>
                  <h2 className="text-xl font-bold text-red-800">Not Approved</h2>
                  <p className="text-red-600">{result.reason || "Document could not be verified automatically"}</p>
                </>
              )}
            </div>

            {result.ocrText && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">OCR Extracted Text</p>
                <p className="text-xs text-gray-700 font-mono line-clamp-3">{result.ocrText}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Confidence</p>
                <p className="font-medium">{(result.ocrConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Score</p>
                <p className="font-medium">{result.verificationScore}/{result.minScore}</p>
              </div>
            </div>

            {result.status === "approved" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800">
                <p className="font-medium mb-1">Discount Applied</p>
                <p>Your discount will be automatically applied when you enroll in a batch.</p>
              </div>
            )}

            <button onClick={reset} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Apply Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
