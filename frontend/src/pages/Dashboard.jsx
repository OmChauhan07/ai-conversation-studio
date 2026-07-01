import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Chat with AI', icon: '💬', path: '/chat' },
  { label: 'Conversation History', icon: '📜', path: '/history' },
  { label: 'Knowledge Sources', icon: '📄', path: '/knowledge' },
  { label: 'My Feedback', icon: '⭐', path: '/feedback' },
  { label: 'Profile', icon: '👤', path: '/profile' },
  { label: 'Logout', icon: '🚪' },
];

const summaryCards = [
  {
    label: 'Total Conversations',
    value: '14,820',
    description: 'Sessions processed this month',
    icon: '💬',
  },
  {
    label: 'Average AI Response Score',
    value: '92.4%',
    description: 'Quality score across recent replies',
    icon: '📈',
  },
  {
    label: 'Feedback Submitted',
    value: '312',
    description: 'Ratings collected from users',
    icon: '⭐',
  },
  {
    label: 'Knowledge Sources Used',
    value: '26',
    description: 'Documents referenced by AI',
    icon: '📄',
  },
];

const recentConversations = [
  {
    id: 'AC-00124',
    question: 'How can I improve response accuracy for policy questions?',
    score: '93%',
    status: 'Resolved',
    date: 'Jun 28, 2026',
  },
  {
    id: 'AC-00123',
    question: 'What is our preferred process for escalation?',
    score: '88%',
    status: 'Review',
    date: 'Jun 27, 2026',
  },
  {
    id: 'AC-00122',
    question: 'Summarize the compliance checklist for launch.',
    score: '95%',
    status: 'Resolved',
    date: 'Jun 26, 2026',
  },
  {
    id: 'AC-00121',
    question: 'List the key risks for AI hallucinations.',
    score: '89%',
    status: 'Pending',
    date: 'Jun 25, 2026',
  },
];

const chatMessages = [
  {
    id: 1,
    sender: 'ai',
    text: 'I recommend focusing on safe prompt templates, source attribution, and guardrails for policy-related questions.',
    confidence: '93%',
    source: 'Policy-Overview.pdf',
  },
  {
    id: 2,
    sender: 'user',
    text: 'Can you suggest a short governance summary for the team?',
  },
  {
    id: 3,
    sender: 'ai',
    text: 'Governance should include clear ownership, review checkpoints, and automated alerts for out-of-scope answers.',
    confidence: '89%',
    source: 'Governance-Report.docx',
  },
];

const suggestedPrompts = [
  'Show the latest audit highlights',
  'Compare response performance',
  'Summarize high-risk feedback',
];

const knowledgeSources = [
  {
    name: 'Policy Playbook',
    type: 'PDF',
    date: 'Jun 21, 2026',
  },
  {
    name: 'AI Testing Guide',
    type: 'DOCX',
    date: 'Jun 19, 2026',
  },
  {
    name: 'Support FAQ',
    type: 'Markdown',
    date: 'Jun 16, 2026',
  },
];

