import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Retrieve email from navigation state

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If someone tries to access this page directly without registering first, kick them out
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/verify-otp', { email, otp });
      setSuccess('Email verified successfully! Redirecting to login...');
      
      // Delay redirection slightly so the user sees the success message
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // Prevents flashing before redirect

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[linear-gradient(135deg,#020617_0%,#0B1120_40%,#111827_100%)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[80px]" />
      </div>
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-6">
        <div className="w-full max-w-[380px] rounded-[18px] bg-[rgba(15,23,42,0.82)] p-5 shadow-[0_24px_80px_rgba(14,165,233,0.14)] backdrop-blur-[18px] animate-fade-in-up">
          <div className="mb-4 text-center">
            <p className="text-[18px] font-semibold uppercase tracking-[0.35em] text-sky-400">AI Conversation Studio</p>
            <h1 className="mt-3 text-[18px] font-semibold leading-tight text-white">Verify your email</h1>
            <p className="mt-2 text-[18px] leading-6 text-slate-400">We sent a 6-digit code to <strong className="text-white">{email}</strong></p>
          </div>

          {error && <div className="mb-3 rounded-[14px] bg-red-50 px-4 py-3 text-[18px] text-red-700">{error}</div>}
          {success && <div className="mb-3 rounded-[14px] bg-emerald-50 px-4 py-3 text-[18px] text-emerald-700">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="Enter 6-digit code"
                className="h-[46px] w-full rounded-[12px] bg-slate-950/85 px-4 text-center text-[18px] tracking-[0.35em] text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="h-[48px] w-full rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-500 px-4 text-[18px] font-semibold text-white shadow-[0_14px_40px_rgba(14,165,233,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(14,165,233,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;