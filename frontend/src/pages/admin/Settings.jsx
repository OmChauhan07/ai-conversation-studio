import { useState } from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  // Default settings
  const defaultSettings = {
    general: {
      appName: 'AI Conversation Studio',
      orgName: 'TechCorp Inc.',
      timeZone: 'UTC',
    },
    authentication: {
      passwordPolicy: 'Strong',
      otpEnabled: true,
      jwtExpiry: '2h',
    },
    ai: {
      defaultModel: 'GPT-4',
      temperature: 0.7,
      maxTokens: 2048,
    },
    knowledge: {
      maxUploadSize: '50',
      allowedFileTypes: 'PDF, DOCX, XLSX, TXT, Markdown',
    },
    theme: {
      darkMode: true,
      accentColor: 'sky',
    },
  };

  // Settings state
  const [settings, setSettings] = useState(defaultSettings);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Show success toast
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Update general settings
  const updateGeneral = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
    setHasChanges(true);
  };

  // Update authentication settings
  const updateAuth = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      authentication: { ...prev.authentication, [field]: value },
    }));
    setHasChanges(true);
  };

  // Update AI settings
  const updateAI = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, [field]: value },
    }));
    setHasChanges(true);
  };

  // Update knowledge settings
  const updateKnowledge = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      knowledge: { ...prev.knowledge, [field]: value },
    }));
    setHasChanges(true);
  };

  // Update theme settings
  const updateTheme = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: value },
    }));
    setHasChanges(true);
  };

  // Save changes
  const handleSaveChanges = () => {
    showSuccessToast('Settings saved successfully!');
    setHasChanges(false);
  };

  // Reset to default
  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
    showSuccessToast('Settings reset to default!');
  };

  const accentColors = [
    { name: 'Sky', value: 'sky' },
    { name: 'Blue', value: 'blue' },
    { name: 'Purple', value: 'purple' },
    { name: 'Pink', value: 'pink' },
    { name: 'Green', value: 'green' },
  ];

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold text-white">Platform Settings</h2>
        <p className="mt-1 text-sm text-slate-400">Configure platform-wide settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span>⚙️</span> General Settings
          </h3>
          <p className="mt-1 text-sm text-slate-400">Basic application configuration</p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Application Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Application Name</label>
              <input
                type="text"
                value={settings.general.appName}
                onChange={(e) => updateGeneral('appName', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
              <input
                type="text"
                value={settings.general.orgName}
                onChange={(e) => updateGeneral('orgName', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            {/* Time Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time Zone</label>
              <select
                value={settings.general.timeZone}
                onChange={(e) => updateGeneral('timeZone', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="PST">PST</option>
                <option value="IST">IST</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Authentication Settings */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span>🔐</span> Authentication
          </h3>
          <p className="mt-1 text-sm text-slate-400">Security and authentication settings</p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Password Policy */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password Policy</label>
              <select
                value={settings.authentication.passwordPolicy}
                onChange={(e) => updateAuth('passwordPolicy', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="Weak">Weak</option>
                <option value="Medium">Medium</option>
                <option value="Strong">Strong</option>
              </select>
            </div>

            {/* OTP Enable */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">OTP Authentication</label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => updateAuth('otpEnabled', !settings.authentication.otpEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    settings.authentication.otpEnabled ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      settings.authentication.otpEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-400">{settings.authentication.otpEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            {/* JWT Expiry */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">JWT Token Expiry</label>
              <select
                value={settings.authentication.jwtExpiry}
                onChange={(e) => updateAuth('jwtExpiry', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="1h">1 Hour</option>
                <option value="2h">2 Hours</option>
                <option value="6h">6 Hours</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span>🤖</span> AI Settings
          </h3>
          <p className="mt-1 text-sm text-slate-400">Configure AI model parameters</p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Default AI Model */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Default AI Model</label>
              <select
                value={settings.ai.defaultModel}
                onChange={(e) => updateAI('defaultModel', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="GPT-3.5">GPT-3.5</option>
                <option value="GPT-4">GPT-4</option>
                <option value="Claude-2">Claude-2</option>
                <option value="Gemini">Gemini</option>
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Temperature: <span className="text-sky-400">{settings.ai.temperature.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.ai.temperature}
                onChange={(e) => updateAI('temperature', parseFloat(e.target.value))}
                className="w-full rounded-lg"
              />
              <p className="mt-1 text-xs text-slate-500">Controls randomness (0 = deterministic, 1 = random)</p>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Tokens</label>
              <input
                type="number"
                value={settings.ai.maxTokens}
                onChange={(e) => updateAI('maxTokens', parseInt(e.target.value))}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>
        </motion.div>

        {/* Knowledge Settings */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span>📚</span> Knowledge Settings
          </h3>
          <p className="mt-1 text-sm text-slate-400">Document upload and file management</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Maximum Upload Size */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Maximum Upload Size (MB)</label>
              <input
                type="number"
                value={settings.knowledge.maxUploadSize}
                onChange={(e) => updateKnowledge('maxUploadSize', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            {/* Allowed File Types */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Allowed File Types</label>
              <input
                type="text"
                value={settings.knowledge.allowedFileTypes}
                onChange={(e) => updateKnowledge('allowedFileTypes', e.target.value)}
                className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
              />
              <p className="mt-1 text-xs text-slate-500">Comma-separated list (e.g., PDF, DOCX, XLSX)</p>
            </div>
          </div>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          className="rounded-[20px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <span>🎨</span> Theme & Appearance
          </h3>
          <p className="mt-1 text-sm text-slate-400">Customize the user interface</p>

          <div className="mt-6 space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="mt-1 text-xs text-slate-400">Enable dark theme across the platform</p>
              </div>
              <button
                onClick={() => updateTheme('darkMode', !settings.theme.darkMode)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  settings.theme.darkMode ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    settings.theme.darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Accent Color */}
            <div>
              <p className="text-sm font-medium text-white mb-3">Accent Color</p>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateTheme('accentColor', color.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      settings.theme.accentColor === color.value
                        ? `bg-${color.value}-500 text-white ring-2 ring-${color.value}-400`
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4 justify-end pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <button
          onClick={handleReset}
          className="rounded-[12px] border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80 hover:text-white"
        >
          Reset to Default
        </button>
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges}
          className={`rounded-[12px] px-6 py-3 text-sm font-medium text-white transition ${
            hasChanges ? 'bg-sky-500 hover:bg-sky-600' : 'bg-slate-700 cursor-not-allowed'
          }`}
        >
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </motion.div>

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

export default Settings;
