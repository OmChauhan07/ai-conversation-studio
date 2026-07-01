import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load secure dashboard content.');
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Secure Dashboard</h2>
          <p className="text-sm text-gray-500">Logged in as: {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm font-medium"
        >
          Log Out
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

      {dashboardData ? (
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Backend Connection Active!</h3>
          <p className="text-gray-700 mb-4">{dashboardData.message}</p>
          
          <div className="text-xs font-mono bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
            <p className="font-bold text-gray-400 mb-1">// Decoded JWT Payload from Server Header:</p>
            {JSON.stringify(dashboardData.user, null, 2)}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 animate-pulse">Fetching private server data...</p>
      )}
    </div>
  );
};

export default Dashboard;