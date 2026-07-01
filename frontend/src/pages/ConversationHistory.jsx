import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const mockConversations = [
  {
    id: 'AC-00124',
    question: 'How can I improve response accuracy for policy questions?',
    date: '2026-06-28',
    aiScore: '93%',
    status: 'Resolved',
    conversation: [
      { sender: 'user', text: 'How can I improve response accuracy for policy questions?' },
      { sender: 'ai', text: 'Focus on clear prompt structure, cite your sources, and add a relevance check step to your review process.' },
    ],
  },
  {
    id: 'AC-00123',
    question: 'What is our preferred process for escalation?',
    date: '2026-06-27',
    aiScore: '88%',
    status: 'Review',
    conversation: [
      { sender: 'user', text: 'What is our preferred process for escalation?' },
      { sender: 'ai', text: 'Use the incident tracker, notify the policy team, and route approvals through the compliance dashboard.' },
    ],
  },
  {
    id: 'AC-00122',
    question: 'Summarize the compliance checklist for launch.',
    date: '2026-06-26',
    aiScore: '95%',
    status: 'Resolved',
    conversation: [
      { sender: 'user', text: 'Summarize the compliance checklist for launch.' },
      { sender: 'ai', text: 'Ensure controls are in place for data privacy, risk review, model guardrails, and user consent validation.' },
    ],
  },
  {
    id: 'AC-00121',
    question: 'List the key risks for AI hallucinations.',
    date: '2026-06-25',
    aiScore: '89%',
    status: 'Pending',
    conversation: [
      { sender: 'user', text: 'List the key risks for AI hallucinations.' },
      { sender: 'ai', text: 'Hallucinations can impact trust, compliance, and decision accuracy. Mitigate them with grounding, verification, and human review.' },
    ],
  },
];

const statusOptions = ['All', 'Resolved', 'Review', 'Pending'];

const ConversationHistory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedConversation, setSelectedConversation] = useState(null);

  const filteredAndSorted = useMemo(() => {
    return [...mockConversations]
      .filter((item) => {
        const query = search.toLowerCase();
        const matchesSearch = item.id.toLowerCase().includes(query) || item.question.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [search, statusFilter, sortOrder]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_22%),linear-gradient(180deg,#040612_0%,#090f1d_45%,#07101b_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            ← Back
          </button>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Conversation History</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Review all past AI interactions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Search, filter, and sort your previous conversations. Click any record to review the full dialogue.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <label className="sr-only" htmlFor="history-search">Search conversations</label>
                <input
                  id="history-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by ID or question"
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="status-filter">Filter status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-950 text-slate-100">
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder((current) => (current === 'desc' ? 'asc' : 'desc'))}
                  className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Sort by date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">Results</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">Showing {filteredAndSorted.length} conversations</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="px-4 py-4">Conversation ID</th>
                <th className="px-4 py-4">Question</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">AI Score</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((conversation) => (
                <tr key={conversation.id} className="rounded-[20px] bg-slate-900/80 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.4)] transition hover:bg-slate-900/90">
                  <td className="px-4 py-4 text-slate-200">{conversation.id}</td>
                  <td className="px-4 py-4 text-slate-200 max-w-[420px]">{conversation.question}</td>
                  <td className="px-4 py-4 text-slate-400">{conversation.date}</td>
                  <td className="px-4 py-4 text-slate-200">{conversation.aiScore}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${conversation.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-200' : conversation.status === 'Review' ? 'bg-sky-500/10 text-sky-200' : 'bg-amber-500/10 text-amber-200'}`}>
                      {conversation.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(conversation)}
                      className="rounded-3xl border border-white/10 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
                    >
                      View Conversation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-lg"
          >
            <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Conversation details</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{selectedConversation.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="inline-flex h-11 items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4 px-6 py-6">
                <p className="text-sm text-slate-400">Question: <span className="font-medium text-slate-100">{selectedConversation.question}</span></p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Date</p>
                    <p className="mt-2 font-semibold text-white">{selectedConversation.date}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">AI Score</p>
                    <p className="mt-2 font-semibold text-white">{selectedConversation.aiScore}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Status</p>
                    <p className="mt-2 font-semibold text-white">{selectedConversation.status}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-slate-900/90 p-5">
                  {selectedConversation.conversation.map((message, index) => (
                    <div key={index} className={`mb-4 rounded-[24px] p-4 ${message.sender === 'ai' ? 'bg-slate-800/90' : 'bg-slate-950/90 text-slate-100'}`}>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{message.sender === 'ai' ? 'AI' : 'User'}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">{message.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
