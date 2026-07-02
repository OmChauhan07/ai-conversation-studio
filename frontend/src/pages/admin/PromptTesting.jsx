import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt } from '../../api/aiApi';

const PromptTesting = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: '',
  });
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const data = await fetchPrompts();
      if (data.success) {
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error("Failed to load prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', template: '' });
    setShowModal(true);
  };

  const handleEditClick = (prompt) => {
    setEditingId(prompt.id);
    setFormData({
      name: prompt.name,
      description: prompt.description,
      template: prompt.content,
    });
    setShowModal(true);
  };

  const handleSavePrompt = async () => {
    if (!formData.name || !formData.description || !formData.template) {
      showSuccessToast('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        const data = await updatePrompt(editingId, {
          name: formData.name,
          description: formData.description,
          content: formData.template
        });
        if (data.success) {
          showSuccessToast(`Prompt "${formData.name}" updated successfully!`);
        }
      } else {
        const data = await createPrompt({
          name: formData.name,
          description: formData.description,
          content: formData.template
        });
        if (data.success) {
          showSuccessToast(`Prompt "${formData.name}" created successfully!`);
        }
      }
      await loadPrompts();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      showSuccessToast('Error saving prompt');
    }

    setShowModal(false);
  };

  const handleDuplicate = async (prompt) => {
    try {
      const data = await createPrompt({
        name: `${prompt.name} (Copy)`,
        description: prompt.description,
        content: prompt.content
      });
      if (data.success) {
        showSuccessToast(`Prompt "${prompt.name}" duplicated!`);
        await loadPrompts();
      }
    } catch (error) {
       console.error("Failed to duplicate:", error);
    }
  };

  const handleDelete = async (prompt) => {
    if (!window.confirm(`Are you sure you want to delete ${prompt.name}?`)) return;
    try {
      const data = await deletePrompt(prompt.id);
      if (data.success) {
        showSuccessToast(`Prompt "${prompt.name}" deleted!`);
        await loadPrompts();
      }
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  const handleToggleStatus = async (prompt) => {
    try {
      const newStatus = !prompt.isFavorite;
      const data = await updatePrompt(prompt.id, { isFavorite: newStatus });
      if (data.success) {
        showSuccessToast(`Prompt "${prompt.name}" is now ${newStatus ? 'Favorite' : 'Unfavorited'}!`);
        await loadPrompts();
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white">Prompt Management</h2>
          <p className="mt-1 text-sm text-slate-400">Create and manage AI prompts</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          + Create Prompt
        </button>
      </div>

      {/* Prompts Table */}
      <motion.div
        className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
             <div className="px-6 py-12 text-center text-sky-400">Loading prompts...</div>
        ) : prompts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-300">Prompt Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Description</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Favorite</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Last Updated</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt, index) => (
                  <motion.tr
                    key={prompt.id}
                    className="border-b border-white/5 hover:bg-slate-900/50 transition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{prompt.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs text-slate-400">{prompt.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                          prompt.isFavorite
                            ? 'bg-green-500/15 text-green-300 ring-green-400/20'
                            : 'bg-slate-500/15 text-slate-300 ring-slate-400/20'
                        }`}
                      >
                        {prompt.isFavorite ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(prompt.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(prompt)}
                          className="inline-flex items-center rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDuplicate(prompt)}
                          className="inline-flex items-center rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleToggleStatus(prompt)}
                          className={`inline-flex items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                            !prompt.isFavorite
                              ? 'bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500/25'
                              : 'bg-green-500/15 text-green-300 hover:bg-green-500/25'
                          }`}
                          title={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
                        >
                          {prompt.isFavorite ? '⏸️' : '⭐'}
                        </button>
                        <button
                          onClick={() => handleDelete(prompt)}
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
            <p className="text-slate-400">No prompts found. Create your first prompt!</p>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Prompt Modal */}
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
            <h2 className="text-2xl font-semibold text-white">{editingId ? 'Edit Prompt' : 'Create New Prompt'}</h2>

            <div className="mt-6 space-y-5">
              {/* Prompt Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prompt Name</label>
                <input
                  type="text"
                  placeholder="e.g., Content Summarization"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe what this prompt does..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30 resize-none"
                />
              </div>

              {/* Prompt Template */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prompt Template</label>
                <textarea
                  placeholder="Enter the prompt template (use {variable} for placeholders)..."
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  rows="6"
                  className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30 resize-none font-mono"
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
                onClick={handleSavePrompt}
                className="rounded-[12px] bg-sky-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-600"
              >
                {editingId ? 'Update Prompt' : 'Create Prompt'}
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

export default PromptTesting;
