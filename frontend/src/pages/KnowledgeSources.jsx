import { useMemo, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const filteredSources = useMemo(
    () =>
      mockSources.filter((source) =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    // Mock upload - no backend implementation.
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_22%),linear-gradient(180deg,#040612_0%,#090f1d_45%,#07101b_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Knowledge Sources</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Manage your uploaded documents</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Search, preview, and download documents used by the AI assistant.
              </p>
            </div>
            <button className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
              Upload Document
            </button>
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
                <button className="inline-flex items-center justify-center rounded-3xl bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/95">
                  Preview
                </button>
                <button className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                  Download
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeSources;
