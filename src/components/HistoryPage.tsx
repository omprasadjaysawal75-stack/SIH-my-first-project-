import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RotateCcw,
  Download,
  Package,
  X,
  ChevronRight,
  Sparkles,
  AlertOctagon,
  Users,
  Store,
  Clock,
  Check,
} from 'lucide-react';
import { ProductScan, User } from '../types';

interface HistoryPageProps {
  scans: ProductScan[];
  onSelectScan: (scan: ProductScan) => void;
  onDeleteScan: (id: string) => void;
  onRestoreDefaults: () => void;
  onNewScan: () => void;
  currentUser?: User;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
  onRestoreDefaults,
  onNewScan,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'compliant' | 'non_compliant' | 'citizen_reports'
  >('all');

  const isCitizen = currentUser?.role === 'citizen';

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        scan.productName.toLowerCase().includes(term) ||
        (scan.brand && scan.brand.toLowerCase().includes(term)) ||
        (scan.citizenGrievance?.storeName &&
          scan.citizenGrievance.storeName.toLowerCase().includes(term)) ||
        (scan.citizenGrievance?.complaintRef &&
          scan.citizenGrievance.complaintRef.toLowerCase().includes(term));

      const isCompliant =
        scan.complianceVerdict === 'COMPLIANT' ||
        (scan.overallCompliant && scan.complianceVerdict !== 'NON-COMPLIANT');

