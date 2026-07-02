import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAdminStats, fetchConversations } from '../../api/aiApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState({
    total_conversations: '0',
    average_score: '0%',
    total_feedback: '0',
    total_sources: '0'
  });
  
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await fetchAdminStats();
        if (statsRes.success) {
          setStats(statsRes.stats);
        }

        const convsRes = await fetchConversations();
        if (convsRes.success) {
          const conversations = convsRes.conversations || [];
          // Group by date for the chart
          const grouped = {};
          conversations.forEach(c => {
            if (c.createdAt) {
              const date = new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              grouped[date] = (grouped[date] || 0) + 1;
            }
          });
          const chartData = Object.keys(grouped).map(date => ({
            date,
            conversations: grouped[date]
          })).reverse(); // Assuming it came descending, we want chronological for chart

          setDailyData(chartData);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const kpiCards = [
    {
      id: 1,
      label: 'Total Conversations',
      value: stats.total_conversations,
      change: 'Live Data',
      icon: '📊',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 2,
      label: 'AI Average Score',
      value: stats.average_score,
      change: 'Live Data',
      icon: '🎯',
      color: 'from-green-500/20 to-emerald-500/20',
    },
    {
      id: 3,
      label: 'Total Feedback',
      value: stats.total_feedback,
      change: 'Live Data',
      icon: '⭐',
      color: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      id: 4,
      label: 'Knowledge Sources',
      value: stats.total_sources,
      change: 'Live Data',
      icon: '📄',
      color: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-white">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Monitor platform performance and user engagement</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sky-400">Loading live analytics...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`group rounded-[20px] border border-white/10 bg-gradient-to-br ${card.color} p-6 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] transition duration-300 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] hover:border-white/20`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
                    <p className="mt-3 text-xs font-medium text-green-400">{card.change}</p>
                  </div>
                  <div className="text-4xl opacity-80 group-hover:opacity-100 transition">{card.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-1">
            {/* Daily Conversations Chart */}
            <motion.div
              className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white">Daily Conversations</h3>
              <p className="mt-1 text-sm text-slate-400">Conversation volume over time</p>
              
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} className="mt-6">
                  <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ fill: '#0ea5e9', r: 4 }}
                      activeDot={{ r: 6 }}
                      fillOpacity={1}
                      fill="url(#colorConv)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500">
                  Not enough data to display chart.
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Analytics;
