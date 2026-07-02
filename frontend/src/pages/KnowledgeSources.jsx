import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const mockSources = [
  {
    id: 'KS-001',
    name: 'Policy Playbook.pdf',
    type: 'PDF',
    date: 'Jun 21, 2026',
    icon: '📄',
  },
  {
    id: 'KS-002',
    name: 'AI Testing Guide.docx',
    type: 'DOCX',
    date: 'Jun 19, 2026',
    icon: '📄',
  },
  {
    id: 'KS-003',
    name: 'Support FAQ.md',
    type: 'Markdown',
    date: 'Jun 16, 2026',
    icon: '📄',
  },
  {
    id: 'KS-004',
    name: 'Compliance Matrix.xlsx',
    type: 'Excel',
    date: 'Jun 14, 2026',
    icon: '📊',
  },
];

const KnowledgeSources = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [sources, setSources] = useState(mockSources);
  const [previewSource, setPreviewSource] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  const filteredSources = useMemo(
    () =>
      sources.filter((source) =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, sources],
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileSelection = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const newSource = {
      id: `KS-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop().toUpperCase(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      icon: '📄',
      content: `Preview content for ${file.name}.`,
    };

    setSources((prev) => [newSource, ...prev]);
    setUploadMessage(`Uploaded ${file.name} successfully.`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFileSelection(event.dataTransfer.files);
  };

  const handleUploadButton = () => {
    fileInputRef.current?.click();
  };

  const handlePreview = (source) => {
    setPreviewSource(source);
  };

  const handleClosePreview = () => {
    setPreviewSource(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_22%),linear-gradient(180deg,#040612_0%,#090f1d_45%,#07101b_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 active:bg-slate-900"
              >
                ← Back
              </button>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Knowledge Sources</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Manage your uploaded documents</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Search, preview, and download documents used by the AI assistant.
              </p>
              {uploadMessage && <p className="mt-3 text-sm text-emerald-300">{uploadMessage}</p>}
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.md,.xlsx"
                className="hidden"
                onChange={(event) => handleFileSelection(event.target.files)}
              />
              <button
                type="button"
                onClick={handleUploadButton}
                className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="sr-only" htmlFor="knowledge-search">Search documents</label>
            <input
              id="knowledge-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search documents by name or type"
              className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
            />
          </div>
        </div>

        <div
          className={`mb-6 rounded-[28px] border border-dashed ${dragActive ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/20 bg-slate-950/90'} p-8 text-center transition`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-lg font-semibold text-white">Drag and drop documents here</p>
          <p className="mt-2 text-sm text-slate-400">Or click Upload Document to add new files.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSources.map((source) => (
            <motion.article
              key={source.id}
              whileHover={{ y: -4 }}
              className="rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900/80 text-3xl">
                  {source.icon}
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-sky-300">
                  {source.type}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-lg font-semibold text-white">{source.name}</p>
                <p className="text-sm text-slate-400">Uploaded {source.date}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePreview(source)}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/95"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => window.alert(`Downloading ${source.name} is not supported in this demo.`)}
                  className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Download
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {previewSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
            <div className="w-full max-w-2xl rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Document preview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{previewSource.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 rounded-[20px] border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-200">
                <p className="text-sm text-slate-400">File type: {previewSource.type}</p>
                <p className="mt-4 whitespace-pre-wrap">{previewSource.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeSources;
