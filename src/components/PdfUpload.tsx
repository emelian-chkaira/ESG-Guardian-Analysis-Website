import { useState, useCallback } from "react";
import { Upload, FileText, Info, Loader2, CheckCircle2 } from "lucide-react";
import type { ValidationData } from "@/types/esg";
import { validatePdf } from "@/lib/validationEngine";

interface PdfUploadProps {
  onValidationComplete?: (data: ValidationData) => void;
}

const PdfUpload = ({ onValidationComplete }: PdfUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    setFileName(file.name);
    setIsValidating(true);
    setDone(false);
    setProgress("Starting...");

    try {
      const data = await validatePdf(file, (msg) => setProgress(msg));
      setDone(true);
      setIsValidating(false);
      onValidationComplete?.(data);
    } catch (err) {
      console.error("Validation error:", err);
      setProgress("Error extracting PDF. Try a different file.");
      setIsValidating(false);
    }
  }, [onValidationComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        Upload Sustainability Report
      </h3>

      <label
        htmlFor="pdf-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : done
            ? "border-status-pass/40 bg-status-pass/5"
            : isValidating
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-secondary/50"
        }`}
      >
        {isValidating ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">{progress}</p>
            </div>
          </>
        ) : done ? (
          <>
            <CheckCircle2 className="h-8 w-8 text-status-pass" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-xs text-status-pass mt-1 font-medium">
                ✅ Validation complete — results updated below
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drop another PDF to re-validate
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drag & drop a PDF here, or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sustainability report in PDF format
              </p>
            </div>
          </>
        )}
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          className="sr-only"
          onChange={handleFileSelect}
        />
      </label>

      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>
          This validator runs <strong>100% in your browser</strong> — no data leaves your machine. PDF text is extracted with pdf.js, then 19 regex-based rules check compliance against EU regulatory thresholds.
        </p>
      </div>
    </div>
  );
};

export default PdfUpload;
