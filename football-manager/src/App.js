import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateLeague from './pages/CreateLeague';
import JoinLeague from './pages/JoinLeague';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Match from './pages/Match';
import League from './pages/League';

import './styles/main.css';

// Guard: redirect to home if not in a league
const ProtectedRoute = ({ children }) => {
  const league = localStorage.getItem('fm_league');
  const team = localStorage.getItem('fm_team');
  if (!league || !team) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="page-content">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/create-league" element={<CreateLeague />} />
            <Route path="/join-league" element={<JoinLeague />} />

            {/* Protected (require league + team) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <Match />
                </ProtectedRoute>
              }
            />
            <Route
              path="/league"
              element={
                <ProtectedRoute>
                  <League />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
