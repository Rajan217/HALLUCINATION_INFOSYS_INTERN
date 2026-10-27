import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';

export const DropZone = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  error,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        onFileSelect(file);
      } else {
        alert('Please upload a valid CSV file.');
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept=".csv,text/csv"
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.005]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 text-center">
            Drag & Drop CSV file here or click to browse
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
            Upload questions and model answers for automated multi-agent hallucination scoring
          </p>

          <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700">
            <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
              Supported fields: question, ai_response, reference (optional)
            </code>
          </div>
        </div>
      ) : (
        <div className="border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </span>
                <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3 h-3 mr-0.5" /> Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • CSV Format
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearFile();
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;
