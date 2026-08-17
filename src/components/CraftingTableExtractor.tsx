import React, { useState } from "react";
import { FormItem, CraftedDocumentData } from "../types";
import { playCraftSound, playExpChime } from "../utils/audio";
import { FileText, Sparkles, Check, AlertCircle, FileUp, Cpu, Copy, CheckCheck, Volume2, ShieldCheck, AlertTriangle, Crosshair } from "lucide-react";

interface CraftingTableProps {
  onFormExtracted: (formItem: FormItem) => void;
}

const SAMPLE_FORMS = [
  {
    id: "form-sample-1",
    title: "Hindi Admission Form (प्रवेश पत्र)",
    type: "ADMISSION_FORM",
    language: "Hindi (हिंदी)",
    previewText: "छात्र का नाम: राहुल शर्मा\nअभिभावक: रमेश शर्मा\nजन्म तिथि: 12-04-2011\nकक्षा: Grade 10-B\nफोन नंबर: +91 98765 43210\nपता: सेक्टर 14, रेडस्टोन एन्क्लेव, नई दिल्ली\nपूर्व विद्यालय: सेंट जेवियर्स क्राफ्टिंग अकादमी",
    icon: "📜",
  },
  {
    id: "form-sample-2",
    title: "Marathi Report Card (प्रगती पत्रक)",
    type: "REPORT_CARD",
    language: "Marathi (मराठी)",
    previewText: "विद्यार्थ्याचे नाव: आदित्य कुलकर्णी\nअनुक्रमांक: ROLL-42\nशैक्षणिक वर्ष: 2025-2026\nसत्र: Term 1 Final\nगणित: A+ (94%)\nशास्त्र: A (88%)\nइंग्रजी: B+ (79%)\nएकूण टक्केवारी: 87.0%\nशिक्षक अभिप्राय: उत्कृष्ट तार्किक समस्या निवारण.",
    icon: "📊",
  },
  {
    id: "form-sample-3",
    title: "English Fee Receipt (Payment Slate)",
    type: "FEE_RECEIPT",
    language: "English",
    previewText: "Receipt No: REC-2026-904\nStudent: Steve Block\nClass: Grade 8-A\nPayment Date: 2026-07-25\nTotal Paid: $450.00\nPayment Method: UPI / Digital Transfer\nOutstanding Balance: $0.00",
    icon: "🧾",
  },
  {
    id: "form-sample-4",
    title: "Spanish Leave Letter (Solicitud de Permiso)",
    type: "LEAVE_LETTER",
    language: "Spanish (Español)",
    previewText: "Estudiante: Mateo Garcia\nClase: Grade 10-A\nMotivo de la Ausencia: Fiebre alta y consulta médica\nFecha de Inicio: 2026-07-28\nFecha de Fin: 2026-07-30\nDías Totales: 3 Días\nFirma del Tutor: PRESENT_VERIFIED",
    icon: "📑",
  },
];

