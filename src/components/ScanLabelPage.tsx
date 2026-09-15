import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  FileImage,
  Sparkles,
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
  X,
  Plus,
  Layers,
  Check,
  Scan,
  Cpu,
  FileCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_LABELS, SampleLabelOption } from '../data/sampleLabels';
import { ProductScan } from '../types';

interface ScanLabelPageProps {
  onScanComplete: (result: ProductScan) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

interface UploadedPhoto {
  id: string;
  dataUrl: string;
  name: string;
}

interface ErrorBannerInfo {
  title: string;
  message: string;
  hint?: string;
  type: 'unsupported_file' | 'api_failure' | 'validation';
}

export const ScanLabelPage: React.FC<ScanLabelPageProps> = ({
  onScanComplete,
  isScanning,
  setIsScanning,
}) => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [productHint, setProductHint] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [scanStageText, setScanStageText] = useState<string>('');
  const [errorInfo, setErrorInfo] = useState<ErrorBannerInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Verification steps shown during analysis
  const VERIFICATION_STEPS = [
    {
      title: 'Optical Character Recognition (OCR)',
      desc: 'Extracting text declarations from packaging panels',
    },
    {
      title: 'Rule 6(1)(e) MRP & Tax Mandate',
      desc: 'Checking Maximum Retail Price & "(incl. of all taxes)"',
    },
    {
      title: 'Rule 6(1)(c) Net Quantity & SI Units',
      desc: 'Verifying metric units (g, kg, ml, l) and unit sale price',
    },
    {
      title: 'Rule 6(1)(n) Consumer Care Details',
      desc: 'Validating mandatory helpline, email ID & postal address',
    },
    {
      title: 'Statutory Metrology Verdict Synthesis',
      desc: 'Generating section 36 penalty evaluation & audit report',
    },
  ];

