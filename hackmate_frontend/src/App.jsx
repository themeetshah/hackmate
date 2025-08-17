import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Dashboard from './components/Dashboard/Dashboard';
import HackathonList from './components/Hackathons/HackathonList';
import MatchingPage from './components/Matching/MatchingPage';
import TeamsPage from './components/Teams/TeamsPage';
import ProfilePage from './components/Profile/Profile';
import HackathonCreate from './components/Hackathons/HackathonCreate';
import HackathonDetail from './components/Hackathons/HackathonDetail';
import HackathonRegister from './components/Hackathons/HackathonRegister';
import ApplicationDetail from './components/Hackathons/ApplicationDetail';
import MyHackathons from './components/Hackathons/MyHackathons';
import HackathonStats from './components/Hackathons/HackathonStats';
import NotFound from './components/Layout/NotFound';


const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupForm />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* profile */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />

              {/* hackathons */}
              <Route path="hackathons" element={<HackathonList />} />
              <Route path="/hackathons/create" element={<HackathonCreate />} />
              <Route path="/hackathons/:id" element={<HackathonDetail />} />
              <Route path="/hackathons/:id/register" element={<HackathonRegister />} />
              <Route path="/hackathons/applications/:applicationId" element={<ApplicationDetail />} />
              <Route path="/hackathons/my" element={<MyHackathons />} />
              <Route path="/hackathons/organized/:id/stats" element={<HackathonStats />} />

              {/* teams */}
              <Route path="teams" element={<TeamsPage />} />
              <Route path="matching" element={<MatchingPage />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
