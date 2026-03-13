import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ShortlistProvider } from './contexts/ShortlistContext';

// Layout Components
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Properties from './pages/public/Properties';
import PropertyDetail from './pages/public/PropertyDetail';
import Register from './pages/public/Register';
import Contact from './pages/public/Contact';
import SignUp from './pages/public/SignUp';
import PublicLogin from './pages/public/Login';
import UserDashboard from './pages/public/Dashboard';
import UserProfile from './pages/public/Profile';
import UserSettings from './pages/public/Settings';
import Shortlisted from './pages/public/Shortlisted';
import Blogs from './pages/public/Blogs';
import BlogDetail from './pages/public/BlogDetail';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import PropertyForm from './pages/admin/PropertyForm';
import FeaturedProperties from './pages/admin/FeaturedProperties';
import Enquiries from './pages/admin/Enquiries';
import Users from './pages/admin/Users';
import AdminBlogs from './pages/admin/AdminBlogs';
import UserRegistrations from './pages/admin/UserRegistrations';

// Protected Route Components
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';

// Floating Components
import WhatsAppFloat from './components/WhatsAppFloat';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShortlistProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <WhatsAppFloat />
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="shortlisted" element={<Shortlisted />} />
                <Route path="blogs" element={<Blogs />} />
                <Route path="blogs/:id" element={<BlogDetail />} />
                <Route path="register" element={<Register />} />
                <Route path="contact" element={<Contact />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="login" element={<PublicLogin />} />
                
                {/* Protected User Routes */}
                <Route path="dashboard" element={<UserProtectedRoute><UserDashboard /></UserProtectedRoute>} />
                <Route path="profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
                <Route path="settings" element={<UserProtectedRoute><UserSettings /></UserProtectedRoute>} />
              </Route>

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/:id/edit" element={<PropertyForm />} />
                <Route path="featured" element={<FeaturedProperties />} />
                <Route path="enquiries" element={<Enquiries />} />
                <Route path="users" element={<Users />} />
                <Route path="registrations" element={<UserRegistrations />} />
                <Route path="blogs" element={<AdminBlogs />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
        </ShortlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;