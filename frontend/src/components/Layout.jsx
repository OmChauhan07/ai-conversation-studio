import { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard', role: 'USER' },
  { label: 'Chat with AI', icon: '💬', path: '/chat', role: 'USER' },
  { label: 'Conversation History', icon: '📜', path: '/history', role: 'USER' },
  { label: 'Knowledge Base', icon: '📚', path: '/knowledge', role: 'USER' },
  { label: 'My Feedback', icon: '⭐', path: '/feedback', role: 'USER' },
  { label: 'Profile', icon: '👤', path: '/profile', role: 'USER' },
  { label: 'Admin Dashboard', icon: '⚙️', path: '/admin/dashboard', role: 'ADMIN' },
];

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuItemClick = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const userName = user?.name || user?.email || 'User';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.06),transparent_22%),linear-gradient(135deg,#040712_0%,#0c1225_40%,#090d18_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/8 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-blue-500/6 blur-3xl" />
        <div className="absolute left-1/2 bottom-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/4 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto border-r border-white/10 bg-slate-950/95 px-6 py-6 backdrop-blur-xl transition duration-300 ease-out lg:static lg:translate-x-0`}>
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
              ✕
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              if (item.role === 'ADMIN' && user?.role !== 'ADMIN') return null;
              
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive ? 'bg-sky-500/20 text-sky-300 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-8 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              <span className="text-base">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile backdrop */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden`} onClick={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden max-h-screen">
          <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/50 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-slate-200 transition hover:bg-slate-900/90 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            </div>
            
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-3 py-2 shadow-[0_20px_80px_-70px_rgba(59,130,246,0.9)] backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-sky-300">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">Hello,</p>
                <p className="text-sm font-semibold text-white">{userName}</p>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <Outlet />
          </main>
        </div>

        {/* Logout Modal */}
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)]">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Confirm logout</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Are you sure you want to logout?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">You will be returned to the login screen and your session will end.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(false)}
                  className="h-12 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLogoutModalOpen(false);
                    logout();
                  }}
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

export default Layout;
