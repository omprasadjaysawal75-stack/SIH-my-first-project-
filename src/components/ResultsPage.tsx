import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Printer,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Tag,
  Package,
  ExternalLink,
  Info,
  MapPin,
  FileText,
  Scan,
  Sparkles,
  Camera,
  Download,
  FileSpreadsheet,
  Loader2,
  Send,
  Building2,
  AlertOctagon,
  Check,
  ShoppingBag,
  Clock,
  Shield,
  PhoneCall,
} from 'lucide-react';
import { ProductScan, ComplianceItem, ExtractedDeclarationItem, User } from '../types';
import { generateCompliancePdf, generateComplianceCsv } from '../utils/reportGenerator';

interface ResultsPageProps {
  scan: ProductScan | null;
  onScanAnother: () => void;
  onViewHistory: () => void;
  currentUser?: User;
  onReportGrievance?: (
    scanId: string,
    storeName: string,
    location: string,
    city?: string,
    notes?: string
  ) => void;
  onUpdateGrievanceStatus?: (
    scanId: string,
    status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'NOTICE_ISSUED' | 'DISMISSED',
    notes?: string
  ) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  scan,
  onScanAnother,
  onViewHistory,
  currentUser,
  onReportGrievance,
  onUpdateGrievanceStatus,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Grievance filing state for citizens
  const [showGrievanceForm, setShowGrievanceForm] = useState<boolean>(false);
  const [storeName, setStoreName] = useState<string>('');
  const [storeLocation, setStoreLocation] = useState<string>('');
  const [storeCity, setStoreCity] = useState<string>('');
  const [issueCategory, setIssueCategory] = useState<string>('OVERCHARGING_MRP');
  const [grievanceNotes, setGrievanceNotes] = useState<string>('');
  const [reportedSuccessNotice, setReportedSuccessNotice] = useState<string | null>(null);

  // Official review notes
  const [officerRemarks, setOfficerRemarks] = useState<string>('');

