import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/forgot-password', { email });
      // Send the user to the reset page and pass the email along
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request.');
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
        <div className="w-full max-w-[380px] rounded-[18px] bg-[rgba(15,23,42,0.82)] p-5 shadow-[0_24px_80px_rgba(14,165,233,0.14)] backdrop-blur-[18px] animate-fade-in-up">
          <div className="mb-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-400">AI Conversation Studio</p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight text-white">Forgot password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">Enter your email and we’ll send a 6-digit reset code.</p>
          </div>

          {error && <div className="mb-4 rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email address</label>
              <input
                type="email"
                required
                className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[48px] w-full rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-500 px-4 text-base font-semibold text-white shadow-[0_14px_40px_rgba(14,165,233,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(14,165,233,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">Remember your password? <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;