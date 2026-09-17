import React, { useState, useEffect, useCallback } from 'react';
import { VaultFile } from '../types';
import {
  RefreshCw,
  Download,
  Trash2,
  Search,
  Calendar,
  Clock,
  MessageSquare,
  FileCode2,
  ArrowLeft,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 1 0 0 3.32 1.66 1.66 0 0 0 0-3.32Z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storageType, setStorageType] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Fetch all files for the owner dashboard (NO PIN REQUIRED)
  const fetchAllFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files?dashboard=true');
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.files || []);
        setStorageType(data.storageType || 'supabase');
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to load files.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error communicating with LabDrop API.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch on mount
  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  // Direct download (No PIN required on dashboard)
  const handleDownload = async (fileKey: string, fileName: string) => {
    try {
      const downloadEndpoint = `/api/download/${encodeURIComponent(fileKey)}`;
      const res = await fetch(downloadEndpoint);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to download file.' }));
        setStatusMessage({ type: 'error', text: errData.error || 'Failed to download file.' });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: `Downloaded "${fileName}" successfully.` });
    } catch {
      setStatusMessage({ type: 'error', text: 'Error downloading file.' });
    }
  };

  // Owner deletion of old files
  const handleDelete = async (fileKey: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${fileName}" from LabDrop?`)) return;
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(fileKey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles((prev) => prev.filter((f) => f.key !== fileKey));
        setStatusMessage({ type: 'success', text: `Deleted "${fileName}" from vault.` });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete file.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error deleting file.' });
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatExactTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  // Unique uploaders count
  const uniqueUploaders = Array.from(
    new Set(files.map((f) => f.uploaderName || 'Lab Student'))
  );

  const filteredFiles = files.filter((f) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = f.name.toLowerCase().includes(q);
    const uploaderMatch = (f.uploaderName || '').toLowerCase().includes(q);
    const commentMatch = (f.comment || '').toLowerCase().includes(q);
    return nameMatch || uploaderMatch || commentMatch;
  });

  return (
    <div className="relative min-h-svh w-full overflow-x-hidden bg-[#fafafa]">
      {/* Top Gradient Overlay */}
      <div
        className="absolute inset-x-0 top-0 h-[400px] pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(240,240,240,0.8) 0%, rgba(250,250,250,0) 100%)',
        }}
      />

      <div className="relative z-[2] max-w-[1360px] mx-auto min-h-svh flex flex-col justify-between py-6 px-8 max-md:px-4">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-6 border-b border-black/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-vault-dark hover:bg-black/5 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Return to LabDrop"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-[32px] text-black leading-none select-none">
                  labdrop
                </span>
                <span className="text-xs uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-black text-white">
                  Owner Dashboard
                </span>
              </div>
              <p className="text-xs text-vault-muted font-sans mt-0.5">
                Audit uploaded files, see who uploaded them, track exact date/time, and manage storage
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAllFiles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-vault-dark text-white text-xs font-medium uppercase tracking-wider hover:bg-[#333] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-full border border-black/10 text-xs font-medium uppercase tracking-wider hover:bg-black/5 active:scale-95 transition-all cursor-pointer bg-white"
            >
              Go to Upload
            </button>
          </div>
        </header>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`my-4 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-medium border shadow-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-vault-muted hover:text-black"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 py-6 flex flex-col gap-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-vault-muted uppercase tracking-wider font-sans">
                  Total Uploaded Files
                </p>
                <p className="text-3xl font-bold font-sans text-vault-dark mt-1">
                  {loading ? '...' : files.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-vault-dark">
                <FileCode2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-vault-muted uppercase tracking-wider font-sans">
                  Active Uploaders
                </p>
                <p className="text-2xl font-bold font-sans text-vault-dark mt-1 flex items-center gap-2">
                  <span>{uniqueUploaders.length}</span>
                  <span className="text-xs font-normal text-vault-muted">
                    ({uniqueUploaders.slice(0, 2).join(', ')}{uniqueUploaders.length > 2 ? '...' : ''})
                  </span>
                </p>
                <p className="text-[11px] text-vault-muted mt-0.5">Pratyush Panda &amp; Friends</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-black/10 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-vault-muted uppercase tracking-wider font-sans">
                  Storage Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-base font-semibold font-sans text-vault-dark">
                    {storageType === 'supabase' ? 'Supabase Storage' : 'Active Vault'}
                  </p>
                </div>
                <p className="text-[11px] text-vault-muted mt-0.5">Bucket: lab-notebooks</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-[450px]">
              <Search className="w-4 h-4 text-vault-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by file name, uploader name (e.g. Pratyush), or notes..."
                className="w-full bg-white border border-black/10 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black transition-all shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-[#333] active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>+ Drop New File</span>
            </button>
          </div>

          {/* Files List with Uploader Name, Time, and Delete Option */}
          {loading ? (
            <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center rounded-3xl bg-white border border-black/10 p-8 text-center">
              <RefreshCw className="w-8 h-8 text-vault-muted animate-spin mb-3" />
              <p className="text-sm font-medium text-vault-dark">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center rounded-3xl bg-white border border-black/10 p-8 text-center">
              <FileCode2 className="w-10 h-10 text-vault-muted mb-3 opacity-60" />
              <h2 className="text-base font-semibold text-vault-dark font-sans">
                {searchQuery ? 'No matching files found' : 'No files currently in vault'}
              </h2>
              <p className="text-xs text-vault-muted max-w-sm mt-1 mb-4">
                {searchQuery
                  ? `No file matches "${searchQuery}". Try another keyword.`
                  : 'Files dropped from lab computers will appear here with exact timestamps, uploader name, and notes.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2 rounded-full bg-black text-white text-xs font-medium uppercase tracking-wider"
              >
                Go to Upload
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.key}
                  className="p-5 rounded-3xl bg-white border border-black/10 hover:border-black/20 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: File Info & Uploader & Comment */}
                  <div className="flex items-start gap-4 overflow-hidden">
                    <div className="w-11 h-11 rounded-2xl bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCode2 className="w-5 h-5 text-vault-dark" />
                    </div>

                    <div className="flex flex-col gap-1.5 overflow-hidden">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-sans font-semibold text-vault-dark text-base truncate max-w-[420px]">
                          {file.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-[11px] font-mono text-vault-muted font-medium">
                          {formatBytes(file.size)}
                        </span>
                      </div>

                      {/* Uploader Name Badge */}
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium font-sans ${
                          (file.uploaderName || '').toLowerCase().includes('pratyush')
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          <User className="w-3 h-3" />
                          <span>Uploaded by: <strong>{file.uploaderName || 'Pratyush Panda'}</strong></span>
                        </span>

                        {/* Lab Note / Comment Display */}
                        {file.comment && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-vault-accent shrink-0" />
                            <span className="text-xs text-vault-dark bg-amber-500/10 text-amber-900 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-sans italic">
                              &quot;{file.comment}&quot;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Exact Time and Relative Time */}
                  <div className="flex flex-col md:items-end justify-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-black/5">
                    <div className="flex items-center gap-1.5 text-vault-dark font-sans text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-vault-muted" />
                      <span>{formatExactTime(file.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-vault-muted font-sans mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Uploaded {formatRelativeTime(file.created_at)}</span>
                    </div>
                  </div>

                  {/* Right Column: Actions (Direct Download & Delete for Owner) */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleDownload(file.key, file.name)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white hover:bg-[#333] text-xs font-medium uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(file.key, file.name)}
                      className="w-9 h-9 rounded-full border border-black/10 hover:border-red-500/40 hover:bg-red-50 text-vault-muted hover:text-red-600 flex items-center justify-center transition-all cursor-pointer"
                      title="Delete old file from website"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Dashboard Footer with Pratyush Panda links */}
        <footer className="pt-6 mt-6 border-t border-black/10 flex items-center justify-between text-xs text-vault-muted max-md:flex-col max-md:gap-3">
          <div className="flex items-center gap-2">
            <span>LabDrop Owner Dashboard</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-black underline cursor-pointer"
            >
              Back to Home
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans font-medium text-vault-dark">
              Created by <span className="font-semibold">Pratyush Panda</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/pratyush-panda2006"
                target="_blank"
                rel="noopener noreferrer"
                title="Pratyush Panda on LinkedIn"
                className="w-7 h-7 rounded-full bg-white hover:bg-black/5 border border-black/10 flex items-center justify-center text-[#0A66C2] transition-all shadow-sm"
              >
                <LinkedinIcon />
              </a>

              <a
                href="https://github.com/Pratyush-Panda-2006"
                target="_blank"
                rel="noopener noreferrer"
                title="Pratyush Panda on GitHub"
                className="w-7 h-7 rounded-full bg-white hover:bg-black/5 border border-black/10 flex items-center justify-center text-black transition-all shadow-sm"
              >
                <GithubIcon />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
