import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SavedDashboards from './pages/SavedDashboards';
import Profile from './pages/Profile';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import Register from './pages/Register';
import PracticeHub from './pages/PracticeHub';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/saved-dashboards" element={
            <PrivateRoute>
              <Layout>
                <SavedDashboards />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/dashboard/:id" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/profile/:id" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/simulation" element={
            <PrivateRoute>
              <Layout>
                <Simulation />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/simulation/:id" element={
            <PrivateRoute>
              <Layout>
                <Simulation />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/practice" element={
            <PrivateRoute>
              <Layout>
                <PracticeHub />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
