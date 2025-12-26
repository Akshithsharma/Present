import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Simulation from './pages/Simulation';
import PracticeHub from './pages/PracticeHub';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import SavedProfiles from './pages/SavedProfiles';

const RoleBasedHome = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <SavedProfiles />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<RoleBasedHome />} />

            {/* Standard Routes */}
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/simulation/:id" element={<Simulation />} />
            <Route path="/practice" element={<PracticeHub />} />

            {/* Admin Context Routes */}
            <Route path="/student/:id/dashboard" element={<Dashboard />} />
            <Route path="/student/:id/simulation" element={<Simulation />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
