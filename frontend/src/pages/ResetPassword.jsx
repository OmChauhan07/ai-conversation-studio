import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [formData, setFormData] = useState({ resetOtp: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Kick user back if they try to access this page directly without an email
  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/reset-password', { 
        email, 
        resetOtp: formData.resetOtp, 
        newPassword: formData.newPassword 
      });
      
      setSuccess('Password successfully reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code or password.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Set New Password</h2>
      <p className="text-sm text-center text-gray-600 mb-6">
        Code sent to <strong>{email}</strong>
      </p>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Reset Code</label>
          <input
            type="text"
            required
            maxLength="6"
            className="w-full px-4 py-2 border border-gray-300 rounded text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.resetOtp}
            onChange={(e) => setFormData({ ...formData, resetOtp: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            required
            minLength="6"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;