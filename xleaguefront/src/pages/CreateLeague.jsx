import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateLeague = () => {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [leagueName, setLeagueName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Creating league:', {
        username: user.username,
        leagueName: leagueName,
        teamName: teamName
      });

      const response = await axios.post('/leagues/create', {
        username: user.username,
        leagueName: leagueName,
        teamName: teamName
      });
      
      console.log('League created:', response.data);
      
      localStorage.setItem('leagueCode', response.data.code);
      localStorage.setItem('teamId', response.data.id);
      
      alert('League created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Create league error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 500) {
        setError('Server error. Please check if the backend is running.');
      } else {
        setError('Failed to create league. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Joining league:', {
        code: joinCode,
        username: user.username,
        teamName: teamName
      });

      const response = await axios.post('/leagues/join', {
        code: joinCode.toUpperCase(),
        username: user.username,
        teamName: teamName
      });
      
      console.log('League joined:', response.data);
      
      localStorage.setItem('teamId', response.data.id);
      
      alert('Successfully joined the league!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Join league error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('League not found. Please check the code and try again.');
      } else if (error.response?.status === 400) {
        setError('Invalid request. You might already have a team in this league.');
      } else {
        setError('Failed to join league. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-surface px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neon-green rounded-full mb-4">
            <span className="text-dark-bg text-4xl font-bold">X</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to XLeague</h1>
          <p className="text-gray-400">Create or join a league to start your journey</p>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              mode === 'create'
                ? 'bg-neon-green text-dark-bg'
                : 'bg-dark-card text-gray-300 hover:bg-dark-card-hover'
            }`}
          >
            Create League
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              mode === 'join'
                ? 'bg-neon-green text-dark-bg'
                : 'bg-dark-card text-gray-300 hover:bg-dark-card-hover'
            }`}
          >
            Join League
          </button>
        </div>

        {/* Create League Form */}
        {mode === 'create' && (
          <div className="card-gradient rounded-2xl p-8 neon-border">
            <form onSubmit={handleCreateLeague} className="space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">League Name</label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Premier League"
                  required
                  minLength="3"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., FC Champions"
                  required
                  minLength="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create League'}
              </button>
            </form>
          </div>
        )}

        {/* Join League Form */}
        {mode === 'join' && (
          <div className="card-gradient rounded-2xl p-8 neon-border">
            <form onSubmit={handleJoinLeague} className="space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-300 mb-2">League Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="Enter 6-digit league code"
                  required
                  maxLength="6"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Ask the league creator for the code
                </p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your team name"
                  required
                  minLength="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join League'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLeague;