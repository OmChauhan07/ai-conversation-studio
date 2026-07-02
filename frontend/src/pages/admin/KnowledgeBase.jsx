import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { uploadDocument, getDocuments, deleteDocument } from '../../api/aiApi';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDocuments();
      if (response.success && response.documents) {
        const formattedDocs = response.documents.map((doc, index) => ({
          id: index + 1,
          name: doc.filename || doc.name,
          type: (doc.filename || doc.name).split('.').pop().toUpperCase(),
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: 'Admin User',
          status: 'Active',
          size: 'Unknown',
        }));
        setDocuments(formattedDocs);
      }
    } catch (err) {
      setError('Failed to load documents. Please ensure the AI backend is running.');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Get unique file types for filter
  const fileTypes = ['All', ...new Set(documents.map((doc) => doc.type))];

  // Filter documents based on search and file type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        setLoading(true);
        setError('');
        await uploadDocument(file);
        showSuccessToast(`${file.name} uploaded successfully!`);
        await fetchDocuments(); // Refresh the list
      } catch (err) {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to upload document.');
        console.error('Error uploading document:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Toast notification handler
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Delete document
  const handleDelete = async (id) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    if (!window.confirm(`Are you sure you want to delete ${doc.name}?`)) return;

    try {
      setLoading(true);
      setError('');
      await deleteDocument(doc.name);
      showSuccessToast(`${doc.name} deleted successfully!`);
      await fetchDocuments(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete document.');
      console.error('Error deleting document:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preview document (mock)
  const handlePreview = (docName) => {
    showSuccessToast(`Opening preview for: ${docName}`);
  };

  // Download document (mock)
  const handleDownload = (docName) => {
    showSuccessToast(`Downloading: ${docName}`);
  };

  // Simulate upload button click
  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setLoading(true);
          setError('');
          await uploadDocument(file);
          showSuccessToast(`${file.name} uploaded successfully!`);
          await fetchDocuments(); // Refresh the list
        } catch (err) {
          setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to upload document.');
          console.error('Error uploading document:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  return (
    <motion.div className="space-y-6 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white">Knowledge Base</h2>
          <p className="mt-1 text-sm text-slate-400">Manage and organize your documents</p>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        </div>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          + Upload Knowledge
        </button>
      </div>

      {/* Drag & Drop Upload Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-[20px] border-2 border-dashed transition ${
          dragActive ? 'border-sky-400 bg-sky-500/10' : 'border-white/20 bg-slate-900/50 hover:border-white/40'
        } cursor-pointer p-8 text-center`}
      >
        <div className="space-y-3">
          <div className="text-3xl">📄</div>
          <div>
            <p className="text-base font-semibold text-white">Drag and drop your documents here</p>
            <p className="mt-1 text-sm text-slate-400">or click the Upload Knowledge button (PDF, DOCX, XLSX, Markdown, etc.)</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
          />
        </div>
        <div className="flex gap-2 sm:max-w-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-[12px] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-slate-800 transition duration-300 focus:ring-2 focus:ring-sky-500/30"
          >
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <motion.div
        className="overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-0 text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-300">Document Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">File Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Upload Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Uploaded By</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <motion.tr
                    key={doc.id}
                    className="border-b border-white/5 hover:bg-slate-900/50 transition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                          📄
                        </div>
                        <div>
                          <p className="font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-400/20">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{doc.uploadDate}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.uploadedBy}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                          doc.status === 'Active'
                            ? 'bg-green-500/15 text-green-300 ring-green-400/20'
                            : 'bg-slate-500/15 text-slate-300 ring-slate-400/20'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(doc.name)}
                          className="inline-flex items-center rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Preview"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="inline-flex items-center rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                          title="Download"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
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
            <p className="text-slate-400">No documents found. Try uploading some documents!</p>
          </div>
        )}
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

export default KnowledgeBase;