  const isCitizen = currentUser?.role === 'citizen';
  const isOfficial = currentUser?.role === 'inspector' || currentUser?.role === 'admin';

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan || !storeName.trim()) return;

    const fullNotes = `[Category: ${issueCategory}] ${grievanceNotes.trim()}`;
    onReportGrievance?.(
      scan.id,
      storeName.trim(),
      storeLocation.trim() || 'Local Retail Shop',
      storeCity.trim() || 'New Delhi',
      fullNotes
    );

    setShowGrievanceForm(false);
    setReportedSuccessNotice('Statutory complaint registered with Department of Consumer Affairs! Reference token generated.');
    setTimeout(() => setReportedSuccessNotice(null), 8000);
  };

  const handleOfficerStatusUpdate = (
    status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'NOTICE_ISSUED' | 'DISMISSED'
  ) => {
    if (!scan) return;
    onUpdateGrievanceStatus?.(scan.id, status, officerRemarks.trim() || undefined);
    setOfficerRemarks('');
  };

  const handleDownloadPdf = async () => {
    if (!scan || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateCompliancePdf(scan);
    } catch (err) {
      console.error('Failed to generate PDF compliance report:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!scan) return;
    generateComplianceCsv(scan);
  };

  if (!scan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Scan Results Available</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          Upload or select a packaged product label to view statutory compliance evaluation.
        </p>
        <button
          onClick={onScanAnother}
          className="px-6 py-2.5 bg-[#1e3a8a] text-white font-semibold rounded-md shadow-xs hover:bg-blue-900 cursor-pointer"
        >
          Go to Scan Page
        </button>
      </div>
    );
  }

  const passCount = scan.items.filter((item) => (item.verdict ? item.verdict === 'PASS' : item.isCompliant)).length;
  const warnCount = scan.items.filter((item) => (item.verdict ? item.verdict === 'WARNING' : item.status === 'warning')).length;
  const failCount = scan.items.filter((item) => (item.verdict ? item.verdict === 'FAIL' : (!item.isCompliant && item.status !== 'warning'))).length;
  const overallVerdict = scan.complianceVerdict || (scan.overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT');
  const isCompliant = overallVerdict === 'COMPLIANT';

  // Extract structured violation cards
  const violationCards = (scan.violationDetails && scan.violationDetails.length > 0)
    ? scan.violationDetails
    : (scan.violations || []).map((v) => {
        if (typeof v === 'object' && v !== null && 'violation' in v) {
          return v;
        }
        const str = String(v);
        const match = str.match(/\[(.*?)\]\s*(.*?)(?:—\s*Suggestion:\s*(.*))?$/i);
        if (match) {
          return {
            ruleCode: match[1],
            violation: match[2].trim(),
            suggestion: match[3]?.trim() || 'Ensure label printing adheres to Legal Metrology provisions.',
            severity: 'high' as const
          };
        }
        return {
          ruleCode: 'PCR 2011',
          violation: str,
          suggestion: 'Ensure label strictly adheres to Legal Metrology (Packaged Commodities) Rules 2011.',
          severity: 'high' as const
        };
      });

  const formattedDate = new Date(scan.timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span>LEGAL METROLOGY INSPECTION REPORT</span>
            <span>•</span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-700">ID: {scan.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {scan.productName}
          </h1>
          {scan.brand && (
            <p className="text-xs text-slate-600 font-medium">Brand: {scan.brand}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onScanAnother}
            className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 active:bg-blue-950 text-white rounded text-xs sm:text-sm font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs min-h-[40px] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors min-h-[40px]"
            title="Download full statutory PDF audit report with all uploaded photos"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Download Report</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors min-h-[40px]"
            title="Download statutory compliance data as spreadsheet (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>CSV Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs sm:text-sm font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs min-h-[40px]"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Compliance Verdict Banner with Overall Verdict & Compliance Score out of 100 */}
      <div
        className={`p-5 rounded-lg border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isCompliant
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-full flex-shrink-0 ${
              isCompliant
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {isCompliant ? (
              <ShieldCheck className="w-9 h-9" />
            ) : (
              <ShieldAlert className="w-9 h-9" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded border shadow-2xs ${
                  isCompliant
                    ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                    : 'bg-rose-200 text-rose-900 border-rose-400'
                }`}
              >
                OVERALL VERDICT: {overallVerdict}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Legal Metrology (Packaged Commodities) Rules 2011
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-1.5 text-slate-900">
              {isCompliant
                ? 'COMPLIANT: All Statutory Declarations Satisfied'
                : 'NON-COMPLIANT: Statutory Violations Detected on Packaging'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
              {scan.summaryVerdict}
            </p>
          </div>
        </div>

        {/* Score Card: Score out of 100 */}
        <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs min-w-[150px]">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#1e3a8a]">
              {scan.complianceScore}
              <span className="text-base font-bold text-slate-500 ml-0.5">/100</span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Compliance Score
            </div>
          </div>
          <div className="text-right md:text-center text-xs font-bold text-slate-600 mt-1.5 md:mt-2.5 flex items-center gap-1.5 justify-center">
            <span className="text-emerald-700">{passCount} PASS</span>
            <span>•</span>
            <span className="text-amber-700">{warnCount} WARN</span>
            <span>•</span>
            <span className="text-rose-700">{failCount} FAIL</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner for Citizen Grievance */}
      {reportedSuccessNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-lg flex items-start space-x-3 text-emerald-950 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block text-emerald-900">
              Statutory Grievance Registered Successfully!
            </span>
            <p className="mt-0.5 text-emerald-800">
              {reportedSuccessNotice} Your report has been dispatched to the District Legal Metrology Inspector's surveillance queue for physical audit and Section 36 penalty proceedings.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CITIZEN CONSUMER RIGHTS & FAIR TRADE SUMMARY (Jago Grahak Jago)       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Consumer Rights & Fair Trade Check</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  जागो ग्राहक जागो
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Key consumer safeguards under the Legal Metrology (Packaged Commodities) Rules, 2011
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            National Consumer Helpline: <strong>1915</strong>
          </span>
        </div>

        {/* 4 Core Consumer Protection Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Price Protection */}
          {(() => {
            const mrpItem = scan.items.find(
              (i) =>
                i.ruleCode.includes('6(1)(e)') ||
                i.title.toLowerCase().includes('price') ||
                i.title.toLowerCase().includes('mrp')
            );
            const ok = mrpItem?.verdict === 'PASS';
            return (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  ok
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-blue-700" />
                    <span>Price Protection</span>
                  </span>
                  {ok ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-black">
                      PASSED
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded font-black">
                      VIOLATION
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                  {mrpItem?.extractedValue || 'MRP not found'}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {ok
                    ? 'Retail price printed with mandatory "(incl. of all taxes)". No shopkeeper may charge above this.'
                    : 'MRP clause missing or non-compliant. Overcharging above printed price is illegal under Sec 36.'}
                </p>
              </div>
            );
          })()}

          {/* Net Quantity Accuracy */}
          {(() => {
            const netQtyItem = scan.items.find(
              (i) =>
                i.ruleCode.includes('6(1)(c)') ||
                i.title.toLowerCase().includes('quantity') ||
                i.title.toLowerCase().includes('weight')
            );
            const ok = netQtyItem?.verdict === 'PASS';
            return (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  ok
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1">
                    <Package className="w-3.5 h-3.5 text-blue-700" />
                    <span>Fair Metric Measure</span>
                  </span>
                  {ok ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-black">
                      PASSED
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded font-black">
                      VIOLATION
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                  {netQtyItem?.extractedValue || 'Net quantity not found'}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {ok
                    ? 'Declared in standard statutory metric SI units (g/kg/ml/l) with legal numeral dimensions.'
                    : 'Net weight or volume not clearly printed or uses unauthorized non-standard units.'}
                </p>
              </div>
            );
          })()}

          {/* Consumer Grievance Contact */}
          {(() => {
            const careItem = scan.items.find(
              (i) =>
                i.ruleCode.includes('6(1)(n)') ||
                i.title.toLowerCase().includes('consumer') ||
                i.title.toLowerCase().includes('care')
            );
            const ok = careItem?.verdict === 'PASS';
            return (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  ok
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1">
                    <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                    <span>Consumer Care Contact</span>
                  </span>
                  {ok ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-black">
                      AVAILABLE
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded font-black">
                      MISSING / FAKE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                  {careItem?.extractedValue || 'No contact found'}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {ok
                    ? 'Manufacturer helpline or email verified for customer complaints, defects, and refunds.'
                    : 'Consumer helpline or email is absent or blurred. You cannot easily reach the packer.'}
                </p>
              </div>
            );
          })()}

          {/* Manufacturer Traceability */}
          {(() => {
            const mfgItem = scan.items.find(
              (i) =>
                i.ruleCode.includes('6(1)(a)') ||
                i.ruleCode.includes('6(1)(b)') ||
                i.title.toLowerCase().includes('manufacturer') ||
                i.title.toLowerCase().includes('packer')
            );
            const ok = mfgItem?.verdict === 'PASS';
            return (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  ok
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>Manufacturer Address</span>
                  </span>
                  {ok ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded font-black">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded font-black">
                      DEFECTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                  {mfgItem?.extractedValue || 'Producer not identified'}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {ok
                    ? 'Complete physical business address declared for product liability and legal accountability.'
                    : 'Incomplete or unidentifiable producer address, violating statutory registration requirements.'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CROWDSOURCED CITIZEN GRIEVANCE & ENFORCEMENT SECTION                   */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        {scan.citizenGrievance ? (
          /* Active Grievance Record Attached to this Scan */
          <div className="bg-white border-2 border-blue-400 rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-[#1e3a8a] text-white text-xs font-mono font-bold rounded">
                  {scan.citizenGrievance.complaintRef}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Crowdsourced Citizen Grievance
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                {scan.citizenGrievance.status === 'PENDING_REVIEW' && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Official Review</span>
                  </span>
                )}
                {scan.citizenGrievance.status === 'INVESTIGATING' && (
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Scan className="w-3.5 h-3.5 text-blue-600" />
                    <span>Under Active Field Investigation</span>
                  </span>
                )}
                {scan.citizenGrievance.status === 'NOTICE_ISSUED' && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Section 36 Statutory Notice Issued</span>
                  </span>
                )}
                {scan.citizenGrievance.status === 'DISMISSED' && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-bold">
                    Case Resolved / Closed
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">
                  Retailer / Point of Sale
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {scan.citizenGrievance.storeName}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">
                  Location & City
                </span>
                <span className="font-medium text-slate-800">
                  {scan.citizenGrievance.location}
                  {scan.citizenGrievance.city ? `, ${scan.citizenGrievance.city}` : ''}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase">
                  Date Filed
                </span>
                <span className="font-medium text-slate-800">
                  {new Date(scan.citizenGrievance.dateReported).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {scan.citizenGrievance.officerNotes && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-950">
                <strong className="block text-blue-900 mb-0.5">
                  Citizen / Investigation Remarks:
                </strong>
                <p className="text-slate-800">{scan.citizenGrievance.officerNotes}</p>
              </div>
            )}

            {/* Official Actions for Legal Metrology Inspectors & Admins */}
            {isOfficial && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-[#1e3a8a]" />
                    <span>Official Enforcement Actions (Legal Metrology Officer)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Authority: <strong>Section 36, LM Act 2009</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOfficerStatusUpdate('NOTICE_ISSUED')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1 shadow-xs min-h-[36px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Issue Section 36 Notice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOfficerStatusUpdate('INVESTIGATING')}
                    className="px-3 py-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1 shadow-xs min-h-[36px]"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Assign Field Inspection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOfficerStatusUpdate('DISMISSED')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors min-h-[36px]"
                  >
                    <span>Close / Resolve Case</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No grievance filed yet - Invitation for citizens to report */
          <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <span>Report Store or Retail Discrepancy (Crowdsourced Enforcement)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  Did the shopkeeper charge above the printed MRP? Is the product expired, or are mandatory declarations missing? File a direct complaint with the Department of Consumer Affairs (NCH 1915).
                </p>
              </div>

              {!showGrievanceForm && (
                <button
                  type="button"
                  onClick={() => setShowGrievanceForm(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap min-h-[44px] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>File Statutory Grievance</span>
                </button>
              )}
            </div>

            {/* Expandable Grievance Filing Form */}
            {showGrievanceForm && (
              <form onSubmit={handleSubmitGrievance} className="pt-3 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Retailer / Quick-Commerce Name *
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Ramesh Kirana, Blinkit Darkstore, Super Bazaar"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[40px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Violation Category *
                    </label>
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[40px] bg-white"
                    >
                      <option value="OVERCHARGING_MRP">Shopkeeper Charged Above Printed MRP (Dual MRP)</option>
                      <option value="MISSING_MRP">MRP / Taxes Clause Missing on Package</option>
                      <option value="EXPIRED_COMMODITY">Selling Past Expiry / Best Before Date</option>
                      <option value="SHORT_MEASURE">Suspected Short Measure / Net Weight Deficit</option>
                      <option value="MISSING_CONSUMER_CARE">No Customer Care Phone / Email Printed</option>
                      <option value="SMUDGED_ALTERED_DATE">Date of Packing Altered / Smudged</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Address / Landmark
                    </label>
                    <input
                      type="text"
                      value={storeLocation}
                      onChange={(e) => setStoreLocation(e.target.value)}
                      placeholder="e.g. Shop 12, Main Market, Indiranagar"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[40px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={storeCity}
                      onChange={(e) => setStoreCity(e.target.value)}
                      placeholder="e.g. Bengaluru, New Delhi, Mumbai"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details of Overcharging / Discrepancy
                  </label>
                  <textarea
                    rows={2}
                    value={grievanceNotes}
                    onChange={(e) => setGrievanceNotes(e.target.value)}
                    placeholder="e.g. MRP on packet is ₹45, but retailer insisted on charging ₹55 as cooling charge. Refused to provide receipt."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGrievanceForm(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer min-h-[40px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer min-h-[40px] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Legal Metrology Inspector</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Red Violations Section (Shown in RED with Rule Reference and Suggestions) */}
      {violationCards.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-2.5 text-rose-950">
              <div className="p-1.5 bg-rose-600 text-white rounded-md flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">
                  Statutory Violations Flagged ({violationCards.length})
                </h3>
                <p className="text-xs text-rose-800 font-medium">
                  Violations under Legal Metrology Act, 2009 & Packaged Commodities Rules 2011 with statutory rule codes and required remedies.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-200 text-rose-900 border border-rose-300 font-mono text-xs font-black uppercase rounded">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {violationCards.map((v, i) => (
              <div
                key={i}
                className="bg-white border-l-4 border-rose-600 border-y border-r border-rose-300 rounded-r-md p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-900 font-mono text-xs font-black rounded border border-rose-300">
                      {v.ruleCode}
                    </span>
                    {v.severity === 'critical' && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded">
                        Critical
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase">
                    Violation #{i + 1}
                  </span>
                </div>

                {/* What is wrong */}
                <div className="text-sm font-bold text-rose-950">
                  {v.violation}
                </div>

                {/* Actionable Suggestion */}
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-950 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">
                      Statutory Suggestion & Remedy:
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {v.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scan.recommendations && scan.recommendations.length > 0 && (
            <div className="p-3.5 bg-white rounded border border-rose-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">
                Summary of Corrective Actions Before Commercial Sale:
              </span>
              <ul className="space-y-1 list-disc list-inside">
                {scan.recommendations.map((r, i) => (
                  <li key={i} className="font-medium text-slate-800">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Image Quality Notice if Blurry or No Text */}
      {scan.imageQuality && (scan.imageQuality.isBlurry || scan.imageQuality.noTextFound) && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg flex items-start space-x-3 text-amber-950 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Image Legibility Notice</span>
            <p className="mt-0.5 font-medium leading-relaxed">
              {scan.imageQuality.isBlurry
                ? 'WARNING: The submitted photograph is blurry, out-of-focus, or has low lighting. Any declarations that cannot be confirmed with certainty are marked WARNING. '
                : ''}
              {scan.imageQuality.noTextFound
                ? 'No legible packaging text was detected on the image. '
                : ''}
              {scan.imageQuality.qualityNote && `Note: ${scan.imageQuality.qualityNote}`}
            </p>
          </div>
        </div>
      )}

      {/* Main Analysis Section: Image + Declaration Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Uploaded Label Photo Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs sticky top-24">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Inspected Product Label</span>
              <span className="text-[11px] font-normal text-slate-500">
                {scan.images && scan.images.length > 1
                  ? `${scan.images.length} Package Sides`
                  : 'Visual Evidence'}
              </span>
            </h3>

            {/* If multiple images are attached to this scan, show thumbnail selector */}
            {scan.images && scan.images.length > 1 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                {scan.images.map((img, idx) => {
                  const isSelected = idx === selectedPhotoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative rounded-md overflow-hidden p-0.5 border cursor-pointer transition-all flex-shrink-0 ${
                        isSelected
                          ? 'border-[#1e3a8a] ring-2 ring-blue-600/40'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Side ${idx + 1}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-bold text-center">
                        Photo {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center min-h-[260px] max-h-[380px] relative">
              {(() => {
                const activeImg =
                  scan.images && scan.images[selectedPhotoIndex]
                    ? scan.images[selectedPhotoIndex]
                    : scan.imageUrl;
                return activeImg ? (
                  <>
                    <img
                      src={activeImg}
                      alt={scan.productName}
                      className="max-h-[360px] w-auto object-contain mx-auto"
                    />
                    {scan.images && scan.images.length > 1 && (
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        Photo {selectedPhotoIndex + 1} of {scan.images.length}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="p-12 text-slate-400 text-center">
                    <Package className="w-12 h-12 mx-auto mb-2" />
                    <span className="text-xs">No image provided</span>
                  </div>
                );
              })()}
            </div>

            {/* Quick Product Metadata */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{scan.category || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statute:</span>
                <span className="font-semibold text-slate-800">PCR 2011 (Rule 6)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold ${
                    scan.overallCompliant ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {scan.overallCompliant ? 'Passed' : 'Action Required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Mandatory Statutory Declarations Checklist */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mandatory Statutory Declarations (8 Rules)
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluated under Legal Metrology (PC) Rules 2011 with PASS, WARNING, or FAIL verdicts.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="flex items-center text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {passCount} PASS
                </span>
                <span>•</span>
                <span className="flex items-center text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  {warnCount} WARN
                </span>
                <span>•</span>
                <span className="flex items-center text-rose-700">
                  <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  {failCount} FAIL
                </span>
              </div>
            </div>

            {/* Declarations List with PASS, WARNING, or FAIL */}
            <div className="space-y-3">
              {scan.items.map((item, index) => {
                const itemVerdict = item.verdict || (item.isCompliant ? 'PASS' : item.status === 'warning' ? 'WARNING' : 'FAIL');
                const isPass = itemVerdict === 'PASS';
                const isWarn = itemVerdict === 'WARNING';
                const isFail = itemVerdict === 'FAIL';

                return (
                  <div
                    key={item.id || index}
                    className={`p-3.5 sm:p-4 rounded-lg border transition-all ${
                      isPass
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isWarn
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-rose-50/60 border-rose-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        {/* Status Icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          {isPass && (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                          )}
                          {isWarn && (
                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                          )}
                          {isFail && (
                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                              <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {item.title}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-semibold border border-slate-200">
                              {item.ruleCode}
                            </span>
                            {item.mandatory && (
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                Mandatory
                              </span>
                            )}
                          </div>

                          {/* Extracted Value with Highlighting */}
                          <div className="mt-2 p-2.5 rounded bg-white border border-slate-200/80 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Extracted Value from Label:
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(() => {
                                  // Determine photo number
                                  let pNum = item.photoNumber;
                                  if (!pNum && item.position) {
                                    const match = item.position.match(/Photo\s*(\d+)/i);
                                    if (match) pNum = parseInt(match[1], 10);
                                  }
                                  if (pNum && scan.images && scan.images.length > 1) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPhotoIndex(pNum! - 1)}
                                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                          selectedPhotoIndex === pNum - 1
                                            ? 'bg-[#1e3a8a] text-white'
                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                        }`}
                                        title={`View Photo ${pNum} in preview`}
                                      >
                                        <Camera className="w-3 h-3 mr-1" />
                                        found in Photo {pNum}
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                                {item.position && (
                                  <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                    {item.position}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className={`font-semibold text-sm ${
                                isPass
                                  ? 'text-slate-900'
                                  : isWarn
                                  ? 'text-amber-950 font-bold'
                                  : 'text-rose-950 font-bold'
                              }`}
                            >
                              {item.extractedValue === 'NOT FOUND' || !item.extractedValue ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                                  NOT FOUND
                                </span>
                              ) : (
                                item.extractedValue
                              )}
                            </div>
                          </div>

                          {/* Legal Metrology Inspector Notes */}
                          <div className="mt-2 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Finding: </span>
                            {item.findingNotes}
                          </div>

                          {/* Actionable Suggestion if non-compliant or warning */}
                          {item.suggestion && (
                            <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 flex items-start space-x-1.5">
                              <Info className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-900">Suggestion: </span>
                                {item.suggestion}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prominent PASS / WARNING / FAIL Verdict Tag */}
                      <div className="flex-shrink-0">
                        {isPass && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            PASS
                          </span>
                        )}
                        {isWarn && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            WARNING
                          </span>
                        )}
                        {isFail && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                            FAIL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Extracted Statutory Details Table */}
          <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Scan className="w-4 h-4 text-[#1e3a8a]" />
                  <span>Statutory Declarations Extraction Table</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summary extraction of mandatory packaging declarations with physical locations and verdicts.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Statutory Declaration</th>
                    <th className="py-2.5 px-3">Extracted Value on Label</th>
                    <th className="py-2.5 px-3">Approx. Position on Package</th>
                    <th className="py-2.5 px-3 text-center">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((scan.extractedDeclarations && scan.extractedDeclarations.length > 0)
                    ? scan.extractedDeclarations
                    : [
                        {
                          declarationName: 'Product name',
                          value: scan.productName || 'NOT FOUND',
                          position: 'Photo 1 (Top / Front panel)',
                          photoNumber: 1,
                          status: scan.productName ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.productName && scan.productName !== 'NOT FOUND' ? ('PASS' as const) : ('FAIL' as const)
                        },
                        {
                          declarationName: 'Manufacturer / Packer / Importer name and address',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(a)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(a)'))?.position || 'Photo 2 (Bottom / Back panel)',
                          photoNumber: 2,
                          status: scan.items.find(i => i.ruleCode.includes('6(1)(a)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(a)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(1)(a)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                        {
                          declarationName: 'Common or generic name of the commodity',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(b)'))?.extractedValue || scan.productName || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(b)'))?.position || 'Photo 1 (Front display panel)',
                          photoNumber: 1,
                          status: 'FOUND' as const,
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(b)'))?.verdict || 'PASS'
                        },
                        {
                          declarationName: 'Net quantity (weight, volume or count)',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(c)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(c)'))?.position || 'Photo 1 (Bottom display panel)',
                          photoNumber: 1,
                          status: scan.items.find(i => i.ruleCode.includes('6(1)(c)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(c)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(1)(c)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                        {
                          declarationName: 'MRP (Maximum Retail Price) and "inclusive of all taxes"',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(e)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(e)'))?.position || 'Photo 2 (Back / Price panel)',
                          photoNumber: 2,
                          status: scan.items.find(i => i.ruleCode.includes('6(1)(e)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(e)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(1)(e)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                        {
                          declarationName: 'Month and year of manufacture / packing',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(d)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(d)'))?.position || 'Photo 2 (Batch matrix panel)',
                          photoNumber: 2,
                          status: scan.items.find(i => i.ruleCode.includes('6(1)(d)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(d)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(1)(d)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                        {
                          declarationName: 'Consumer care details (email / phone / address)',
                          value: scan.items.find(i => i.ruleCode.includes('6(1)(n)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(1)(n)'))?.position || 'Photo 2 (Back panel bottom)',
                          photoNumber: 2,
                          status: scan.items.find(i => i.ruleCode.includes('6(1)(n)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(1)(n)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(1)(n)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                        {
                          declarationName: 'Country of origin',
                          value: scan.items.find(i => i.ruleCode.includes('6(10)'))?.extractedValue || 'NOT FOUND',
                          position: scan.items.find(i => i.ruleCode.includes('6(10)'))?.position || 'Photo 2 (Statutory declaration box)',
                          photoNumber: 2,
                          status: scan.items.find(i => i.ruleCode.includes('6(10)'))?.isCompliant ? ('FOUND' as const) : ('NOT_FOUND' as const),
                          verdict: scan.items.find(i => i.ruleCode.includes('6(10)'))?.verdict || (scan.items.find(i => i.ruleCode.includes('6(10)'))?.isCompliant ? 'PASS' : 'FAIL')
                        },
                      ]
                  ).map((dec, idx) => {
                    const isNotFound =
                      dec.value === 'NOT FOUND' ||
                      dec.status === 'NOT_FOUND' ||
                      !dec.value ||
                      dec.value.toUpperCase().includes('NOT DETECTED');
                    
                    let pNum = dec.photoNumber;
                    if (!pNum && dec.position) {
                      const match = dec.position.match(/Photo\s*(\d+)/i);
                      if (match) pNum = parseInt(match[1], 10);
                    }

                    const decVerdict = dec.verdict || (isNotFound ? 'FAIL' : 'PASS');

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          decVerdict === 'FAIL' ? 'bg-rose-50/20' : decVerdict === 'WARNING' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {dec.declarationName}
                        </td>
                        <td className="py-2.5 px-3">
                          {isNotFound ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[11px] font-bold">
                              NOT FOUND
                            </span>
                          ) : (
                            <span className="font-mono text-slate-900 font-medium">
                              {dec.value}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {pNum && scan.images && scan.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setSelectedPhotoIndex(pNum! - 1)}
                                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                  selectedPhotoIndex === pNum - 1
                                    ? 'bg-[#1e3a8a] text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                }`}
                                title={`Switch preview to Photo ${pNum}`}
                              >
                                <Camera className="w-3 h-3 mr-1" />
                                Photo {pNum}
                              </button>
                            )}
                            <span className="inline-flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                              {dec.position || 'Not visible on label'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {decVerdict === 'PASS' && (
                            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                              PASS
                            </span>
                          )}
                          {decVerdict === 'WARNING' && (
                            <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-300">
                              WARNING
                            </span>
                          )}
                          {decVerdict === 'FAIL' && (
                            <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-300">
                              FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Other Text Printed on Label */}
          {scan.otherTextPrinted && scan.otherTextPrinted.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Other Text Printed on Packaging Label:</span>
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Non-mandatory statements, ingredient lists, batch numbers, storage instructions, and regulatory logos detected during vision inspection.
              </p>
              <div className="flex flex-wrap gap-2">
                {scan.otherTextPrinted.map((txt, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-mono"
                  >
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory AI-Assisted Disclaimer Banner */}
          <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 text-center text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-700">Notice: </span>
            This is a preliminary AI-assisted check, not a legal determination.
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={onViewHistory}
              className="text-xs sm:text-sm font-bold text-[#1e3a8a] hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
            >
              <span>View in Inspection History</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onScanAnother}
                className="px-5 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-md shadow-sm flex items-center space-x-1.5 cursor-pointer min-h-[44px] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Scan Another Label</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors min-h-[44px]"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Download Report (PDF)</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded shadow-2xs flex items-center space-x-1.5 cursor-pointer min-h-[44px]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
