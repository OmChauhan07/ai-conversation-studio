import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { fetchAdminStats } from '../api/aiApi';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total_conversations: '0',
    average_score: '0%',
    total_feedback: '0',
    total_sources: '0'
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.name || user?.email?.split('@')[0] || 'AI Partner';

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        if (data.success) {
          setStats(data.stats);
          setRecentConversations(data.recent_conversations || []);
          setFeedbackEntries(data.feedback_entries || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

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

  const summaryCards = [
    { label: 'Total Conversations', value: stats.total_conversations, description: 'Sessions processed', icon: '💬' },
    { label: 'Average AI Response Score', value: stats.average_score, description: 'Quality score across replies', icon: '📈' },
    { label: 'Feedback Submitted', value: stats.total_feedback, description: 'Ratings collected from users', icon: '⭐' },
    { label: 'Knowledge Sources Used', value: stats.total_sources, description: 'Documents referenced by AI', icon: '📄' },
  ];

  return (
    <div className="text-slate-100">
      <main className="mx-auto max-w-[1200px] w-full">
          {loading ? (
             <div className="flex items-center justify-center py-20 text-sky-400">Loading dashboard...</div>
          ) : (
            <>
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
                    <button onClick={() => navigate('/history')} className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900">
                      View all
                    </button>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    {recentConversations.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">No recent conversations found.</div>
                    ) : (
                      <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                        <thead>
                          <tr className="text-slate-500">
                            <th className="pb-3">Conversation ID</th>
                            <th className="pb-3">Title</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {recentConversations.map((row) => (
                            <tr key={row.id} className="rounded-[20px] bg-slate-900/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.4)]">
                              <td className="px-3 py-4 text-slate-300">{row.id.slice(0, 8)}...</td>
                              <td className="px-3 py-4 text-slate-200 max-w-[320px]">{row.question}</td>
                              <td className="px-3 py-4 text-slate-400">{row.date}</td>
                              <td className="px-3 py-4">
                                <button onClick={() => navigate('/history')} className="rounded-2xl bg-sky-500/15 px-3 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20">
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.section>
                
                <motion.section
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="rounded-[24px] border border-white/10 bg-slate-950/95 p-5 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-sky-400">My feedback</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">Submitted reviews</h2>
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    {feedbackEntries.length === 0 ? (
                         <div className="py-8 text-center text-slate-400">No feedback submitted yet.</div>
                    ) : (
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
                          {feedbackEntries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/70 transition">
                              <td className="py-4 pr-6 text-slate-200">{entry.conversation}</td>
                              <td className="py-4 pr-6 text-slate-200">{entry.rating}</td>
                              <td className="py-4 pr-6 text-slate-400 max-w-[220px]">{entry.comment}</td>
                              <td className="py-4 text-slate-400">{entry.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </motion.section>
              </div>
            </>
          )}
        </main>
    </div>
  );
};

export default Dashboard;
