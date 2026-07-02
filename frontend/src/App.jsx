import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ConversationHistory from './pages/ConversationHistory';
import KnowledgeSources from './pages/KnowledgeSources';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import KnowledgeBase from './pages/admin/KnowledgeBase';
import PromptTesting from './pages/admin/PromptTesting';
import Analytics from './pages/admin/Analytics';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Catch-all to send root traffic directly to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Public Auth Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Private Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/history" element={<ConversationHistory />} />
              <Route path="/knowledge" element={<KnowledgeSources />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="knowledge" replace />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route path="prompt-testing" element={<PromptTesting />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback routing for unknown paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;