import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', company: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/register', formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[linear-gradient(135deg,#020617_0%,#0B1120_40%,#111827_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[80px]" />
      </div>
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-6">
        <div className="w-full max-w-[400px] rounded-[18px] bg-[rgba(15,23,42,0.82)] p-5 shadow-[0_24px_80px_rgba(14,165,233,0.14)] backdrop-blur-[18px] animate-fade-in-up">
          <div className="mb-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">AI Conversation Studio</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">Create account</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Sign up to access prompt testing, analytics, and governance.</p>
          </div>

          {error && <div className="mb-4 rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                required
                className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Work Email</label>
              <input
                type="email"
                required
                className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Company</label>
                <input
                  type="text"
                  className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-50 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                >
          
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  
                </select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[48px] w-full rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-500 px-4 text-base font-semibold text-white shadow-[0_14px_40px_rgba(14,165,233,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(14,165,233,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;