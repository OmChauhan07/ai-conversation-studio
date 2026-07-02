import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { getDocuments } from '../api/aiApi';

const menuItems = [ 
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Chat with AI', icon: '💬', path: '/chat' },
  { label: 'Conversation History', icon: '📜', path: '/history' },
  { label: 'My Feedback', icon: '⭐', path: '/feedback' },
  { label: 'Profile', icon: '👤', path: '/profile' },
  { label: 'Logout', icon: '🚪' },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [chatPanelActive, setChatPanelActive] = useState(true);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const userName = user?.name || user?.email?.split('@')[0] || 'AI Partner';

  // Fetch knowledge sources from AI backend
  useEffect(() => {
    fetchKnowledgeSources();
  }, []);

  const fetchKnowledgeSources = async () => {
    try {
      setLoadingKnowledge(true);
      const response = await getDocuments();
      if (response.success && response.documents) {
        const formattedDocs = response.documents.slice(0, 3).map((doc) => ({
          name: doc.filename || doc.name,
          type: (doc.filename || doc.name).split('.').pop().toUpperCase(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }));
        setKnowledgeSources(formattedDocs);
      }
    } catch (err) {
      console.error('Error fetching knowledge sources:', err);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  const handleMenuItemClick = (item) => {
    if (item.label === 'Logout') {
      setLogoutModalOpen(true);
      return;
    }
    if (item.path) {
      navigate(item.path);
      return;
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalOpen(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    window.location.href = '/login';
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
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleMenuItemClick(item)}
                  className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition text-slate-300 hover:bg-slate-900/80 hover:text-white`}
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

          <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-[20px] border border-white/10 bg-slate-900/90 p-8 shadow-[0_35px_90px_-60px_rgba(0,0,0,0.65)] backdrop-blur-xl text-center">
            <p className="text-sm text-slate-400">Dashboard analytics not yet implemented</p>
            <p className="mt-2 text-xs text-slate-500">Connect to analytics API when available</p>
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

              <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-900/70 p-8 text-center">
                <p className="text-sm text-slate-400">Conversation history API not yet implemented</p>
                <p className="mt-2 text-xs text-slate-500">Use the Chat page to interact with the AI</p>
              </div>
            </motion.section>

            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
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

                <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-900/70 p-8 text-center">
                  <p className="text-sm text-slate-400">Feedback API not yet implemented</p>
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
                <button 
                  onClick={() => navigate('/knowledge')}
                  className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
                >
                  View all
                </button>
              </div>

              {loadingKnowledge ? (
                <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-900/70 p-8 text-center">
                  <p className="text-sm text-slate-400">Loading documents...</p>
                </div>
              ) : knowledgeSources.length > 0 ? (
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
              ) : (
                <div className="mt-5 rounded-[20px] border border-white/10 bg-slate-900/70 p-8 text-center">
                  <p className="text-sm text-slate-400">No documents uploaded yet</p>
                  <button 
                    onClick={() => navigate('/knowledge')}
                    className="mt-3 inline-flex rounded-3xl bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/25"
                  >
                    Upload documents
                  </button>
                </div>
              )}
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
                <button 
                  onClick={() => navigate('/profile')}
                  className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
                >
                  View profile
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
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Role</p>
                    <p className="mt-2 text-sm text-slate-100">{user?.role || 'User'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
                    <p className="mt-2 text-sm text-slate-100">Active</p>
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
