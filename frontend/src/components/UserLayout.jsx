import { useContext, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChartLine, FaComments, FaHistory, FaBookOpen, FaStar, FaUserCircle, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: FaChartLine },
  { label: 'Chat with AI', path: '/chat', icon: FaComments },
  { label: 'Conversation History', path: '/history', icon: FaHistory },
  { label: 'Knowledge Sources', path: '/knowledge', icon: FaBookOpen },
  { label: 'My Feedback', path: '/feedback', icon: FaStar },
  { label: 'Profile', path: '/profile', icon: FaUserCircle },
];

const UserLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userName = user?.name || user?.email?.split('@')[0] || 'AI Partner';
  const activePage = menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard';

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_20%),linear-gradient(135deg,#040712_0%,#0c1225_40%,#090d18_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-1/2 bottom-12 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/6 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-slate-950/95 px-4 py-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
          <div className="mb-8 flex items-center justify-between gap-3 px-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Welcome</p>
              <h1 className="mt-2 text-xl font-semibold text-white">AI Studio</h1>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-200 transition hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-200 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`
                  }
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-900/80 text-slate-300 transition group-hover:text-sky-300">
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="font-semibold text-white">Productivity tip</p>
            <p className="mt-2 text-slate-400">Use the chat to ask specific questions and review the AI confidence score after each response.</p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col lg:ml-72">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl shadow-sm shadow-slate-950/20">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-sky-400">User Dashboard</p>
                <h2 className="text-xl font-semibold text-white">{activePage}</h2>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
              <div className="hidden flex-1 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-200 shadow-[0_20px_80px_-70px_rgba(59,130,246,0.9)] md:flex">
                <FaSearch className="mr-3 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search conversations, docs, feedback..."
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800"
              >
                <FaBell />
              </button>
              <div className="hidden items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-3 py-2 text-slate-200 shadow-[0_20px_80px_-70px_rgba(59,130,246,0.9)] sm:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sky-300 text-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="font-semibold text-white">{userName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="hidden rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 sm:inline-flex"
              >
                Log out
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-5 py-4 md:px-6 lg:px-7 xl:px-9">
            <Outlet />
          </main>
        </div>
      </div>

      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.9)]"
          >
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Confirm logout</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Are you sure you want to logout?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">You will be returned to the login screen and your session information will be cleared.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
