import React, { useState, useRef } from 'react';
import { VaultFile, VaultMode } from '../types';
import {
  Eye,
  EyeOff,
  Upload,
  FileCode2,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  RefreshCw,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';

interface LiquidGlassCardProps {
  mode: VaultMode;
  onModeSwitch: (mode: VaultMode) => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ mode }) => {
  // 6-digit PIN state: Always empty on load
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaderName, setUploaderName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retrieve state
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [storageType, setStorageType] = useState<string>('');

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Known PIN to Name mapping
  const KNOWN_PIN_USERS: Record<string, string> = {
    '141106': 'Pratyush Panda',
    '963121': 'Ashutosh Kumar',
    '212733': 'Ankit Kumar Nayak',
    '132730': 'Ankit Mahanta',
    '129038': 'Sourabh Ranjan Mirdha',
    '101807': 'Aditya Narayan Padhi',
    '123456': 'Everyone Local',
    '206969': 'Bikashindu Barik',
    '130807': 'Sai Swarup Mahapatra',
    '807060': 'Harsh Raj',
  };

  // Auto-fill or suggest name if owner or known PIN is entered
  const isOwnerPin = pin === '141106';
  const defaultUserName = KNOWN_PIN_USERS[pin] || '';

  // Handle PIN input strictly (6 digits max)
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
    if (statusMessage?.type === 'error') {
      setStatusMessage(null);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Accepts any file (.py, .java, .ipynb, etc.)
  const validateAndSetFile = (file: File) => {
    setSelectedFile(file);
    setStatusMessage(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Upload handler with PIN validation and uploaderName
  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage({
        type: 'error',
        text: 'Please select or drag and drop a file first.',
      });
      return;
    }

    if (!pin) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your 6-digit master PIN.',
      });
      return;
    }

    if (pin.length !== 6) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter the complete 6-digit master PIN.',
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('pin', pin);
    
    // Set uploader name: default to recognized PIN user (Owner/Friend) unless custom is entered
    const finalUploader = uploaderName.trim() || defaultUserName || 'Lab Student';
    formData.append('uploaderName', finalUploader);

    if (comment.trim()) {
      formData.append('comment', comment.trim());
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-vault-pin': pin,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! "${selectedFile.name}" dropped safely into vault for PIN ${pin}.`,
        });
        setSelectedFile(null);
        setComment('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Upload failed. Please verify your PIN.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error communicating with LabDrop API.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch files handler - returns files uploaded with THAT PIN
  const handleFetchFiles = async () => {
    if (!pin) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your 6-digit master PIN.',
      });
      return;
    }

    if (pin.length !== 6) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter the complete 6-digit master PIN.',
      });
      return;
    }

    setIsFetching(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/files?pin=${encodeURIComponent(pin)}`, {
        headers: {
          'x-vault-pin': pin,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFiles(data.files || []);
        setHasFetched(true);
        setStorageType(data.storageType || '');
        if (!data.files || data.files.length === 0) {
          setStatusMessage({
            type: 'info',
            text: `No files found in vault for PIN "${pin}".`,
          });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to retrieve files.',
        });
        setFiles([]);
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error retrieving files from LabDrop API.',
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Download individual file
  const handleDownloadFile = async (fileKey: string, fileName: string) => {
    try {
      const downloadEndpoint = `/api/download/${encodeURIComponent(fileKey)}`;
      const response = await fetch(downloadEndpoint);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        setStatusMessage({
          type: 'error',
          text: errorData.error || 'Failed to download file.',
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `Downloaded ${fileName} safely.`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Error initiating file download.',
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Liquid-Glass Action Card */}
      <div className="relative w-[701px] max-md:w-[calc(100vw-48px)] min-h-[220px] bg-white/[0.08] border-[3px] border-white rounded-[44px] shadow-[0_0_8px_0_rgba(0,0,0,0.12)] overflow-hidden backdrop-blur-[24px] p-7 flex flex-col justify-between transition-all duration-300">
        {/* Top row inside card */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/5">
          {/* Masked 6-digit PIN input - Configured to avoid browser password manager prompts */}
          <div className="flex items-center gap-2.5 bg-white/40 hover:bg-white/60 focus-within:bg-white/80 transition-all rounded-full px-4 py-2 border border-white/80 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-vault-muted" />
            <input
              type="text"
              inputMode="numeric"
              name="labdrop_pin_code"
              id="labdrop_pin_code"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              placeholder="••••••"
              aria-label="6-digit Master PIN"
              style={{
                WebkitTextSecurity: showPin ? 'none' : 'disc',
              } as React.CSSProperties}
              className="w-24 bg-transparent outline-none font-mono text-base font-semibold tracking-[0.25em] text-vault-dark placeholder:tracking-[0.2em] placeholder:text-black/35"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              title={showPin ? 'Hide PIN' : 'Reveal PIN'}
              className="text-vault-muted hover:text-vault-dark transition-colors p-1 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Badge on right: specifically shown as .ipynb files only as requested */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 border border-white/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-sans text-xs font-semibold text-vault-dark tracking-wide uppercase">
              .ipynb files only
            </span>
          </div>
        </div>

        {/* Dynamic Center Body View */}
        <div className="py-4">
          {mode === 'upload' ? (
            /* Upload View */
            <div className="flex flex-col gap-3">
              {/* Dropzone accepting any file */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!selectedFile) fileInputRef.current?.click();
                }}
                className={`group relative rounded-[24px] border-2 border-dashed p-5 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[105px] ${
                  isDragging
                    ? 'border-vault-dark bg-white/40 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-500/70 bg-white/30'
                    : 'border-white/60 hover:border-black/30 hover:bg-white/20 cursor-pointer'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center gap-4 w-full justify-between px-2">
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                      <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
                        <FileCode2 className="w-5 h-5 text-vault-dark" />
                      </div>
                      <div className="truncate">
                        <p className="font-sans font-semibold text-vault-text text-sm truncate max-w-[340px]">
                          {selectedFile.name}
                        </p>
                        <p className="font-sans text-xs text-vault-muted">
                          {formatBytes(selectedFile.size)} • Ready to drop
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setComment('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 rounded-full hover:bg-black/10 text-vault-muted hover:text-black transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 select-none">
                    <FileCode2 className="w-8 h-8 text-vault-muted/70 group-hover:scale-110 transition-transform duration-200" />
                    <p className="font-sans text-sm font-medium text-vault-text">
                      Drag and drop your laboratory file here
                    </p>
                    <p className="font-sans text-xs text-vault-muted">
                      or click to browse local laboratory workstation files
                    </p>
                  </div>
                )}
              </div>

              {/* Extra Inputs when a file is selected: Uploader Name & Comment */}
              {selectedFile && (
                <div className="flex flex-col gap-2 animate-fade-in">
                  {/* Uploader Name Input */}
                  <div className="flex items-center gap-2.5 bg-white/40 border border-white/80 rounded-2xl px-4 py-2 shadow-sm focus-within:bg-white/70 transition-all">
                    <User className="w-4 h-4 text-vault-muted shrink-0" />
                    <input
                      type="text"
                      value={uploaderName}
                      onChange={(e) => setUploaderName(e.target.value)}
                      placeholder={
                        isOwnerPin
                          ? 'Pratyush Panda (Owner)'
                          : defaultUserName
                          ? `${defaultUserName}`
                          : 'Your Name (e.g. Ashutosh Kumar, Rohan)...'
                      }
                      className="w-full bg-transparent outline-none text-xs font-sans text-vault-dark placeholder:text-vault-muted/70 font-medium"
                      maxLength={50}
                    />
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2.5 bg-white/40 border border-white/80 rounded-2xl px-4 py-2 shadow-sm focus-within:bg-white/70 transition-all">
                    <MessageSquare className="w-4 h-4 text-vault-accent shrink-0" />
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add lab notes or experiment comments (optional)..."
                      className="w-full bg-transparent outline-none text-xs font-sans text-vault-dark placeholder:text-vault-muted/70"
                      maxLength={150}
                    />
                    {comment && (
                      <span className="text-[10px] text-vault-muted font-mono shrink-0">
                        {comment.length}/150
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Retrieve View: Files List (Filtered by User PIN) */
            <div className="flex flex-col gap-3 min-h-[120px]">
              {!hasFetched ? (
                <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                  <Lock className="w-7 h-7 text-vault-muted/60 mb-2" />
                  <p className="font-sans text-sm font-medium text-vault-text">
                    Retrieve Files for Your PIN
                  </p>
                  <p className="font-sans text-xs text-vault-muted">
                    Enter your 6-digit master PIN above and click &quot;Fetch Files&quot;
                  </p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="w-7 h-7 text-vault-muted mb-2" />
                  <p className="font-sans text-sm font-medium text-vault-text">
                    No files found for PIN &quot;{pin}&quot;
                  </p>
                  <p className="font-sans text-xs text-vault-muted">
                    Only files uploaded with this exact 6-digit PIN will appear here.
                  </p>
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto pr-1 flex flex-col gap-2">
                  {files.map((file) => (
                    <div
                      key={file.key}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 transition-all backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                          <FileCode2 className="w-4 h-4 text-vault-dark" />
                        </div>
                        <div className="truncate">
                          <p className="font-sans text-sm font-semibold text-vault-dark truncate max-w-[320px] max-md:max-w-[180px]">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-vault-muted">
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 inline" />
                              {formatDateTime(file.created_at)}
                            </span>
                            {file.comment && (
                              <>
                                <span>•</span>
                                <span className="italic truncate max-w-[140px]">&quot;{file.comment}&quot;</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file.key, file.name)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-[#333] text-xs font-medium uppercase tracking-wider transition-all active:scale-95 shrink-0 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom row inside card */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5">
          {mode === 'upload' ? (
            <>
              {/* Upload circular button on bottom-left */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Browse laboratory files"
                className="w-11 h-11 bg-transparent border border-white/70 rounded-full flex items-center justify-center backdrop-blur-[14px] hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer hover:bg-white/30"
              >
                <Upload className="w-4 h-4 text-vault-dark" />
              </button>

              {/* Primary CTA button on bottom-right */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="w-[156px] h-14 bg-black border-none rounded-[44px] text-[#fafafa] font-sans text-sm uppercase tracking-[0.02em] font-medium hover:bg-[#333] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dropping...</span>
                  </>
                ) : (
                  <span>Save File</span>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Storage indicator on bottom-left */}
              <div className="text-xs text-vault-muted font-sans flex items-center gap-1.5 pl-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{storageType === 'supabase' ? 'Supabase Storage' : 'Ready'}</span>
              </div>

              {/* Primary CTA button on bottom-right */}
              <button
                type="button"
                onClick={handleFetchFiles}
                disabled={isFetching}
                className="w-[156px] h-14 bg-black border-none rounded-[44px] text-[#fafafa] font-sans text-sm uppercase tracking-[0.02em] font-medium hover:bg-[#333] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <span>Fetch Files</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Notifications / Feedback */}
      {statusMessage && (
        <div
          className={`mt-4 px-5 py-3 rounded-full flex items-center gap-2.5 backdrop-blur-md border shadow-md animate-fade-in text-sm font-medium transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900'
              : statusMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/40 text-red-900'
              : 'bg-black/10 border-black/20 text-vault-dark'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {statusMessage.type === 'info' && <AlertCircle className="w-4 h-4 text-vault-muted shrink-0" />}
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="ml-2 hover:opacity-75 p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
