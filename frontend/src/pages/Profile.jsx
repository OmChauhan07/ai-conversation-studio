import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
  });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        setFormValues({ name: response.data.data.name || '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1D4ED8&color=ffffff`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOpenModal = () => {
    setFormValues({
      name: profile.name,
    });
    setSaveError('');
    setSaveSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenPasswordModal = () => {
    setPasswordValues({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
    setIsPasswordModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaveError('');
      const response = await api.patch('/profile', { name: formValues.name });
      if (response.data.success) {
        setSaveSuccess('Profile updated successfully.');
        await fetchProfile(); // Refresh profile data
        setIsModalOpen(false);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!passwordValues.currentPassword || !passwordValues.newPassword || !passwordValues.confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      setPasswordSuccess('');
      return;
    }
    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      setPasswordSuccess('');
      return;
    }
    if (passwordValues.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      setPasswordSuccess('');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('Password changed successfully.');
    setPasswordValues({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_22%),linear-gradient(135deg,#040712_0%,#0c1225_40%,#090d18_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-2rem] top-8 h-72 w-72 rounded-full bg-sky-500/8 blur-3xl" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[24px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                ← Back
              </button>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Profile</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Your account details</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Manage your account information, security, and profile preferences from one place.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 text-sm font-semibold text-sky-200 transition hover:border-sky-400/30 hover:bg-sky-500/15"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900/95 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-sky-500/20 bg-slate-800">
                <img src={profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">{profile.name}</p>
                <p className="text-sm text-slate-400">{profile.role}</p>
              </div>
            </div>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                <p className="mt-2 text-sm text-slate-100">{profile.email}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Role</p>
                <p className="mt-2 text-sm text-slate-100">{profile.role}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Joined</p>
                <p className="mt-2 text-sm text-slate-100">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.45)]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Full Name</p>
                <p className="mt-2 text-sm text-slate-100">{profile.name}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                <p className="mt-2 text-sm text-slate-100">{profile.email}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Company Name</p>
                <p className="mt-2 text-sm text-slate-100">{profile.company}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">User Role</p>
                <p className="mt-2 text-sm text-slate-100">{profile.role}</p>
              </div>
            </div>
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
            <div className="w-full max-w-xl rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Edit profile</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Update your details</h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    className="h-[46px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="h-12 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
            <div className="w-full max-w-xl rounded-[24px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.18)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Security</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Change your password</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handlePasswordSave} className="mt-6 space-y-5">
                {passwordError && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div>}
                {passwordSuccess && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordSuccess}</div>}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordValues.currentPassword}
                    onChange={handlePasswordChange}
                    className="h-[46px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordValues.newPassword}
                    onChange={handlePasswordChange}
                    className="h-[46px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordValues.confirmPassword}
                    onChange={handlePasswordChange}
                    className="h-[46px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="h-12 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400"
                  >
                    Save password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
