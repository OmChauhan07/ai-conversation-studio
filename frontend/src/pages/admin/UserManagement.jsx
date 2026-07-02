import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    password: '',
  });
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/users');
      if (data.success) {
        // Map data to match existing UI
        const mappedUsers = data.data.map(u => ({
          ...u,
          status: u.status || 'Active',
          lastLogin: new Date(u.createdAt).toLocaleDateString(), // Mocking lastLogin with createdAt for now
          initials: getInitials(u.name || u.email || '?'),
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show success toast
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Get avatar color based on ID
  const getAvatarColor = (id) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    return colors[id % colors.length];
  };

  // Open modal for creating new user
  const handleAddUserClick = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'User', password: '' });
    setShowModal(true);
  };

  // Open modal for editing user
  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setShowModal(true);
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    if (!formData.email || !formData.role) {
      showSuccessToast('Please fill in email and role');
      return;
    }

    try {
      if (editingId) {
        // Update user role
        await api.patch(`/api/admin/users/${editingId}/role`, { role: formData.role });
        showSuccessToast(`User updated successfully!`);
      } else {
        // Mock create user since auth isn't exposing this directly yet, or use register endpoint
        showSuccessToast('User creation must go through standard registration for now');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showSuccessToast('Operation failed');
    }
  };

  // Delete user
  const handleDelete = async (user) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      showSuccessToast(`User deleted!`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showSuccessToast('Failed to delete user');
    }
  };

  // Suspend/Activate user
  const handleToggleSuspend = async (user) => {
    try {
      await api.patch(`/api/admin/users/${user.id}/status`);
      showSuccessToast(`User status toggled!`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      showSuccessToast('Failed to toggle status');
    }
  };

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white">User Management</h2>
          <p className="mt-1 text-sm text-slate-400">Manage platform users and permissions</p>
        </div>
        <button
          onClick={handleAddUserClick}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <motion.div
        className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Role</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Last Login</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-slate-900/50 transition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-semibold text-white`}
                        >
                          {user.initials}
                        </div>
                        <p className="font-medium text-white">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300 ring-1 ring-purple-400/20">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                          user.status === 'Active'
                            ? 'bg-green-500/15 text-green-300 ring-green-400/20'
                            : 'bg-red-500/15 text-red-300 ring-red-400/20'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="inline-flex items-center rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(user)}
                          className={`inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                            user.status === 'Active'
                              ? 'bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25'
                              : 'bg-green-500/15 text-green-300 hover:bg-green-500/25'
                          }`}
                          title={user.status === 'Active' ? 'Suspend' : 'Activate'}
                        >
                          {user.status === 'Active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center rounded-lg bg-red-500/15 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/25 hover:text-red-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400">No users found. Add your first user!</p>
          </div>
        )}
      </motion.div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="w-full max-w-2xl rounded-[24px] border border-white/10 bg-slate-950/95 p-8 shadow-[0_60px_180px_-60px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit User' : 'Add New User'}</h2>

            <div className="mt-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {editingId ? 'New Password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? 'Leave empty to keep existing password' : 'Enter password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-[12px] border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="rounded-[12px] bg-sky-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-600"
              >
                {editingId ? 'Update User' : 'Add User'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          className="fixed bottom-6 right-6 flex items-center gap-3 rounded-[12px] bg-green-500/90 px-6 py-4 text-sm font-medium text-white shadow-lg backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserManagement;