      if (statusFilter === 'compliant') {
        return matchesSearch && isCompliant;
      }
      if (statusFilter === 'non_compliant') {
        return matchesSearch && !isCompliant;
      }
      if (statusFilter === 'citizen_reports') {
        return matchesSearch && (scan.isCitizenReport || Boolean(scan.citizenGrievance));
      }
      return matchesSearch;
    });
  }, [scans, searchTerm, statusFilter]);

  const totalCompliant = useMemo(
    () =>
      scans.filter(
        (s) =>
          s.complianceVerdict === 'COMPLIANT' ||
          (s.overallCompliant && s.complianceVerdict !== 'NON-COMPLIANT')
      ).length,
    [scans]
  );

  const totalNonCompliant = scans.length - totalCompliant;

  const totalCitizenReports = useMemo(
    () => scans.filter((s) => s.isCitizenReport || Boolean(s.citizenGrievance)).length,
    [scans]
  );

  // Extract concise rule reference badges for display in table
  const getViolationTags = (scan: ProductScan): string[] => {
    if (scan.violationDetails && scan.violationDetails.length > 0) {
      return scan.violationDetails.map((v) => v.ruleCode);
    }
    if (scan.violations && scan.violations.length > 0) {
      return scan.violations.map((v) => {
        if (typeof v === 'object' && v.ruleCode) return v.ruleCode;
        const match = String(v).match(/Rule\s+[0-9]+(?:\([0-9a-zA-Z]+\))*/i);
        return match ? match[0] : 'Violation';
      });
    }
    return [];
  };

  const exportAllScansCsv = () => {
    if (scans.length === 0) return;
    const headers = [
      'Report ID',
      'Date of Scan',
      'Product Name',
      'Brand',
      'Category',
      'Verdict',
      'Score',
      'Violation Rule References',
      'Summary Findings',
    ];

    const rows = scans.map((s) => {
      const isComp =
        s.complianceVerdict === 'COMPLIANT' ||
        (s.overallCompliant && s.complianceVerdict !== 'NON-COMPLIANT');
      const vTags = getViolationTags(s).join('; ');
      return [
        `"${s.id}"`,
        `"${new Date(s.timestamp).toLocaleString('en-IN')}"`,
        `"${s.productName.replace(/"/g, '""')}"`,
        `"${(s.brand || '').replace(/"/g, '""')}"`,
        `"${(s.category || 'General').replace(/"/g, '""')}"`,
        `"${isComp ? 'COMPLIANT' : 'NON-COMPLIANT'}"`,
        `"${s.complianceScore}%"`,
        `"${vTags.replace(/"/g, '""')}"`,
        `"${(s.summaryVerdict || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Legal_Metrology_All_Scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">
              {isCitizen
                ? 'Consumer Fair-Trade Protection Registry'
                : 'Legal Metrology Compliance Repository'}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold border border-blue-200">
              PCR 2011 Rule 6
            </span>
            {totalCitizenReports > 0 && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold border border-amber-200">
                {totalCitizenReports} Citizen Grievance{totalCitizenReports > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isCitizen
              ? 'My Product Scans & Reported Grievances'
              : 'National Inspection Repository & Citizen Grievance Log'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {isCitizen
              ? 'Access past packaged food compliance evaluations and track grievances submitted to the National Consumer Helpline & Legal Metrology authorities.'
              : 'Official record of official inspector audits and crowdsourced citizen violation reports under Packaged Commodities Rules 2011. Click any row to review.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {scans.length > 0 && (
            <button
              onClick={exportAllScansCsv}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Export all scan records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All CSV</span>
            </button>
          )}
          <button
            onClick={onNewScan}
            className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded text-xs sm:text-sm font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scan New Label</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Box to find products by name */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isCitizen
                ? 'Search by product name, brand, or store...'
                : 'Search products, brands, or complaint refs...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter for Compliant / Non-compliant / Citizen Reports */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
          <span className="text-xs font-semibold text-slate-500 hidden md:inline">Filter:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({scans.length})
          </button>
          <button
            onClick={() => setStatusFilter('compliant')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1 ${
              statusFilter === 'compliant'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Compliant ({totalCompliant})</span>
          </button>
          <button
            onClick={() => setStatusFilter('non_compliant')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1 ${
              statusFilter === 'non_compliant'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Violations ({totalNonCompliant})</span>
          </button>
          <button
            onClick={() => setStatusFilter('citizen_reports')}
            className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1 ${
              statusFilter === 'citizen_reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-amber-600" />
            <span>Citizen Grievances ({totalCitizenReports})</span>
          </button>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Matching Inspection Records</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              {searchTerm || statusFilter !== 'all'
                ? 'No products matched your search or status filter criteria.'
                : 'No packaged products have been inspected yet.'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={onNewScan}
                className="px-4 py-2 bg-[#1e3a8a] text-white rounded text-xs font-bold hover:bg-blue-900 cursor-pointer"
              >
                Scan A Product Label
              </button>
              {scans.length === 0 && (
                <button
                  onClick={onRestoreDefaults}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Records</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Clicking a row opens the full past report */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 w-16 text-center">
                      Label
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Product Name & Brand
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Date & Time
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Statutory Verdict
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Violations (Rule References)
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScans.map((scan) => {
                    const isCompliant =
                      scan.complianceVerdict === 'COMPLIANT' ||
                      (scan.overallCompliant && scan.complianceVerdict !== 'NON-COMPLIANT');

                    const formattedDate = new Date(scan.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const vTags = getViolationTags(scan);
                    const photoSrc =
                      scan.imageUrl || (scan.images && scan.images[0]) || '';

                    return (
                      <tr
                        key={scan.id}
                        onClick={() => onSelectScan(scan)}
                        className="hover:bg-blue-50/70 active:bg-blue-100/60 transition-colors cursor-pointer group"
                        title={`Click to open full compliance report for ${scan.productName}`}
                      >
                        {/* Label Image Thumbnail */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="w-12 h-12 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-blue-400 transition-colors">
                            {photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={scan.productName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Product Name & Brand */}
                        <td className="px-4 py-3.5 max-w-[240px]">
                          <div className="font-bold text-slate-900 group-hover:text-blue-900 line-clamp-1">
                            {scan.productName}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {scan.brand || 'Unbranded'} • {scan.category || 'Commodity'}
                          </div>
                          {scan.citizenGrievance && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded flex items-center space-x-0.5">
                                <AlertOctagon className="w-2.5 h-2.5 text-amber-600" />
                                <span>{scan.citizenGrievance.complaintRef}</span>
                              </span>
                              <span
                                className="text-[10px] text-slate-600 truncate max-w-[130px] font-medium"
                                title={`${scan.citizenGrievance.storeName} (${scan.citizenGrievance.location})`}
                              >
                                📍 {scan.citizenGrievance.storeName}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-xs">
                          {formattedDate}
                        </td>

                        {/* Verdict */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isCompliant ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              COMPLIANT
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              NON-COMPLIANT
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3.5 text-center font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-black ${
                              scan.complianceScore >= 80
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : scan.complianceScore >= 50
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {scan.complianceScore}%
                          </span>
                        </td>

                        {/* Violations / Rule References */}
                        <td className="px-4 py-3.5 max-w-[220px]">
                          {isCompliant ? (
                            <span className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
                              <span>All Rule 6 mandates satisfied</span>
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {vTags.slice(0, 3).map((rule, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-mono font-bold"
                                >
                                  {rule}
                                </span>
                              ))}
                              {vTags.length > 3 && (
                                <span className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                                  +{vTags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div
                            className="flex items-center justify-end space-x-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onSelectScan(scan)}
                              className="px-2.5 py-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title="Open full compliance report"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Report</span>
                            </button>
                            {currentUser?.role === 'admin' && (
                              <button
                                onClick={() => onDeleteScan(scan.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete inspection record (Admin only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View - Each card clickable to open report */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredScans.map((scan) => {
                const isCompliant =
                  scan.complianceVerdict === 'COMPLIANT' ||
                  (scan.overallCompliant && scan.complianceVerdict !== 'NON-COMPLIANT');
                const photoSrc =
                  scan.imageUrl || (scan.images && scan.images[0]) || '';
                const vTags = getViolationTags(scan);

                return (
                  <div
                    key={scan.id}
                    onClick={() => onSelectScan(scan)}
                    className="p-4 space-y-2.5 cursor-pointer hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={scan.productName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                            {scan.productName}
                          </h4>
                          {isCompliant ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                              COMPLIANT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex-shrink-0">
                              NON-COMPLIANT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {scan.brand || 'Unbranded'} • {scan.category || 'Commodity'}
                        </p>
                        {scan.citizenGrievance && (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded flex items-center space-x-0.5">
                              <AlertOctagon className="w-2.5 h-2.5 text-amber-600" />
                              <span>{scan.citizenGrievance.complaintRef}</span>
                            </span>
                            <span className="text-[10px] text-slate-600 font-medium truncate max-w-[140px]">
                              📍 {scan.citizenGrievance.storeName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                          <span>{new Date(scan.timestamp).toLocaleDateString('en-IN')}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">
                            Score: {scan.complianceScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCompliant && vTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {vTags.map((rule, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-mono font-bold"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-blue-900 font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectScan(scan)}
                        className="flex items-center space-x-1 text-[#1e3a8a] hover:underline cursor-pointer"
                      >
                        <span>Open Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => onDeleteScan(scan.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete record (Admin only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
