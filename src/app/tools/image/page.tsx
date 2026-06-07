"use client";

import { useState, useRef, useCallback } from "react";
import { imagePresets, type ImagePreset } from "@/lib/image-presets";

interface UploadImage { file: File; url: string; originalW: number; originalH: number; name: string; }

function calcResize(srcW: number, srcH: number, targetW: number, targetH: number) {
  const scale = Math.max(targetW / srcW, targetH / srcH);
  return { dstW: Math.round(srcW * scale), dstH: Math.round(srcH * scale), cropX: Math.round((Math.round(srcW * scale) - targetW) / 2), cropY: Math.round((Math.round(srcH * scale) - targetH) / 2), cropW: targetW, cropH: targetH };
}

function resizeImage(img: HTMLImageElement, targetW: number, targetH: number): Promise<string> {
  return new Promise((resolve) => {
    const { dstW, dstH, cropX, cropY, cropW, cropH } = calcResize(img.naturalWidth, img.naturalHeight, targetW, targetH);
    const canvas = document.createElement("canvas"); canvas.width = cropW; canvas.height = cropH;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(img, -cropX, -cropY, dstW, dstH);
    resolve(canvas.toDataURL("image/png"));
  });
}

export default function ImageResizePage() {
  const [uploaded, setUploaded] = useState<UploadImage | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ImagePreset | null>(null);
  const [customW, setCustomW] = useState(""); const [customH, setCustomH] = useState("");
  const [resultUrl, setResultUrl] = useState<string>(""); const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { setUploaded({ file, url, originalW: img.naturalWidth, originalH: img.naturalHeight, name: file.name }); setResultUrl(""); setSelectedPreset(null); setCustomW(""); setCustomH(""); };
    img.src = url;
  }, []);

  const processResize = async (src: UploadImage, w: number, h: number) => {
    setProcessing(true); const img = new Image();
    img.onload = async () => { const dataUrl = await resizeImage(img, w, h); setResultUrl(dataUrl); setProcessing(false); };
    img.src = src.url;
  };

  const download = () => {
    if (!resultUrl || !uploaded) return;
    const a = document.createElement("a"); const ext = uploaded.name.lastIndexOf(".") > 0 ? uploaded.name.slice(uploaded.name.lastIndexOf(".")) : ".png";
    const base = uploaded.name.replace(/\.[^.]+$/, "");
    const w = selectedPreset?.w ?? parseInt(customW, 10) ?? 0; const h = selectedPreset?.h ?? parseInt(customH, 10) ?? 0;
    a.href = resultUrl; a.download = `${base}_${w}x${h}${ext}`; a.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🖼️ 이미지 리사이즈</h1>
        <p className="text-xs sm:text-sm text-gray-500">이미지를 업로드하고 원하는 크기로 리사이즈합니다</p>
      </div>

      {!uploaded && (
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}>
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📤</div>
          <p className="text-sm sm:text-base text-gray-600 font-medium mb-1">이미지를 드래그하거나 클릭하여 업로드</p>
          <p className="text-[10px] sm:text-xs text-gray-400">PNG, JPG, WEBP, GIF 지원</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {uploaded && (<>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 lg:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={uploaded.url} alt="preview" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{uploaded.name}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">원본: {uploaded.originalW} × {uploaded.originalH} px · {(uploaded.file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setUploaded(null); setResultUrl(""); setSelectedPreset(null); setCustomW(""); setCustomH(""); }}
              className="text-[10px] sm:text-xs text-gray-400 hover:text-red-600 px-1.5 sm:px-2 py-1 rounded hover:bg-red-50 transition-colors">🗑️ 삭제</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 mb-4 lg:mb-6">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">📐 크기 선택</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {imagePresets.map((preset) => (
              <button key={preset.label} onClick={async () => { if (!uploaded) return; setSelectedPreset(preset); setCustomW(String(preset.w)); setCustomH(String(preset.h)); await processResize(uploaded, preset.w, preset.h); }}
                className={`text-left px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border text-[10px] sm:text-xs transition-colors ${
                  selectedPreset?.label === preset.label ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"}`}>
                <div className="font-semibold">{preset.label}</div>
                <div className="text-gray-400 mt-0.5">{preset.w} × {preset.h} {preset.desc && `· ${preset.desc}`}</div>
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100">
            <div className="flex-1">
              <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">가로 (px)</label>
              <input type="number" min={1} value={customW} onChange={(e) => { setCustomW(e.target.value); setSelectedPreset(null); }}
                placeholder="가로" className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">세로 (px)</label>
              <input type="number" min={1} value={customH} onChange={(e) => { setCustomH(e.target.value); setSelectedPreset(null); }}
                placeholder="세로" className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <button onClick={async () => { if (!uploaded) return; const w = parseInt(customW, 10); const h = parseInt(customH, 10); if (!w || !h || w <= 0 || h <= 0) return; setSelectedPreset(null); await processResize(uploaded, w, h); }}
              disabled={!customW || !customH || processing}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {processing ? "처리 중..." : "리사이즈"}
            </button>
          </div>
        </div>

        {resultUrl && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">✅ 결과</span>
              <button onClick={download}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors font-medium">💾 다운로드</button>
            </div>
            <div className="p-3 sm:p-4 flex justify-center bg-gray-100">
              <img src={resultUrl} alt="result" className="max-w-full rounded-lg border border-gray-200 shadow-sm" style={{ maxHeight: "300px" }} />
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}