  // Increment step animation while scanning
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      setScanStepIndex(0);
      const interval = setInterval(() => {
        setScanStepIndex((prev) => {
          if (prev < VERIFICATION_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 900);
      return () => clearInterval(interval);
    } else {
      setScanStepIndex(0);
    }
  }, [isScanning]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
    e.target.value = '';
  };

  const processFiles = (filesToAdd: File[]) => {
    setErrorInfo(null);

    // Validate unsupported file formats
    const unsupportedFiles = filesToAdd.filter(
      (f) => !f.type.startsWith('image/')
    );
    if (unsupportedFiles.length > 0) {
      setErrorInfo({
        type: 'unsupported_file',
        title: 'Unsupported File Format',
        message: `The file "${unsupportedFiles[0].name}" is not a recognized image. Only JPG, PNG, and WEBP packaging photos are supported for optical inspection.`,
        hint: 'Please upload a photo taken on your phone or an image file (.jpg, .jpeg, .png, or .webp).',
      });
      return;
    }

    // Validate maximum file size (15MB)
    const oversizedFiles = filesToAdd.filter((f) => f.size > 15 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrorInfo({
        type: 'unsupported_file',
        title: 'File Size Exceeds Limit',
        message: `"${oversizedFiles[0].name}" is larger than the 15MB limit.`,
        hint: 'Please upload a compressed or standard resolution photo.',
      });
      return;
    }

    const validImageFiles = filesToAdd.filter((f) => f.type.startsWith('image/'));

    if (photos.length + validImageFiles.length > 5) {
      setErrorInfo({
        type: 'validation',
        title: 'Photo Upload Limit',
        message: `You can upload up to 5 photos per product. (${5 - photos.length} photo slot(s) remaining).`,
        hint: 'Extra photos were omitted. You can remove photos by clicking the X on any thumbnail.',
      });
    }

    const availableSlots = Math.max(0, 5 - photos.length);
    const filesToProcess = validImageFiles.slice(0, availableSlots);

    if (filesToProcess.length === 0) {
      return;
    }

    setActiveSampleId(null);

    let loadedCount = 0;
    const newPhotos: UploadedPhoto[] = [];

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          dataUrl: base64,
          name: file.name,
        });
        loadedCount += 1;
        if (loadedCount === filesToProcess.length) {
          setPhotos((prev) => {
            const updated = [...prev, ...newPhotos].slice(0, 5);
            return updated;
          });
        }
      };
      reader.onerror = () => {
        setErrorInfo({
          type: 'validation',
          title: 'Image Read Error',
          message: 'Failed to read image file from device storage.',
          hint: 'Please re-select the image or capture a fresh photo.',
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activePhotoIndex >= updated.length) {
        setActivePhotoIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
    setActiveSampleId(null);
  };

  const handleClearAllPhotos = () => {
    setPhotos([]);
    setActivePhotoIndex(0);
    setActiveSampleId(null);
    setErrorInfo(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const selectSample = (sample: SampleLabelOption) => {
    setActiveSampleId(sample.id);
    setPhotos([
      {
        id: `sample-${sample.id}`,
        dataUrl: sample.thumbnailUrl,
        name: sample.name,
      },
    ]);
    setActivePhotoIndex(0);
    setProductHint(sample.name);
    setErrorInfo(null);
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      setErrorInfo({
        type: 'validation',
        title: 'No Packaging Photo Uploaded',
        message: 'Please upload or capture at least 1 photo of the product label before running compliance verification.',
        hint: 'Click "Browse Photos", "Use Camera", or select one of the instant sample products on the right.',
      });
      return;
    }

    setIsScanning(true);
    setErrorInfo(null);
    setScanStageText(
      photos.length > 1
        ? `Cross-referencing ${photos.length} package photos against Legal Metrology Rules 2011...`
        : 'Analyzing packaging text & scanning statutory declarations...'
    );

    try {
      // Instant inspection for built-in sample products
      if (activeSampleId) {
        const matched = SAMPLE_LABELS.find((s) => s.id === activeSampleId);
        if (matched) {
          await new Promise((r) => setTimeout(r, 1400));
          const result: ProductScan = {
            ...matched.defaultResult,
            id: `scan-${Date.now()}`,
            timestamp: new Date().toISOString(),
            imageUrl: photos[0].dataUrl,
            images: photos.map((p) => p.dataUrl),
          };
          onScanComplete(result);
          setIsScanning(false);
          return;
        }
      }

      // Real server API call with Gemini
      const response = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: photos.map((p) => p.dataUrl),
          imageBase64: photos[0].dataUrl,
          productNameHint: productHint,
        }),
      });

      if (!response.ok) {
        let errDetail = `Server returned HTTP status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errDetail = errData.error;
        } catch {
          // fallback
        }
        throw new Error(errDetail);
      }

      const data = await response.json();
      if (data.scan) {
        const scanData: ProductScan = {
          ...data.scan,
          imageUrl: photos[0].dataUrl,
          images: photos.map((p) => p.dataUrl),
        };
        onScanComplete(scanData);
      } else {
        throw new Error('The analysis service could not extract statutory fields from the provided packaging image.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorInfo({
        type: 'api_failure',
        title: 'API Verification Failure',
        message: err.message || 'Unable to connect to the Legal Metrology analysis service. The server or AI verification model encountered an unexpected error.',
        hint: 'Ensure your network connection is active. You can retry clicking "Verify Label" or select an instant sample from the right column.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const currentPreviewPhoto = photos[activePhotoIndex] || photos[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Page Title & Statutory Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4 sm:p-5">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-[#1e3a8a] text-white rounded-md flex-shrink-0 mt-0.5 shadow-2xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a8a]">
              Scan Product Label for Legal Metrology Compliance
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              Verify pre-packaged retail commodities against <strong>Rule 6</strong> of the{' '}
              <em>Indian Legal Metrology (Packaged Commodities) Rules, 2011</em>. Detect missing MRP,
              omitted tax inclusive clauses, missing consumer care email, non-metric net quantity, and invalid declarations.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Red Error Banner for API Failures & Unsupported Files */}
      {errorInfo && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-4 sm:p-5 text-rose-900 shadow-sm flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-3 sm:space-x-3.5">
            <div className="p-2 bg-rose-100 border border-rose-200 rounded-full text-rose-700 flex-shrink-0 mt-0.5">
              <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded uppercase tracking-wider text-[10px]">
                  {errorInfo.type === 'unsupported_file'
                    ? 'File Error'
                    : errorInfo.type === 'api_failure'
                    ? 'API Error'
                    : 'Notice'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-rose-950">
                  {errorInfo.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                {errorInfo.message}
              </p>
              {errorInfo.hint && (
                <p className="text-xs text-rose-800 pt-1 font-medium flex items-center space-x-1">
                  <span className="font-bold">Recommended action:</span>
                  <span>{errorInfo.hint}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setErrorInfo(null)}
            className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-100 rounded-md cursor-pointer transition-colors flex-shrink-0"
            title="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Upload Box, Thumbnails & Image Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-xs">
            {/* Header with Title, Count & Clear button */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Product Label Photos
                </h2>
                {photos.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-[#1e3a8a] rounded-full">
                    {photos.length} / 5 photos
                  </span>
                )}
              </div>
              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllPhotos}
                  disabled={isScanning}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Hint text: Upload front and back of the package */}
            <div className="mb-4 flex items-center space-x-2 text-xs text-blue-900 bg-blue-50/70 border border-blue-200/80 px-3 py-2 rounded-md">
              <Layers className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
              <span>
                <strong>Tip:</strong> Upload front and back of the package for a complete check (minimum 1, maximum 5 photos).
              </span>
            </div>

            {/* Hidden File and Camera Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* If no photos uploaded yet: Show initial prominent drop zone */}
            {photos.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
                  isDragOver
                    ? 'border-[#1e3a8a] bg-blue-50/70'
                    : 'border-slate-300 hover:border-blue-700 bg-slate-50/50 hover:bg-blue-50/30'
                }`}
              >
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-[#1e3a8a] rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Upload Product Packaging Photos
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                  Upload front, back, and side panels displaying the MRP, net quantity, manufacturer, and consumer care details.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded font-medium text-xs sm:text-sm cursor-pointer shadow-xs flex items-center space-x-1.5 min-h-[44px]"
                  >
                    <FileImage className="w-4 h-4" />
                    <span>Browse Photos (1 to 5)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium text-xs sm:text-sm cursor-pointer shadow-2xs flex items-center space-x-1.5 min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>Use Camera</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  Supports JPG, PNG, WEBP • Max 15MB per photo
                </p>
              </div>
            ) : (
              /* When photos are uploaded: Show Row of Thumbnails + Active Preview + Add More */
              <div className="space-y-4">
                {/* Thumbnails Row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Uploaded Package Views
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tap thumbnail to preview
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {photos.map((photo, index) => {
                      const isSelected = index === activePhotoIndex;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => setActivePhotoIndex(index)}
                          className={`relative group rounded-md p-1 cursor-pointer transition-all border ${
                            isSelected
                              ? 'border-[#1e3a8a] bg-blue-50 ring-2 ring-blue-600/30 shadow-xs'
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          {/* Thumbnail Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden bg-slate-900/5 flex items-center justify-center">
                            <img
                              src={photo.dataUrl}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Photo Label (Photo 1, Photo 2...) */}
                          <div className="mt-1 text-center">
                            <span
                              className={`text-[10px] sm:text-[11px] font-bold block px-1 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#1e3a8a] text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Photo {index + 1}
                            </span>
                          </div>

                          {/* Small remove (X) button */}
                          {!isScanning && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(index);
                              }}
                              title={`Remove Photo ${index + 1}`}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 z-10"
                            >
                              <X className="w-3 h-3 stroke-[3]" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add More Photos Button (if < 5) */}
                    {photos.length < 5 && !isScanning && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-md bg-white hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-600 hover:text-[#1e3a8a] transition-all cursor-pointer shadow-2xs"
                        title="Add another photo (up to 5)"
                      >
                        <Plus className="w-5 h-5 mb-0.5" />
                        <span className="text-[10px] font-bold text-center leading-tight">
                          + Add Side
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Photo Large Preview Box with Scanning Overlay Animation */}
                <div className="space-y-2">
                  <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-900/5 flex items-center justify-center min-h-[260px] sm:min-h-[340px] max-h-[440px]">
                    {currentPreviewPhoto && (
                      <img
                        src={currentPreviewPhoto.dataUrl}
                        alt={`Photo ${activePhotoIndex + 1}`}
                        className="max-h-[420px] max-w-full object-contain mx-auto transition-all"
                      />
                    )}

                    {/* Floating Photo Label */}
                    <div className="absolute top-2 left-2 bg-slate-900/85 text-white px-2.5 py-1 rounded text-xs backdrop-blur-xs font-mono flex items-center space-x-1.5 z-10">
                      <span className="font-bold text-amber-300">Photo {activePhotoIndex + 1} of {photos.length}</span>
                    </div>

                    {/* LOADING ANIMATION OVERLAY (When Image is being analyzed) */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-blue-950/50 backdrop-blur-[2px] flex flex-col items-center justify-between p-6 text-center z-20 overflow-hidden">
                        {/* High-tech HUD Corner Brackets */}
                        <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-cyan-400"></div>
                        <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-cyan-400"></div>
                        <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-cyan-400"></div>
                        <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-cyan-400"></div>

                        {/* Animated Laser Scan Beam moving up and down */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_#22d3ee] animate-scanbeam pointer-events-none"></div>

                        {/* Top HUD Badge */}
                        <div className="pt-2">
                          <span className="px-3 py-1 bg-blue-900/90 text-cyan-300 border border-cyan-400/60 rounded-full text-xs font-mono font-bold tracking-wider shadow-lg flex items-center space-x-1.5 animate-pulse">
                            <Scan className="w-3.5 h-3.5 text-cyan-400" />
                            <span>PCR 2011 STATUTORY SCAN IN PROGRESS</span>
                          </span>
                        </div>

                        {/* Center Radar Sweep & Animated Spinner */}
                        <div className="flex flex-col items-center justify-center space-y-3 my-auto">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping"></div>
                            <div className="w-14 h-14 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <Cpu className="w-6 h-6 text-cyan-300 absolute" />
                          </div>
                          <div className="text-white space-y-1">
                            <div className="text-sm sm:text-base font-bold text-cyan-200">
                              {VERIFICATION_STEPS[scanStepIndex]?.title}
                            </div>
                            <p className="text-xs text-blue-200 max-w-xs mx-auto">
                              {VERIFICATION_STEPS[scanStepIndex]?.desc}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Shimmer Bar */}
                        <div className="w-full max-w-xs space-y-1.5 pb-2">
                          <div className="flex justify-between text-[11px] font-mono text-cyan-300">
                            <span>Step {scanStepIndex + 1} of {VERIFICATION_STEPS.length}</span>
                            <span>{Math.round(((scanStepIndex + 1) / VERIFICATION_STEPS.length) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden border border-cyan-500/40">
                            <div
                              className="h-full bg-cyan-400 transition-all duration-500"
                              style={{ width: `${((scanStepIndex + 1) / VERIFICATION_STEPS.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Product Name / Commodity Hint */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product / Commodity Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={productHint}
                    onChange={(e) => setProductHint(e.target.value)}
                    disabled={isScanning}
                    placeholder="e.g. Pure Desi Cow Ghee, Crispy Corn Nachos"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white disabled:bg-slate-100"
                  />
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isScanning}
                  className={`w-full py-3.5 px-6 rounded-md font-bold text-white shadow-sm flex items-center justify-center space-x-2 transition-all min-h-[48px] ${
                    isScanning
                      ? 'bg-blue-800 cursor-wait'
                      : 'bg-[#1e3a8a] hover:bg-blue-900 active:scale-[0.99] cursor-pointer'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{scanStageText || 'Analyzing Label...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span className="text-base">
                        Verify {photos.length > 1 ? `${photos.length} Photos` : 'Label'} (PCR 2011)
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instant Testing Sample Labels & Statutory Checklist Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Sample Labels for Instant 1-Click Verification */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Try Sample Product Labels
              </h2>
              <span className="text-[11px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                1-Click Test
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Don't have a packaged product nearby? Select a sample to test compliant vs non-compliant labels instantly:
            </p>

            <div className="space-y-2.5">
              {SAMPLE_LABELS.map((sample) => {
                const isSelected = activeSampleId === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => !isScanning && selectSample(sample)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isScanning
                        ? 'opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#1e3a8a] bg-blue-50/70 ring-2 ring-blue-600/30 cursor-pointer'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-14 bg-white border border-slate-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={sample.thumbnailUrl}
                          alt={sample.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {sample.name}
                          </h3>
                          {sample.expectedCompliant ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex-shrink-0">
                              <ShieldAlert className="w-2.5 h-2.5 mr-0.5 text-rose-600" />
                              Violation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Mandates Checked */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 text-xs text-slate-600">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-[#1e3a8a]" />
              <span>Mandatory Declarations Verified Under Rule 6:</span>
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>
                <strong>Rule 6(1)(a):</strong> Manufacturer / Packer name & complete postal address.
              </li>
              <li>
                <strong>Rule 6(1)(b):</strong> Generic or common name of the commodity.
              </li>
              <li>
                <strong>Rule 6(1)(c):</strong> Net quantity in metric units (g, kg, ml, l).
              </li>
              <li>
                <strong>Rule 6(1)(d):</strong> Month & year of manufacture / packing / import.
              </li>
              <li>
                <strong>Rule 6(1)(e):</strong> Maximum Retail Price (MRP) with "(incl. of all taxes)".
              </li>
              <li>
                <strong>Rule 6(1)(e) Amdt:</strong> Unit Sale Price (USP) per unit or gram/ml.
              </li>
              <li>
                <strong>Rule 6(1)(n):</strong> Consumer care contact (Name, address, phone & email).
              </li>
              <li>
                <strong>Rule 6(10):</strong> Mandatory Country of Origin declaration.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
