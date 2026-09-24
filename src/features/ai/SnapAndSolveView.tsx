import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useFocusStore } from '../../store/useFocusStore';
import { aiProvider } from './services/aiProvider';
import { buildAIContext } from './services/aiContextService';
import { SnapSolveAnalysisResult } from '../../types/ai';
import { StructuredSolutionCard } from './components/StructuredSolutionCard';
import { DEMO_SNAP_SOLVE_RESULT } from './services/demoAIService';

export const SnapAndSolveView: React.FC = () => {
  const { setCurrentView, openQuickFocus } = useFocusStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [result, setResult] = useState<SnapSolveAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compress and resize image client-side to ensure instant uploads
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    setError(null);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedDataUrl);
          setResult(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSolve = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep(1);

    // Staged progress ticker
    const timer1 = setTimeout(() => setAnalysisStep(2), 700);
    const timer2 = setTimeout(() => setAnalysisStep(3), 1600);

    try {
      const context = buildAIContext({ includeSyllabus: true, includeExams: true });
      const analysisResult = await aiProvider.snapSolve({
        imageBase64: selectedImage,
        mimeType: imageMime,
        userPrompt: userPrompt.trim() || undefined,
        context,
      });

      setResult(analysisResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze question. Falling back to demo preview.');
      setResult(DEMO_SNAP_SOLVE_RESULT);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const loadSampleQuestion = () => {
    // Generate a clean synthetic diagram canvas for the Optics problem
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 300);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(40, 150);
      ctx.lineTo(560, 150);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(280, 150, 70, -0.6, 0.6);
      ctx.arc(320, 150, 70, Math.PI - 0.6, Math.PI + 0.6);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Sample Question: Physics Ray Optics', 40, 50);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('A convex lens (f1 = 20cm) touches a concave lens (f2 = -30cm).', 40, 85);
      ctx.fillText('Calculate total power (P) and equivalent focal length (F).', 40, 110);

      const sampleData = canvas.toDataURL('image/jpeg');
      setSelectedImage(sampleData);
      setUserPrompt('Solve step by step and explain the sign convention.');
      setResult(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('focus-ai')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to FOCUS AI
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" /> In-Memory Privacy (Zero Permanent Storage)
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/30 p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Multimodal Optical Solver
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Snap & Solve
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Take a photo. Understand the question. Learn the step-by-step solution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSampleQuestion}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Try Physics Sample
            </button>
          </div>
        </div>
      </div>

      {/* Main Upload / Camera Area */}
      {!selectedImage && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-500/50 bg-[#0c0d16]/70 backdrop-blur-xl p-8 sm:p-12 text-center transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
          />

          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              Upload or Snap a Question Photo
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Drag and drop a photo from your textbook, assignment sheet, or whiteboard.
              Supports complex diagrams, handwriting, and math equations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02]"
              >
                <Camera className="w-4 h-4" />
                Take Photo With Camera
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Browse Image Files
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-4 text-xs text-slate-500">
              <span>Supports JPG, PNG, WebP</span>
              <span>•</span>
              <span>Automatic Contrast Enhancing</span>
              <span>•</span>
              <span>LaTeX Equation Extraction</span>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview & Controls */}
      {selectedImage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image and User Note */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-xl">
              <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Question Image
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative bg-black/60 flex items-center justify-center min-h-[220px] max-h-[380px] overflow-hidden p-2">
                <img
                  src={selectedImage}
                  alt="Question preview"
                  className="max-h-[340px] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="p-4 bg-slate-950/60 border-t border-white/5 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">
                    Optional Hint / Specific Focus Area:
                  </label>
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="e.g. Focus on part (b) or explain using calculus..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleSolve}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Question...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      Solve Question Step-by-Step
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Analysis State or Structured Solution */}
          <div className="lg:col-span-7">
            {isAnalyzing && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">
                    {analysisStep === 1 && 'Reading Question & Math Expressions...'}
                    {analysisStep === 2 && 'Detecting Subject, Topic & Governing Laws...'}
                    {analysisStep >= 3 && 'Deriving Step-by-Step Proof & Pitfalls...'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extracting mathematical notation and building an exam-ready solution breakdown.
                  </p>
                </div>

                {/* Visual Step Progress */}
                <div className="max-w-xs mx-auto space-y-2 text-left">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${analysisStep >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'}`}
                    ></span>
                    <span className={analysisStep >= 1 ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                      Optical character & formula detection
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${analysisStep >= 2 ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'}`}
                    ></span>
                    <span className={analysisStep >= 2 ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                      Syllabus alignment & boundary conditions
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${analysisStep >= 3 ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'}`}
                    ></span>
                    <span className={analysisStep >= 3 ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                      Structured derivation and validation
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isAnalyzing && result && (
              <div className="space-y-4">
                <StructuredSolutionCard
                  solution={result.solution}
                  onExplainSimpler={() => {
                    setCurrentView('focus-ai');
                  }}
                  onSimilarQuestion={() => {
                    setCurrentView('focus-ai');
                  }}
                  onTestMe={() => {
                    setCurrentView('focus-ai');
                  }}
                />
              </div>
            )}

            {!isAnalyzing && !result && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center min-h-[300px]">
                <Sparkles className="w-8 h-8 text-cyan-400/50 mb-3" />
                <p className="font-semibold text-slate-300 mb-1">Image Ready for Processing</p>
                <p className="text-slate-400 max-w-sm">
                  Click <strong>Solve Question Step-by-Step</strong> to extract the problem, identify constants, and view full mathematical derivations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