export const CraftingTableExtractor: React.FC<CraftingTableProps> = ({ onFormExtracted }) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_FORMS[0]);
  const [customText, setCustomText] = useState("");
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftedOutput, setCraftedOutput] = useState<CraftedDocumentData | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCraftDocument = async () => {
    playCraftSound();
    setIsCrafting(true);
    setCraftedOutput(null);

    try {
      const payload = {
        formType: selectedSample.type,
        documentText: customText || selectedSample.previewText,
        imageBase64: customImageBase64,
      };

      const response = await fetch("/api/extract-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: CraftedDocumentData = await response.json();
      setCraftedOutput(data);
      playExpChime();

      // Notify parent system
      const newFormItem: FormItem = {
        id: `form-${Date.now()}`,
        title: selectedSample.title,
        type: selectedSample.type,
        language: selectedSample.language,
        status: "crafted",
        extractedData: data,
      };

      onFormExtracted(newFormItem);
    } catch (err) {
      console.error("Crafting failed:", err);
    } finally {
      setIsCrafting(false);
    }
  };

  const handleCopyJson = () => {
    if (craftedOutput) {
      navigator.clipboard.writeText(JSON.stringify(craftedOutput, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handlePlayVoiceScript = () => {
    if (!craftedOutput?.voice_confirmation_script) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(craftedOutput.voice_confirmation_script);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingSpeech(true);
      utterance.onend = () => setIsPlayingSpeech(false);
      utterance.onerror = () => setIsPlayingSpeech(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-To-Speech is not supported in this browser window.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-[#5B8731] border-4 border-[#2D4519] p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF5500] border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0_#000]">
            🛠️
          </div>
          <div>
            <h2 className="font-mono text-xl font-black text-white uppercase tracking-wide italic drop-shadow-[2px_2px_0_#2D4519]">
              Crafting Table Vision Engine
            </h2>
            <p className="text-xs text-emerald-100 font-mono">
              Enterprise AI Document Reader • Block Detection (ADMISSION, REPORT, FEE, LEAVE) • Universal Decoder • Redstone Announcer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-2 border border-black text-xs font-mono text-yellow-300">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
          <span>Gemini 3.6 Flash Multi-Language OCR</span>
        </div>
      </div>

      {/* Main Crafting Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Select & Custom Upload (4 cols) */}
        <div className="lg:col-span-4 bg-[#1a1a1a] border-4 border-[#4a4a4a] p-4 space-y-4">
          <h3 className="font-mono text-xs font-bold text-amber-400 uppercase border-b border-neutral-700 pb-2">
            1. Select Paperwork / Form (Block Category)
          </h3>

          <div className="space-y-2">
            {SAMPLE_FORMS.map((form) => (
              <button
                key={form.id}
                onClick={() => {
                  setSelectedSample(form);
                  setCustomImageBase64(null);
                }}
                className={`w-full text-left p-3 font-mono text-xs border-2 border-black transition-all flex items-start gap-3 ${
                  selectedSample.id === form.id && !customImageBase64
                    ? "bg-[#FF5500] text-white shadow-[2px_2px_0_#000]"
                    : "bg-[#2d2d2d] text-neutral-300 hover:bg-[#3d3d3d]"
                }`}
              >
                <span className="text-xl">{form.icon}</span>
                <div>
                  <div className="font-bold text-white">{form.title}</div>
                  <div className="text-[10px] text-amber-300 font-bold">
                    Category: {form.type} • {form.language}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-700 pt-3">
            <label className="font-mono text-xs font-bold text-neutral-300 block mb-2">
              Or Upload Physical Scan (OCR & Vision)
            </label>
            <label className="mc-button block w-full text-center py-2 text-xs text-neutral-200 cursor-pointer">
              <FileUp className="w-4 h-4 inline-block mr-1" />
              <span>Browse File / Take Photo</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {customImageBase64 && (
              <div className="mt-2 relative border-2 border-black bg-black p-1">
                <img src={customImageBase64} alt="Scan preview" className="max-h-28 w-full object-contain" />
                <button
                  onClick={() => setCustomImageBase64(null)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: 3x3 Crafting Table Interface (4 cols) */}
        <div className="lg:col-span-4 bg-[#C6C6C6] border-4 border-white shadow-[4px_4px_0_#7a7a7a,inset_-4px_-4px_0_#7a7a7a] p-4 flex flex-col items-center justify-between text-[#1a1a1a]">
          <h3 className="font-mono text-xs font-bold text-[#1a1a1a] uppercase mb-3 border-b-2 border-[#7a7a7a] pb-1 italic">
            Crafting Table (AI Extractor)
          </h3>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#8b8b8b] p-3 border-4 border-[#4a4a4a]">
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">📜</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center font-black text-[10px] text-red-700">🔴 REDSTONE</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">✨</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">🔍</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-2xl">
              {customImageBase64 ? "📸" : selectedSample.icon}
            </div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">🧠</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">⚡</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">📋</div>
            <div className="w-16 h-16 bg-[#9d9d9d] border-2 border-[#4a4a4a] flex items-center justify-center text-xl">💎</div>
          </div>

          {/* Crafting Badge */}
          <div className="my-2 bg-[#5B8731] px-3 py-1 border-2 border-black text-white text-[10px] font-bold uppercase shadow-[2px_2px_0_#000]">
            GEMINI VISION ACTIVE
          </div>

          {/* Output Slot & Craft Button */}
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 bg-[#8b8b8b] border-4 border-[#4a4a4a] flex items-center justify-center">
              <span className="text-2xl">{isCrafting ? "⏳" : craftedOutput ? "✅" : "📦"}</span>
            </div>

            <button
              onClick={handleCraftDocument}
              disabled={isCrafting}
              className="bg-[#5B8731] hover:bg-[#4a7027] border-b-4 border-[#2D4519] text-white px-5 py-3 font-bold text-xs uppercase shadow-[2px_2px_0_#000] active:translate-y-1 flex items-center gap-2"
            >
              <Cpu className={`w-5 h-5 ${isCrafting ? "animate-spin text-yellow-300" : ""}`} />
              <span>{isCrafting ? "CRAFTING..." : "CRAFT RECORD"}</span>
            </button>
          </div>

          {/* Recipe Formula Tag */}
          <div className="mt-3 bg-[#8b8b8b] p-2 border-2 border-[#4a4a4a] font-mono text-[11px] font-bold text-[#1a1a1a] text-center w-full uppercase">
            3x Raw Paper + 1x Redstone Powder ➔ Universal JSON
          </div>
        </div>

        {/* Right Column: Crafted Digital Record Result (4 cols) */}
        <div className="lg:col-span-4 bg-[#1a1a1a] border-4 border-[#4a4a4a] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-2 mb-3">
            <h3 className="font-mono text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              3. Crafted Enterprise JSON
            </h3>
            {craftedOutput && (
              <button
                onClick={handleCopyJson}
                className="mc-button px-2 py-1 text-[10px] text-neutral-300 flex items-center gap-1"
              >
                {copiedJson ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
              </button>
            )}
          </div>

          {isCrafting ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-none animate-spin" />
              <p className="font-mono text-xs font-bold text-amber-300">
                Crafting Table Engine analyzing document optical structure & language...
              </p>
              <div className="exp-bar-bg w-48">
                <div className="exp-bar-fill animate-pulse w-3/4" />
              </div>
            </div>
          ) : craftedOutput ? (
            <div className="space-y-3 text-xs font-mono overflow-y-auto max-h-[420px] pr-1">
              {/* Theme Metaphor Status Banner */}
              <div className="flex items-center justify-between gap-2 bg-[#120e0b] p-2 border-2 border-black">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${
                      craftedOutput.document_metadata.theme_status === "DIRECT_HIT"
                        ? "bg-[#5B8731] text-white"
                        : craftedOutput.document_metadata.theme_status === "NEEDS_REDSTONE_REPAIR"
                        ? "bg-amber-600 text-white"
                        : "bg-[#FF5500] text-white"
                    }`}
                  >
                    🎯 {craftedOutput.document_metadata.theme_status}
                  </span>
                  <span className="text-gray-300 text-[10px] font-bold">
                    Score: {Math.round(craftedOutput.document_metadata.confidence_score * 100)}%
                  </span>
                </div>
                <span className="text-amber-300 font-bold text-[10px] uppercase">
                  {craftedOutput.document_metadata.detected_language}
                </span>
              </div>

              {/* Main Summary Card */}
              <div className="bg-[#182215] border-2 border-emerald-600 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-1">
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">
                      Category: {craftedOutput.document_metadata.detected_type}
                    </div>
                    <div className="font-black text-white text-sm">
                      {craftedOutput.extracted_data.student_name.english}
                    </div>
                    {craftedOutput.extracted_data.student_name.raw !== craftedOutput.extracted_data.student_name.english && (
                      <div className="text-[10px] text-amber-300">
                        Original: {craftedOutput.extracted_data.student_name.raw}
                      </div>
                    )}
                  </div>
                  <span className="bg-emerald-900 text-emerald-200 text-[10px] px-2 py-0.5 border border-black font-bold">
                    {craftedOutput.extracted_data.student_id || "ID-DETECTED"}
                  </span>
                </div>

                {/* Key Attributes Grid */}
                <div className="grid grid-cols-1 gap-1 text-[11px]">
                  {Object.entries(craftedOutput.extracted_data.key_attributes || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-emerald-900/40 py-0.5">
                      <span className="text-neutral-400 font-bold capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="text-amber-200 font-bold">{String(val)}</span>
                    </div>
                  ))}
                </div>

                {/* Redstone Announcer Voice Review Button */}
                <div className="pt-2 border-t border-emerald-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                      Redstone Voice Announcer
                    </span>
                    <button
                      onClick={handlePlayVoiceScript}
                      className={`px-2 py-1 text-[10px] font-black uppercase border border-black flex items-center gap-1 ${
                        isPlayingSpeech ? "bg-red-600 text-white animate-pulse" : "bg-[#FF5500] text-white hover:bg-orange-600"
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isPlayingSpeech ? "SPEAKING..." : "PLAY TTS SCRIPT"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-200 italic bg-black/50 p-2 border border-emerald-900">
                    "{craftedOutput.voice_confirmation_script}"
                  </p>
                </div>

                {/* Flagged Fields & Database Readiness */}
                {craftedOutput.review_and_validation.flagged_fields.length > 0 && (
                  <div className="bg-red-950/80 border border-red-600 p-2 text-[10px] space-y-1">
                    <div className="text-red-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Flagged TNT Bottlenecks ({craftedOutput.review_and_validation.flagged_fields.length})
                    </div>
                    {craftedOutput.review_and_validation.flagged_fields.map((flag, i) => (
                      <div key={i} className="text-red-200">
                        • <strong className="uppercase">{flag.field_name}:</strong> {flag.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw JSON Inspector */}
              <div className="bg-black border border-neutral-800 p-2 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-40">
                <pre>{JSON.stringify(craftedOutput, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-400 font-mono text-xs">
              <span className="text-3xl mb-2">📥</span>
              <p>No document crafted yet. Select a sample or upload paperwork and press "CRAFT RECORD".</p>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-3 text-[10px] font-mono text-neutral-400 bg-black/40 p-2 border border-neutral-800">
            Records automatically sync into Riverpod state and resolve paperwork bottlenecks!
          </div>
        </div>
      </div>
    </div>
  );
};
