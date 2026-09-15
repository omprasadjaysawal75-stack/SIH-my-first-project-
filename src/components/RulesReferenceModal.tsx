import React from 'react';
import { X, BookOpen, Scale, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RulesReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesReferenceModal: React.FC<RulesReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rulesList = [
    {
      rule: 'Rule 6(1)(a)',
      title: 'Name and Address of Manufacturer, Packer or Importer',
      details:
        'Every package shall bear the name and complete address of the manufacturer, or where manufacturer is not the packer, both entities. For imported goods, the name, address and country of the Indian importer must be declared.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(b)',
      title: 'Generic or Common Name of Commodity',
      details:
        'The common or generic name of the commodity contained in the package must be prominently stated in conspicuous characters.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(c)',
      title: 'Net Quantity (Metric SI Units)',
      details:
        'The net quantity in terms of standard unit of weight or measure (g, kg, ml, l, or number) adhering to the metric system. Use of non-standard units (oz, lbs) alone is an offence under Rule 13.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(d)',
      title: 'Month and Year of Manufacture / Packing / Import',
      details:
        'Month and year in which the commodity is manufactured or pre-packed or imported shall be clearly indicated (e.g. MM/YYYY or Month YYYY).',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(e)',
      title: 'Maximum Retail Price (MRP)',
      details:
        'The retail sale price of the package shall be clearly indicated in the format: "Maximum or Max. Retail Price Rs. ...... / ₹ ...... inclusive of all taxes" or "incl. of all taxes". Declaring price without the tax-inclusive clause is an offence.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(e) Amended',
      title: 'Unit Sale Price (USP)',
      details:
        'Unit sale price (e.g. ₹ per g / ₹ per ml) is mandatory for packages containing more than 1 kg or 1 litre, or multi-packs, enabling direct price comparison for consumers.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(n)',
      title: 'Consumer Care Details (4 Required Fields)',
      details:
        'Name/designation of the officer, postal address, working telephone number AND electronic mail address (email) of the person/office to be contacted in case of consumer complaints.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(10)',
      title: 'Country of Origin',
      details:
        'Country of origin or country of manufacture is mandatory on all pre-packaged commodities sold in India.',
      mandatory: true,
    },
    {
      rule: 'Rule 6(1)(g)',
      title: 'Best Before or Use By Date',
      details:
        'Mandatory on packages of commodities which may become unfit for human consumption after a period of time.',
      mandatory: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#1e3a8a] text-white rounded">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Legal Metrology (Packaged Commodities) Rules, 2011
              </h3>
              <p className="text-xs text-slate-500">
                Rule 6 Statutory Declarations & Legal Provisions Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#1e3a8a] flex-shrink-0 mt-0.5" />
            <div>
              <strong>Enforcement Authority: </strong>
              Legal Metrology Division, Department of Consumer Affairs, Ministry of Consumer
              Affairs, Food and Public Distribution, Government of India.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide border-b border-slate-200 pb-1">
              Rule 6: Declarations to be Made on Every Package
            </h4>
            {rulesList.map((r, i) => (
              <div key={i} className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-[#1e3a8a]">{r.rule}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      r.mandatory ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {r.mandatory ? 'Mandatory' : 'Conditional'}
                  </span>
                </div>
                <div className="font-bold text-slate-800 text-xs mb-1">{r.title}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{r.details}</div>
              </div>
            ))}
          </div>

          {/* Penalties Section */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-md space-y-2">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
              <Scale className="w-4 h-4 text-rose-700" />
              <span>Penalties under Section 36 of Legal Metrology Act, 2009:</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Whoever manufactures, packs, imports, sells, distributes, delivers, or offers for sale
              any pre-packaged commodity that does not conform to the declarations on the package as
              mandated under the rules shall be punished with a fine which may extend to{' '}
              <strong>₹ 25,000 for the first offence</strong>, up to{' '}
              <strong>₹ 50,000 for the second offence</strong>, and for any subsequent offence with
              imprisonment for a term which may extend to one year, or with fine, or with both.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a8a] text-white font-bold text-xs rounded hover:bg-blue-900 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
