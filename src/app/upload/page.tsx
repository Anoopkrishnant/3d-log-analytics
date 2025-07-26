"use client";
import React, { useState, useRef } from "react";

interface UploadStats {
  totalRows: number;
  validRows: number;
  malformedCount: number;
  tablesProcessed: number;
  chunksCreated: number;
  processingTimeMs: number;
}

export default function UploadLogsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const readText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string" ? resolve(reader.result) : reject("Invalid file content");
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

  const parseJSONorNDJSON = (txt: string): any[] => {
    try {
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (!txt.trim()) return [];
    return txt
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          console.warn(`Skipping malformed JSON line: ${line}`);
          return null;
        }
      })
      .filter((obj) => obj !== null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setMsg(null);
    setErr(null);
    setProgress(0);
    setSessionId(null);
    setUploadStats(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) {
      setErr("Please select a JSON or NDJSON file.");
      return;
    }
    setBusy(true);
    setMsg(null);
    setErr(null);
    setProgress(0);
    setSessionId(null);
    setUploadStats(null);

    try {
      setMsg("📖 Reading file...");
      const raw = await readText(file);

      setMsg("🔍 Parsing JSON data...");
      const entries = parseJSONorNDJSON(raw);

      if (!entries.length) throw new Error("No valid JSON entries found in the file.");

      const CHUNK_SIZE = 1000;
      const totalChunks = Math.ceil(entries.length / CHUNK_SIZE);
      let session: string | null = null;

      setProgress(10);
      setMsg(`📤 Uploading ${entries.length} records in ${totalChunks} chunks...`);

      for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = entries.slice(i, i + CHUNK_SIZE);

        const bodyPayload: any = { entries: chunk };
        if (session) {
          bodyPayload.sessionId = session;
        } else {
          bodyPayload.totalChunks = totalChunks;
        }

        const res = await fetch("/api/v1/upload-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });

        const text = await res.text();

        if (!res.ok) {
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch {
            throw new Error(`Chunk upload failed: ${res.statusText}`);
          }
          throw new Error(errorData.error || "Chunk upload failed.");
        }

        const result = JSON.parse(text);

        if (result.status === "ok") {
          if (!session && result.sessionId) {
            session = result.sessionId;
            setSessionId(session);
            setUploadStats(result.processing || null);
          }

          const baseProgress = 20;
          const maxProgress = 100;
          const currentChunkIndex = i / CHUNK_SIZE;
          const newProgress =
            baseProgress + ((currentChunkIndex + 1) / totalChunks) * (maxProgress - baseProgress);
          setProgress(Math.min(newProgress, maxProgress));
          setMsg(`🚀 Uploaded chunk ${currentChunkIndex + 1} of ${totalChunks}`);
        } else {
          throw new Error("Upload response missing status 'ok'.");
        }
      }

      setProgress(100);
      setMsg(`✅ Upload completed successfully! ${entries.length} rows uploaded.`);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Upload failed due to invalid JSON or network error.");
      setProgress(0);
      setBusy(false);
    }
  };

  


  return (
    <main className="max-w-2xl h-screen mx-auto mt-12 p-6 bg-[#0a0a0a] rounded-lg text-white font-sans">
      <h2 className="text-2xl font-semibold mb-6">📤 Upload Log File</h2>

      {/* File Drop Zone */}
      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer mb-4 text-center hover:border-gray-400 transition"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <p className="text-gray-400 truncate">
          {file ? `${file.name} (${formatFileSize(file.size)})` : "Click to select a .json or .ndjson file"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".json,.ndjson,application/json"
          className="hidden"
          onChange={onFileChange}
          aria-hidden="true"
        />
      </div>

      {/* File Info & Progress */}
      {file && (
        <div className="bg-gray-800 rounded p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 truncate pr-4">
              <div className="font-medium">{file.name}</div>
              <div className="text-sm text-gray-400">{formatFileSize(file.size)}</div>
            </div>
            {busy && (
              <svg
                className="animate-spin h-5 w-5 text-gray-300"
                viewBox="0 0 24 24"
                aria-label="Loading spinner"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={4}
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
            <div className="bg-green-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{progress.toFixed(0)}%</span>
            {sessionId && <span>Session: {sessionId.slice(-8)}...</span>}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      {uploadStats && (
        <div className="bg-gray-800 rounded p-4 mb-4">
          <h3 className="font-medium mb-2">📊 Upload Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Total Rows: <span className="text-green-400">{uploadStats.totalRows.toLocaleString()}</span></div>
            <div>Valid Rows: <span className="text-green-400">{uploadStats.validRows.toLocaleString()}</span></div>
            <div>Tables: <span className="text-blue-400">{uploadStats.tablesProcessed}</span></div>
            <div>Chunks: <span className="text-blue-400">{uploadStats.chunksCreated}</span></div>
            {uploadStats.malformedCount > 0 && (
              <div className="col-span-2">Malformed: <span className="text-yellow-400">{uploadStats.malformedCount}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={busy || !file}
        className={`w-full py-3 rounded font-semibold transition ${
          busy || !file
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 cursor-pointer"
        }`}
      >
        {busy ? "Uploading..." : "Upload"}
      </button>

      {/* Messages */}
      {msg && (
        <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded">
          <p className="text-green-400 break-words">{msg}</p>
        </div>
      )}
      {err && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded">
          <p className="text-red-500 break-words">{err}</p>
        </div>
      )}
    </main>
  );
}
