import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchConversations, fetchConversationMessages, deleteConversation } from '../api/aiApi';

const statusOptions = ['All'];

const ConversationHistory = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const data = await fetchConversationMessages(conversation.id);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      const data = await deleteConversation(id);
      if (data.success) {
        setConversations(conversations.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const filteredAndSorted = useMemo(() => {
    return [...conversations]
      .filter((item) => {
        const query = search.toLowerCase();
        const matchesSearch = item.id.toLowerCase().includes(query) || (item.title && item.title.toLowerCase().includes(query));
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [search, statusFilter, sortOrder, conversations]);

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
          {loading ? (
             <div className="py-10 text-center text-sky-400">Loading history...</div>
          ) : filteredAndSorted.length === 0 ? (
             <div className="py-10 text-center text-slate-500">No conversations found.</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-4 py-4">Conversation ID</th>
                  <th className="px-4 py-4">Title</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((conversation) => (
                  <tr key={conversation.id} className="rounded-[20px] bg-slate-900/80 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.4)] transition hover:bg-slate-900/90">
                    <td className="px-4 py-4 text-slate-200">{conversation.id.slice(0, 8)}...</td>
                    <td className="px-4 py-4 text-slate-200 max-w-[420px]">{conversation.title}</td>
                    <td className="px-4 py-4 text-slate-400">{new Date(conversation.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleViewConversation(conversation)}
                        className="rounded-3xl border border-white/10 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="rounded-3xl border border-white/10 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-lg"
          >
            <div className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Conversation details</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{selectedConversation.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedConversation(null)}
                  className="inline-flex h-11 items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="rounded-[24px] border border-white/10 bg-slate-900/90 p-5 min-h-[200px]">
                  {loadingMessages ? (
                     <div className="py-10 text-center text-sky-400">Loading messages...</div>
                  ) : messages.length === 0 ? (
                     <div className="py-10 text-center text-slate-500">No messages found.</div>
                  ) : (
                      messages.map((message, index) => (
                        <div key={index} className={`mb-4 rounded-[24px] p-4 ${message.role === 'ai' || message.role === 'assistant' ? 'bg-slate-800/90' : 'bg-slate-950/90 text-slate-100'}`}>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{message.role === 'ai' || message.role === 'assistant' ? 'AI' : 'User'}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-200 whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))
                  )}
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
