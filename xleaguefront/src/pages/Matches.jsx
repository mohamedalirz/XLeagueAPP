import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.username) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching league for user:', user?.username);
      
      // Get user's league with username parameter
      const leagueRes = await axios.get('/leagues/my-league', {
        params: { username: user?.username }
      });
      
      console.log('League response:', leagueRes.data);
      setLeagueInfo(leagueRes.data);
      
      if (leagueRes.data?.id) {
        console.log('Fetching matches for league ID:', leagueRes.data.id);
        const matchesRes = await axios.get(`/matches/league/${leagueRes.data.id}`);
        console.log('Matches response:', matchesRes.data);
        console.log('Matches count:', matchesRes.data?.length || 0);
        
        // Ensure matches is an array
        const matchesData = Array.isArray(matchesRes.data) ? matchesRes.data : [];
        setMatches(matchesData);
      } else {
        console.log('No league found or league has no ID');
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404 || error.response?.status === 400) {
        setError('No league found. Please create or join a league first.');
      } else {
        setError('Failed to load matches. Please try again.');
      }
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'played') return match.played === true;
    if (filter === 'upcoming') return match.played === false;
    return true;
  });

  // Calculate progress safely
  const totalMatches = matches.length;
  const playedMatches = matches.filter(m => m.played === true).length;
  const progressPercent = totalMatches > 0 ? (playedMatches / totalMatches) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (error || !leagueInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card-gradient rounded-2xl p-12 neon-border text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-4">No Matches Yet</h2>
          <p className="text-gray-400 mb-6">
            {error || "You need to be in a league with a started season to see matches."}
          </p>
          <button 
            onClick={() => window.location.href = '/league'}
            className="btn-primary"
          >
            Go to League
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">Matches</h1>
        <p className="text-center text-gray-400">{leagueInfo?.name || 'League'} - Season {leagueInfo?.season || 1}</p>
        {leagueInfo?.code && (
          <p className="text-center text-neon-green text-sm mt-1">League Code: {leagueInfo.code}</p>
        )}
      </div>

      {/* Season Status Message */}
      {totalMatches === 0 && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4 text-center">
            <p className="text-yellow-400">⚠️ Season hasn't started yet!</p>
            <p className="text-gray-400 text-sm mt-1">
              Go to the League page and click "Start Season" to generate matches.
            </p>
          </div>
        </div>
      )}

      {/* Filter Buttons - Only show if there are matches */}
      {totalMatches > 0 && (
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'all' ? 'bg-neon-green text-dark-bg' : 'bg-dark-card text-gray-300 hover:bg-dark-card-hover'
            }`}
          >
            All Matches ({totalMatches})
          </button>
          <button
            onClick={() => setFilter('played')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'played' ? 'bg-neon-green text-dark-bg' : 'bg-dark-card text-gray-300 hover:bg-dark-card-hover'
            }`}
          >
            Played ({playedMatches})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'upcoming' ? 'bg-neon-green text-dark-bg' : 'bg-dark-card text-gray-300 hover:bg-dark-card-hover'
            }`}
          >
            Upcoming ({totalMatches - playedMatches})
          </button>
        </div>
      )}

      {/* Matches Grid */}
      {totalMatches > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No matches found for selected filter</p>
            </div>
          )}

          {/* Season Progress */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="card-gradient rounded-xl p-6 neon-border">
              <h3 className="text-lg font-bold mb-3 text-neon-green">Season Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Matches Played</span>
                  <span>{playedMatches} / {totalMatches}</span>
                </div>
                <div className="w-full bg-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-neon-green to-green-400 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <p className="text-gray-400 text-lg mb-4">No matches have been generated yet</p>
          <button 
            onClick={() => window.location.href = '/league'}
            className="btn-primary"
          >
            Go to League to Start Season
          </button>
        </div>
      )}
    </div>
  );
};

export default Matches;