const feedbackEntries = [
  {
    conversation: 'How do I configure AI rate limiting?',
    rating: '5/5',
    comment: 'Very helpful and actionable.',
    date: 'Jun 28, 2026',
  },
  {
    conversation: 'Is the new policy summary accurate?',
    rating: '4/5',
    comment: 'Good detail, but could be shorter.',
    date: 'Jun 27, 2026',
  },
  {
    conversation: 'Suggest improvements for the audit workflow.',
    rating: '5/5',
    comment: 'Clear and professional guidance.',
    date: 'Jun 24, 2026',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Chat with AI');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const userName = user?.name || user?.email?.split('@')[0] || 'AI Partner';
  const chatPanelActive = activeSection === 'Chat with AI';

  const handleMenuItemClick = (item) => {
    if (item.label === 'Logout') {
      setLogoutModalOpen(true);
      return;
    }
    if (item.path) {
      navigate(item.path);
      return;
    }
    setActiveSection(item.label);
  };

  const handleCancelLogout = () => {
    setLogoutModalOpen(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.06),transparent_22%),linear-gradient(135deg,#040712_0%,#0c1225_40%,#090d18_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/8 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-blue-500/6 blur-3xl" />
        <div className="absolute left-1/2 bottom-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/4 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-white/10 bg-slate-950/95 px-6 py-6 backdrop-blur-xl transition duration-300 ease-out lg:static lg:translate-x-0`}>
          <div className="flex items-center justify-between gap-4 pb-6 lg:justify-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-400">AI Conversation Studio</p>
              <h2 className="text-xl font-semibold text-white">Workspace</h2>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = item.label === activeSection;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleMenuItemClick(item)}
                  className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/20 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'}`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-10 rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Need support?</p>
            <p className="mt-2 text-slate-400">Review AI behavior and keep responses aligned with company policy.</p>
          </div>
        </div>

        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden`} onClick={() => setSidebarOpen(false)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:bg-slate-900/90 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Dashboard</p>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">AI Conversation Studio</h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex md:flex-1 lg:max-w-xl">
              <div className="flex-1 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-[0_20px_80px_-60px_rgba(59,130,246,0.9)] backdrop-blur-xl">
                <input
                  type="search"
                  placeholder="Search conversations..."
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:bg-slate-900/90">
                🔔
              </button>
              <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-3 py-2 shadow-[0_20px_80px_-70px_rgba(59,130,246,0.9)] backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-lg text-sky-300">{userName.charAt(0).toUpperCase()}</div>
                <div className="hidden sm:block">
                  <p className="text-sm text-slate-400">Hello,</p>
                  <p className="font-semibold text-white">{userName}</p>
                </div>
              </div>
            </div>
          </div>

          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <motion.article
                key={card.label}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="rounded-[20px] border border-white/10 bg-slate-900/90 p-5 shadow-[0_35px_90px_-60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-3xl bg-sky-500/15 p-3 text-lg text-sky-300">{card.icon}</div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{card.label}</span>
                </div>
                <div className="mt-6">
                  <p className="text-3xl font-semibold text-white">{card.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{card.description}</p>
                </div>
              </motion.article>
            ))}
          </motion.section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.75fr_1.25fr]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Recent Conversations</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Latest chat activity</h2>
                </div>
                <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                  View all
                </button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="pb-3">Conversation ID</th>
                      <th className="pb-3">Question</th>
                      <th className="pb-3">Response Score</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentConversations.map((row) => (
                      <tr key={row.id} className="rounded-[20px] bg-slate-900/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.4)]">
                        <td className="px-3 py-4 text-slate-300">{row.id}</td>
                        <td className="px-3 py-4 text-slate-200 max-w-[320px]">{row.question}</td>
                        <td className="px-3 py-4 text-slate-200">{row.score}</td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${row.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Review' ? 'bg-sky-500/10 text-sky-200' : 'bg-amber-500/10 text-amber-200'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-400">{row.date}</td>
                        <td className="px-3 py-4">
                          <button className="rounded-2xl bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>

            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className={`rounded-[24px] border border-white/10 p-5 backdrop-blur-xl transition ${chatPanelActive ? 'bg-slate-900/90 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.65)] ring-1 ring-emerald-500/20' : 'bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)]'}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"></div>
                  <div>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Chat section</p>
                    {chatPanelActive && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">Active</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-900/90">🎙</button>
                    <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-900/90">📎</button>
                  </div>
                </div>

                <div className="space-y-4 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={message.sender === 'ai' ? 'rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.5)]' : 'self-end rounded-[28px] bg-slate-800/90 p-4 text-slate-100'}>
                      {message.sender === 'ai' ? (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                            <span>Confidence {message.confidence}</span>
                            <span>Source: {message.source}</span>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-slate-200">{message.text}</p>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                            <div className="flex flex-wrap items-center gap-2">
                              <button className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10">Copy</button>
                              <button className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10">👍</button>
                              <button className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10">👎</button>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.25em] text-sky-400">AI response</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm leading-7 text-slate-100">{message.text}</p>
                      )}
                    </div>
                  ))}
                </div>

              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-400">My feedback</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Submitted reviews</h2>
                  </div>
                  <button className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                    Export feedback
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500">
                        <th className="pb-3 pr-6">Conversation</th>
                        <th className="pb-3 pr-6">Rating</th>
                        <th className="pb-3 pr-6">Comment</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {feedbackEntries.map((entry) => (
                        <tr key={entry.date} className="hover:bg-slate-900/70 transition">
                          <td className="py-4 pr-6 text-slate-200">{entry.conversation}</td>
                          <td className="py-4 pr-6 text-slate-200">{entry.rating}</td>
                          <td className="py-4 pr-6 text-slate-400 max-w-[220px]">{entry.comment}</td>
                          <td className="py-4 text-slate-400">{entry.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Knowledge Sources</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Referenced documents</h2>
                </div>
                <button className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                  Add source
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {knowledgeSources.map((source) => (
                  <motion.article
                    key={source.name}
                    whileHover={{ y: -3 }}
                    className="rounded-[20px] border border-white/10 bg-slate-900/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{source.name}</p>
                        <p className="mt-2 text-sm text-slate-400">{source.type} • Uploaded {source.date}</p>
                      </div>
                      <div className="rounded-2xl bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-200">{source.type}</div>
                    </div>
                    <button className="mt-5 inline-flex rounded-3xl bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                      Preview
                    </button>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Profile</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Account details</h2>
                </div>
                <button className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                  Change password
                </button>
              </div>
              <div className="mt-6 space-y-4 rounded-[26px] border border-white/10 bg-slate-900/70 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-2xl text-sky-300">{userName.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-lg font-semibold text-white">{userName}</p>
                    <p className="text-sm text-slate-400">{user?.email || 'no-reply@ai.studio'}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/70 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Company</p>
                    <p className="mt-2 text-sm text-slate-100">AI Conversation Studio</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Role</p>
                    <p className="mt-2 text-sm text-slate-100">Product Operations</p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </main>

        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
            <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Confirm logout</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Are you sure you want to logout?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">You will be returned to the login screen and your session will end.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelLogout}
                  className="h-12 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="h-12 rounded-2xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
