import React, { useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Scale,
  Calendar,
  Sparkles,
  Package,
  ChevronRight,
  ExternalLink,
  Users,
  AlertOctagon,
  Building2,
  Clock,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ProductScan } from '../types';

interface DashboardPageProps {
  scans: ProductScan[];
  onSelectScan: (scan: ProductScan) => void;
  onNewScan: () => void;
  onViewHistory?: () => void;
}

interface ViolationStat {
  id: string;
  ruleCode: string;
  shortName: string;
  fullName: string;
  count: number;
  description: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  scans,
  onSelectScan,
  onNewScan,
  onViewHistory,
}) => {
  // 1. Primary Counts
  const totalScans = scans.length;
  const compliantScans = useMemo(
    () =>
      scans.filter(
        (s) =>
          s.complianceVerdict === 'COMPLIANT' ||
          (s.overallCompliant && s.complianceVerdict !== 'NON-COMPLIANT')
      ).length,
    [scans]
  );
  const nonCompliantScans = totalScans - compliantScans;
  const complianceRate =
    totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 0;

  // Crowdsourced Citizen Surveillance stats
  const citizenScansCount = useMemo(
    () =>
      scans.filter(
        (s) => s.isCitizenReport || s.scannedByRole === 'citizen' || Boolean(s.citizenGrievance)
      ).length,
    [scans]
  );

  const citizenGrievances = useMemo(
    () => scans.filter((s) => Boolean(s.citizenGrievance)),
    [scans]
  );

  const noticesIssuedCount = useMemo(
    () => scans.filter((s) => s.citizenGrievance?.status === 'NOTICE_ISSUED').length,
    [scans]
  );

  // 2. Compute Most Frequent Violation Types across all scans
  const violationStats = useMemo(() => {
    const categories: Record<string, ViolationStat> = {
      'mrp_tax': {
        id: 'mrp_tax',
        ruleCode: 'Rule 6(1)(e)',
        shortName: 'MRP & Tax Clause',
        fullName: 'Rule 6(1)(e) - MRP Missing "(incl. of all taxes)"',
        count: 0,
        description: 'Retail price declared without mandatory tax inclusive clause or altered',
      },
      'consumer_care': {
        id: 'consumer_care',
        ruleCode: 'Rule 6(1)(n)',
        shortName: 'Consumer Care',
        fullName: 'Rule 6(1)(n) - Missing Consumer Care Email / Phone',
        count: 0,
        description: 'Omission of statutory consumer grievance electronic mail or helpline',
      },
      'country_origin': {
        id: 'country_origin',
        ruleCode: 'Rule 6(10)',
        shortName: 'Country of Origin',
        fullName: 'Rule 6(10) - Country of Origin Omitted',
        count: 0,
        description: 'Packaging fails to explicitly declare country of manufacture/origin',
      },
      'net_quantity': {
        id: 'net_quantity',
        ruleCode: 'Rule 6(1)(c)',
        shortName: 'Net Quantity Units',
        fullName: 'Rule 6(1)(c) - Net Quantity / Metric SI Units',
        count: 0,
        description: 'Non-standard measurement units or improper numeral dimensions',
      },
      'mfg_date': {
        id: 'mfg_date',
        ruleCode: 'Rule 6(1)(d)',
        shortName: 'Mfg / Packing Date',
        fullName: 'Rule 6(1)(d) - Month & Year of Packing / Expired',
        count: 0,
        description: 'Missing pre-packing date or commodity past best-before shelf life',
      },
      'dual_mrp': {
        id: 'dual_mrp',
        ruleCode: 'Rule 18(2)',
        shortName: 'Dual MRP / Sticker',
        fullName: 'Rule 18(2) - Dual MRP Sticker / Overwriting',
        count: 0,
        description: 'Affixing higher sticker price over original manufacturer MRP',
      },
      'mfr_address': {
        id: 'mfr_address',
        ruleCode: 'Rule 6(1)(a)',
        shortName: 'Name & Address',
        fullName: 'Rule 6(1)(a) - Incomplete Manufacturer Address',
        count: 0,
        description: 'Incomplete physical premise or missing packer/importer identification',
      },
      'generic_name': {
        id: 'generic_name',
        ruleCode: 'Rule 6(1)(b)',
        shortName: 'Generic Commodity Name',
        fullName: 'Rule 6(1)(b) - Generic / Common Commodity Name',
        count: 0,
        description: 'Missing standard generic description of the packaged article',
      },
    };

    // Scan each scan record and tally distinct violations
    scans.forEach((scan) => {
      const scanFoundRules = new Set<string>();

      // Check structured violation details
      if (scan.violationDetails && scan.violationDetails.length > 0) {
        scan.violationDetails.forEach((vd) => {
          const rc = (vd.ruleCode || '').toLowerCase();
          const desc = (vd.violation || '').toLowerCase();

          if (rc.includes('6(1)(e)') || desc.includes('mrp') || desc.includes('tax')) {
            scanFoundRules.add('mrp_tax');
          }
          if (rc.includes('6(1)(n)') || desc.includes('consumer') || desc.includes('email')) {
            scanFoundRules.add('consumer_care');
          }
          if (rc.includes('6(10)') || desc.includes('origin')) {
            scanFoundRules.add('country_origin');
          }
          if (rc.includes('6(1)(c)') || desc.includes('quantity') || desc.includes('net qty')) {
            scanFoundRules.add('net_quantity');
          }
          if (rc.includes('6(1)(d)') || desc.includes('mfg') || desc.includes('pack') || desc.includes('expired')) {
            scanFoundRules.add('mfg_date');
          }
          if (rc.includes('18(2)') || rc.includes('18') || desc.includes('dual') || desc.includes('sticker')) {
            scanFoundRules.add('dual_mrp');
          }
          if (rc.includes('6(1)(a)') || desc.includes('manufacturer') || desc.includes('address')) {
            scanFoundRules.add('mfr_address');
          }
          if (rc.includes('6(1)(b)') || desc.includes('generic') || desc.includes('common name')) {
            scanFoundRules.add('generic_name');
          }
        });
      }

      // Check checklist items
      if (scan.items && scan.items.length > 0) {
        scan.items.forEach((item) => {
          if (!item.isCompliant || item.verdict === 'FAIL' || item.status === 'failed') {
            const rc = (item.ruleCode || '').toLowerCase();
            const title = (item.title || '').toLowerCase();

            if (rc.includes('6(1)(e)') || title.includes('mrp')) scanFoundRules.add('mrp_tax');
            if (rc.includes('6(1)(n)') || title.includes('consumer')) scanFoundRules.add('consumer_care');
            if (rc.includes('6(10)') || title.includes('origin')) scanFoundRules.add('country_origin');
            if (rc.includes('6(1)(c)') || title.includes('quantity')) scanFoundRules.add('net_quantity');
            if (rc.includes('6(1)(d)') || title.includes('manufacture')) scanFoundRules.add('mfg_date');
            if (rc.includes('18') || title.includes('dual')) scanFoundRules.add('dual_mrp');
            if (rc.includes('6(1)(a)') || title.includes('manufacturer')) scanFoundRules.add('mfr_address');
            if (rc.includes('6(1)(b)') || title.includes('generic')) scanFoundRules.add('generic_name');
          }
        });
      }

      // Check string violations array
      if (scan.violations && scan.violations.length > 0) {
        scan.violations.forEach((v) => {
          const str = (typeof v === 'string' ? v : (v as any).violation || '').toLowerCase();
          if (str.includes('mrp') || str.includes('tax')) scanFoundRules.add('mrp_tax');
          if (str.includes('care') || str.includes('email') || str.includes('helpline')) scanFoundRules.add('consumer_care');
          if (str.includes('origin')) scanFoundRules.add('country_origin');
          if (str.includes('net') || str.includes('quantity') || str.includes('unit')) scanFoundRules.add('net_quantity');
          if (str.includes('mfg') || str.includes('packing') || str.includes('expired')) scanFoundRules.add('mfg_date');
          if (str.includes('dual') || str.includes('sticker')) scanFoundRules.add('dual_mrp');
        });
      }

      // Increment counts for unique violations in this scan
      scanFoundRules.forEach((catKey) => {
        if (categories[catKey]) {
          categories[catKey].count += 1;
        }
      });
    });

    // Return list sorted descending by count
    return Object.values(categories)
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [scans]);

  // 3. Last 5 Scans
  const recentScans = useMemo(() => {
    return [...scans]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);
  }, [scans]);

  // Color palette for the violation frequency bar chart
  const barColors = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#f87171', '#ef4444', '#dc2626'];

  // Custom Tooltip for recharts BarChart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ViolationStat = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-300 rounded-lg shadow-lg max-w-xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
            {data.fullName}
          </div>
          <div className="text-slate-600 mb-1.5">{data.description}</div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-semibold">
            <span className="text-slate-500">Occurrences:</span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-black">
              {data.count} {data.count === 1 ? 'scan' : 'scans'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">
              Compliance Intelligence Dashboard
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
              Legal Metrology Act, 2009
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Packaged Commodities Metrology Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time compliance analytics and violation tracking under Indian Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white rounded text-xs sm:text-sm font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Scan New Label</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* 4 Metric Cards: Total Scans, Compliant, Non-Compliant, and Compliance Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Scans */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Scans
            </span>
            <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-md border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">{totalScans}</div>
            <span className="text-xs text-slate-500 font-medium">Inspected Labels</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Historical Repository</span>
            <span className="font-semibold text-[#1e3a8a]">PCR 2011</span>
          </div>
        </div>

        {/* Metric 2: Compliant Scans */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Compliant Scans
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-700">{compliantScans}</div>
            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold border border-emerald-200">
              {totalScans > 0 ? Math.round((compliantScans / totalScans) * 100) : 0}% Pass
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Satisfy all Rule 6 statutory mandates
          </div>
        </div>

        {/* Metric 3: Non-Compliant Scans */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Non-Compliant Scans
            </span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-rose-700">{nonCompliantScans}</div>
            <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold border border-rose-200">
              {totalScans > 0 ? Math.round((nonCompliantScans / totalScans) * 100) : 0}% Fail
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Requires corrective packaging action
          </div>
        </div>

        {/* Metric 4: Compliance Rate Percentage */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Compliance Rate
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#1e3a8a]">{complianceRate}%</div>
            <span className="text-xs font-bold text-slate-600">
              {complianceRate >= 80 ? 'Good Standing' : complianceRate >= 50 ? 'Moderate' : 'Critical'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  complianceRate >= 80
                    ? 'bg-emerald-600'
                    : complianceRate >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                }`}
                style={{ width: `${complianceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Crowdsourced Citizen Surveillance & Market Watch Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-800/80 pb-3.5">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-800 text-blue-200 rounded-lg flex-shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Crowdsourced Citizen Surveillance & Market Watch
                </h2>
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded uppercase tracking-wider">
                  Public Scale
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5 max-w-2xl leading-relaxed">
                Empowering everyday consumers across India to scan packaged food items and report overcharging, dual MRP, or missing declarations solves the high-volume commodity compliance bottleneck.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded text-blue-100 font-medium">
              National Consumer Helpline: <strong>1915</strong>
            </span>
          </div>
        </div>

        {/* 3 Key Crowdsourced Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/10 rounded-lg p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
              Citizen Scans Logged
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {citizenScansCount}
            </div>
            <div className="text-[11px] text-blue-300 mt-1">
              Crowdsourced consumer inspections
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
              Reported Retail Grievances
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {citizenGrievances.length}
            </div>
            <div className="text-[11px] text-blue-300 mt-1">
              Direct store violation alerts
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              Section 36 Notices Issued
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
              {noticesIssuedCount}
            </div>
            <div className="text-[11px] text-blue-300 mt-1">
              Enforcement actions triggered
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Bar Chart of Violation Types & Last 5 Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bar Chart of Most Frequent Violation Types */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Most Frequent Violation Types</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Frequency of omitted or non-compliant statutory provisions under PCR 2011
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                Rule 6 & Rule 18
              </span>
            </div>

            {violationStats.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-lg my-4">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Zero Statutory Violations Detected
                </h3>
                <p className="text-xs text-emerald-700 mt-1 max-w-sm mx-auto">
                  All inspected product labels currently comply with the Legal Metrology (Packaged Commodities) Rules, 2011.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Responsive Recharts Bar Chart */}
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={violationStats}
                      layout="vertical"
                      margin={{ top: 10, right: 24, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#64748b"
                        fontSize={11}
                        domain={[0, 'dataMax + 1']}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={130}
                        stroke="#334155"
                        fontSize={11}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {violationStats.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={barColors[index % barColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Breakdown List of Most Frequent Violations */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {violationStats.slice(0, 4).map((v, i) => (
                    <div
                      key={v.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/80 rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900">{v.shortName}</span>
                          <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                            ({v.ruleCode})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded text-[11px]">
                          {v.count} {v.count === 1 ? 'occurrence' : 'occurrences'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statutory Enforcement Notice */}
          <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start space-x-2">
            <Scale className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Statutory Note: </span>
              Under <strong>Section 36 of the Legal Metrology Act, 2009</strong>, manufacturing, packing, or distributing commodities without mandatory declarations attracts penalties up to ₹25,000 for the first offence and up to ₹50,000 or imprisonment for repeat offences.
            </div>
          </div>
        </div>

        {/* Right Column: The Last 5 Scans */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#1e3a8a]" />
                  <span>Last 5 Scans</span>
                </h2>
                <p className="text-xs text-slate-500">Most recent packaging inspections</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">Recent Activity</span>
            </div>

            {recentScans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg my-4">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No scans recorded yet</p>
                <button
                  onClick={onNewScan}
                  className="mt-3 px-3 py-1.5 bg-[#1e3a8a] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Scan First Label
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentScans.map((scan) => {
                  const isCompliant =
                    scan.complianceVerdict === 'COMPLIANT' ||
                    (scan.overallCompliant && scan.complianceVerdict !== 'NON-COMPLIANT');
                  const photoSrc =
                    scan.imageUrl || (scan.images && scan.images[0]) || '';

                  return (
                    <div
                      key={scan.id}
                      onClick={() => onSelectScan(scan)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group"
                      title={`Click to open full report for ${scan.productName}`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        {/* Packaging Thumbnail */}
                        <div className="w-11 h-11 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-blue-400">
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

                        {/* Product Title and Details */}
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                            {scan.productName}
                          </h3>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{new Date(scan.timestamp).toLocaleDateString('en-IN')}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              Score: {scan.complianceScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Verdict & Arrow */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {isCompliant ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                            COMPLIANT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded border border-rose-200">
                            NON-COMPLIANT
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="text-xs font-bold text-[#1e3a8a] hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>View All {scans.length} Inspections in History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onNewScan}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition-colors cursor-pointer ml-auto"
            >
              + New Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
