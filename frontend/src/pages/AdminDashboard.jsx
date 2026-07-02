import { useContext, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const menuItems = [
  { name: 'Knowledge Base', to: 'knowledge' },
  { name: 'Prompt Testing', to: 'prompt-testing' },
  { name: 'Analytics', to: 'analytics' },
  { name: 'User Management', to: 'users' },
  { name: 'Settings', to: 'settings' },
];

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const activeLabel = menuItems.find((item) => location.pathname.endsWith(item.to))?.name || 'Overview';

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-y-0 left-0 z-20 flex w-full max-w-full">
        <aside
          className={`fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}
        >
          <div className="flex h-20 items-center justify-between gap-2 border-b border-white/10 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20">
                AI
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Studio</p>
                  <h2 className="text-lg font-semibold text-white">Admin</h2>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800"
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20'
                        : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
                    }`
                  }
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-400 transition group-hover:text-sky-300">
                    {item.name.slice(0, 2).toUpperCase()}
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center justify-center rounded-2xl bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              {collapsed ? '⏻' : 'Logout'}
            </button>
          </div>
        </aside>

        <div className={`ml-[calc(18rem)] flex min-h-screen w-full flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'}`}>
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/85 px-6 backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">Admin dashboard</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{activeLabel}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 shadow-sm shadow-slate-950/20 sm:flex">
                <div className="mr-3 h-3 w-3 rounded-full bg-emerald-400" />
                <span>Online</span>
              </div>
              <div className="rounded-2xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-sm shadow-slate-950/20">
                {user?.email || 'admin@example.com'}
              </div>
            </div>
          </header>

          <main className="relative flex-1 overflow-auto px-6 py-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="min-h-[calc(100vh-5rem)] rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.08)]"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Confirm Logout</p>
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
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
