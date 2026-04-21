import { Shield, FileText, BookOpen, Scale } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => (
  <header className="gradient-hero border-b border-white/10">
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ESG Guardian (Environmental, Social, and Governance)
            </h1>
          </div>
          <p className="text-white/75 text-sm md:text-base max-w-xl">
            CSRD/ESRS + EBA Pillar 3 ITS — Automated rule-based compliance checking for EU banking sustainability reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#legal"
            className="flex items-center gap-1.5 text-xs font-medium text-white/75 hover:text-white transition-colors bg-white/10 rounded-lg px-3 py-2"
          >
            <Scale className="h-3.5 w-3.5" />
            Legal Sources
          </a>
          <a
            href="#methodology"
            className="flex items-center gap-1.5 text-xs font-medium text-white/75 hover:text-white transition-colors bg-white/10 rounded-lg px-3 py-2"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Methodology
          </a>
          <a
            href="#report"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-2"
          >
            <FileText className="h-3.5 w-3.5" />
            Full Report
          </a>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
