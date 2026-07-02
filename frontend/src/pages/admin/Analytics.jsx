import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  // Mock KPI data
  const kpiCards = [
    {
      id: 1,
      label: 'Total Requests',
      value: '124,580',
      change: '+12.5%',
      icon: '📊',
      color: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 2,
      label: 'AI Accuracy',
      value: '94.2%',
      change: '+2.3%',
      icon: '🎯',
      color: 'from-green-500/20 to-emerald-500/20',
    },
    {
      id: 3,
      label: 'Avg Response Time',
      value: '1.24s',
      change: '-15.2%',
      icon: '⚡',
      color: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      id: 4,
      label: 'Active Users',
      value: '8,459',
      change: '+8.1%',
      icon: '👥',
      color: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  // Mock data for Daily Conversations
  const dailyConversationsData = [
    { date: 'Jun 1', conversations: 2400, users: 1200 },
    { date: 'Jun 5', conversations: 3210, users: 1410 },
    { date: 'Jun 10', conversations: 2290, users: 1290 },
    { date: 'Jun 15', conversations: 2000, users: 980 },
    { date: 'Jun 20', conversations: 2181, users: 1290 },
    { date: 'Jun 25', conversations: 2500, users: 1300 },
    { date: 'Jun 30', conversations: 2100, users: 1200 },
  ];

  // Mock data for AI Accuracy Trend
  const accuracyTrendData = [
    { date: 'Jun 1', accuracy: 88.5 },
    { date: 'Jun 5', accuracy: 89.2 },
    { date: 'Jun 10', accuracy: 90.1 },
    { date: 'Jun 15', accuracy: 91.3 },
    { date: 'Jun 20', accuracy: 92.8 },
    { date: 'Jun 25', accuracy: 93.5 },
    { date: 'Jun 30', accuracy: 94.2 },
  ];

  // Mock data for User Growth
  const userGrowthData = [
    { month: 'Jan', users: 2400 },
    { month: 'Feb', users: 3210 },
    { month: 'Mar', users: 4290 },
    { month: 'Apr', users: 5200 },
    { month: 'May', users: 6810 },
    { month: 'Jun', users: 8459 },
  ];

  // Mock data for Most Used Prompts
  const mostUsedPromptsData = [
    { name: 'Summarization', value: 2845, percentage: 28 },
    { name: 'FAQ Generator', value: 1920, percentage: 19 },
    { name: 'Safety Check', value: 1680, percentage: 17 },
    { name: 'Email Draft', value: 1540, percentage: 15 },
    { name: 'Other', value: 2015, percentage: 21 },
  ];

  // Colors for pie chart
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-white">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Monitor platform performance and user engagement</p>
      </div>

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
                <p className="mt-3 text-xs font-medium text-green-400">{card.change} vs last month</p>
              </div>
              <div className="text-4xl opacity-80 group-hover:opacity-100 transition">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Conversations Chart */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white">Daily Conversations</h3>
          <p className="mt-1 text-sm text-slate-400">Conversation volume and user engagement</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyConversationsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
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
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Accuracy Trend Chart */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white">AI Accuracy Trend</h3>
          <p className="mt-1 text-sm text-slate-400">Model accuracy improvement over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis domain={[80, 100]} stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                fill="url(#colorAccuracy)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white">User Growth</h3>
          <p className="mt-1 text-sm text-slate-400">Active users growth trend</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="users" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Used Prompts Chart */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white">Most Used Prompts</h3>
          <p className="mt-1 text-sm text-slate-400">Prompt usage distribution</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mostUsedPromptsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mostUsedPromptsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-white">Summary</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Avg Conversations/Day</p>
            <p className="text-2xl font-semibold text-white">2,337</p>
            <p className="text-xs text-green-400">↑ 5.2% from last week</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">System Uptime</p>
            <p className="text-2xl font-semibold text-white">99.98%</p>
            <p className="text-xs text-green-400">Excellent performance</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Avg Session Duration</p>
            <p className="text-2xl font-semibold text-white">12m 34s</p>
            <p className="text-xs text-green-400">↑ 2.1% from last week</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
