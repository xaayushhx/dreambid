import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user activity
        const activityRes = await api.get('/user/activity?limit=10');
        setActivities(activityRes.data.activities || []);
        setStats(activityRes.data.stats || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Don't show error toast, just set empty data
        setActivities([]);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getActionLabel = (action) => {
    const labels = {
      'login': '🔐 Logged in',
      'logout': '🚪 Logged out',
      'register': '📝 Registered',
      'profile_updated': '✏️ Updated profile',
      'profile_photo_uploaded': '📸 Uploaded profile photo',
      'profile_photo_deleted': '🗑️ Deleted profile photo',
      'password_changed': '🔑 Changed password',
      'property_created': '🏠 Created property',
      'property_updated': '📝 Updated property',
      'property_deleted': '🗑️ Deleted property',
      'property_viewed': '👁️ Viewed property',
      'property_shortlisted': '⭐ Shortlisted property'
    };
    return labels[action] || action;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <div className="bg-midnight-900 border-b border-midnight-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome back, {user?.full_name || 'User'}! 👋
              </h1>
              <p className="mt-2 text-text-secondary">
                Here's what's happening with your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Account Information */}
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-muted">Email</p>
                <p className="text-text-primary font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Full Name</p>
                <p className="text-text-primary font-medium">{user?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Phone</p>
                <p className="text-text-primary font-medium">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Member Since</p>
                <p className="text-text-primary font-medium">
                  {new Date(user?.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Activity Summary (30 days)</h2>
            <div className="space-y-3">
              {stats.length > 0 ? (
                stats.map((stat, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-text-secondary">{stat.action}</span>
                    <span className="font-semibold text-text-primary">{stat.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-text-muted">No activity in the last 30 days</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/profile"
                className="block w-full text-center px-4 py-2 bg-gold text-midnight-950 rounded-lg hover:bg-gold-hover transition font-semibold"
              >
                Edit Profile
              </a>
              <a
                href="/settings"
                className="block w-full text-center px-4 py-2 border border-midnight-600 text-text-primary rounded-lg hover:bg-midnight-800 transition"
              >
                Settings
              </a>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Dashboard;
