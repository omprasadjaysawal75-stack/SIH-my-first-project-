import React from 'react';
import { Phone, Mail, ExternalLink, ShieldCheck } from 'lucide-react';

export const GovFooter: React.FC<{ onOpenRulesGuide: () => void }> = ({ onOpenRulesGuide }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-16 border-t-4 border-[#FF9933]">
      {/* Top Footer with Helpline Info */}
      <div className="bg-slate-950 py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-900/50 text-blue-400 rounded-md mt-1">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">National Consumer Helpline</div>
              <div className="text-xl font-mono font-bold text-amber-400">1915</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Toll-free consumer grievance registration & advisory (Govt. of India)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-900/50 text-blue-400 rounded-md mt-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Statutory Authority</div>
              <p className="text-slate-300 text-xs">Department of Consumer Affairs</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Legal Metrology Division, Krishi Bhawan, New Delhi - 110001
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-900/50 text-blue-400 rounded-md mt-1">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Consumer Grievance Portal</div>
              <a
                href="https://consumerhelpline.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>consumerhelpline.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Integrated grievance redressal system (INGRAM)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <div className="font-bold text-white text-sm flex items-center justify-center md:justify-start space-x-2">
              <span>LabelGuard</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-normal">
                Legal Metrology (Packaged Commodities) Compliance System
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-1">
              Designed in compliance with the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <button
              onClick={onOpenRulesGuide}
              className="hover:text-white cursor-pointer hover:underline"
            >
              Rule 6 Provisions
            </button>
            <span>•</span>
            <span className="text-slate-500">Ministry of Consumer Affairs</span>
            <span>•</span>
            <span className="text-slate-500">Government of India</span>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          LabelGuard assists manufacturers, packers, importers, and consumers in verifying regulatory labeling compliance. For formal legal enforcement, refer to the gazette notifications published by the Department of Consumer Affairs, Government of India.
        </div>
      </div>
    </footer>
  );
};
