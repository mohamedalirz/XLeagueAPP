import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [league, setLeague] = useState(null);
  const [nextMatch, setNextMatch] = useState(null);
  const [latestMatch, setLatestMatch] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [leagueMode, setLeagueMode] = useState('create');
  const [leagueName, setLeagueName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [hasTeam, setHasTeam] = useState(false);
  const [hasLeague, setHasLeague] = useState(false);

  useEffect(() => {
    if (user?.username) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (nextMatch?.matchTime) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [nextMatch]);

  const fetchDashboardData = async () => {
    if (!user?.username) return;
    
    try {
      // Try to fetch team data
      try {
        const teamRes = await axios.get('/teams/my-team', {
          params: { username: user.username }
        });
        setTeam(teamRes.data);
        setHasTeam(true);
        // If team exists but no league, pre-fill team name
        if (teamRes.data && !league) {
          setTeamName(teamRes.data.name);
        }
      } catch (teamError) {
        console.log('No team found:', teamError.response?.status);
        setHasTeam(false);
        setTeam(null);
      }

      // Try to fetch league data
      try {
        const leagueRes = await axios.get('/leagues/my-league', {
          params: { username: user.username }
        });
        setLeague(leagueRes.data);
        setHasLeague(true);
        
        if (leagueRes.data?.id) {
          try {
            const matchesRes = await axios.get(`/matches/league/${leagueRes.data.id}`);
            if (matchesRes.data && matchesRes.data.length > 0) {
              const upcoming = matchesRes.data.find(m => !m.played);
              const lastPlayed = matchesRes.data.find(m => m.played);
              setNextMatch(upcoming);
              setLatestMatch(lastPlayed);
            }
          } catch (matchesError) {
            console.log('No matches found');
          }
        }
      } catch (leagueError) {
        console.log('No league found - this is normal for new users');
        setHasLeague(false);
        setLeague(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!nextMatch?.matchTime) return;
    
    const matchTime = new Date(nextMatch.matchTime);
    const now = new Date();
    const diff = matchTime - now;

    if (diff <= 0) {
      setCountdown('Match in progress!');
      fetchDashboardData();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
    const seconds = Math.floor((diff % 60000) / 1000);

    setCountdown(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      console.log('Creating league with data:', {
        username: user.username,
        leagueName: leagueName,
        teamName: teamName || (team ? team.name : 'My Team')
      });

      const response = await axios.post('/leagues/create', {
        username: user.username,
        leagueName: leagueName,
        teamName: teamName || (team ? team.name : 'My Team')
      });
      
      console.log('Create league response:', response.data);
      
      if (response.data) {
        localStorage.setItem('leagueCode', response.data.code);
        setShowLeagueModal(false);
        resetModalForm();
        await fetchDashboardData();
        // Force a page reload to refresh all data
        window.location.reload();
      }
    } catch (error) {
      console.error('Create league error details:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        setModalError(error.response.data.message);
      } else if (error.response?.status === 500) {
        setModalError('Server error. Please check if you already have a team or league.');
      } else {
        setModalError('Failed to create league. Please try again.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      console.log('Joining league with data:', {
        code: joinCode,
        username: user.username,
        teamName: teamName || (team ? team.name : 'My Team')
      });

      const response = await axios.post('/leagues/join', {
        code: joinCode,
        username: user.username,
        teamName: teamName || (team ? team.name : 'My Team')
      });
      
      console.log('Join league response:', response.data);
      
      if (response.data) {
        setShowLeagueModal(false);
        resetModalForm();
        await fetchDashboardData();
        // Force a page reload to refresh all data
        window.location.reload();
      }
    } catch (error) {
      console.error('Join league error:', error);
      if (error.response?.data?.message) {
        setModalError(error.response.data.message);
      } else if (error.response?.status === 500) {
        setModalError('Server error. The league code might be invalid or you already have a team.');
      } else {
        setModalError('Failed to join league. Please check the code and try again.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const resetModalForm = () => {
    setLeagueName('');
    setTeamName(team ? team.name : '');
    setJoinCode('');
    setLeagueMode('create');
    setModalError('');
  };

  const handleQuickAction = (action) => {
    if (action === 'transfers') {
      navigate('/transfers');
    } else if (action === 'team') {
      navigate('/team');
    } else if (action === 'league') {
      navigate('/league');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Welcome Card */}
          <div className="card-gradient rounded-2xl p-6 neon-border mb-6">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome, {user?.username}!</h2>
                <p className="text-gray-300">
                  {!hasLeague 
                    ? "You have a team but need to join or create a league to start playing!" 
                    : hasTeam && hasLeague 
                    ? "Your football journey has begun!" 
                    : "Complete your setup to start playing"}
                </p>
              </div>
              {!hasLeague && (
                <button
                  onClick={() => setShowLeagueModal(true)}
                  className="btn-primary text-sm whitespace-nowrap"
                >
                  + Create or Join League
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
              {hasTeam && team && (
                <div>
                  <p className="text-gray-400 text-sm">Your Team</p>
                  <p className="text-neon-green font-semibold text-lg">{team.name}</p>
                </div>
              )}
              {hasLeague && league && (
                <div>
                  <p className="text-gray-400 text-sm">Your League</p>
                  <p className="text-neon-green font-semibold text-lg">{league.name}</p>
                  {league.code && (
                    <p className="text-gray-500 text-xs mt-1">Code: {league.code}</p>
                  )}
                </div>
              )}
              {!hasLeague && hasTeam && (
                <div>
                  <p className="text-yellow-400 text-sm">Status</p>
                  <p className="text-yellow-400 font-semibold text-sm">Team created but not in a league yet</p>
                </div>
              )}
            </div>
          </div>

          {/* No League Message - Show when team exists but no league */}
          {hasTeam && !hasLeague && (
            <div className="card-gradient rounded-2xl p-8 neon-border text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-4 text-neon-green">Ready to Join a League?</h3>
              <p className="text-gray-300 mb-4">
                Your team <span className="text-neon-green font-bold">{team?.name}</span> is ready to play!
              </p>
              <p className="text-gray-400 mb-6">
                You need to either create a new league or join an existing one using a league code.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setLeagueMode('create');
                    setShowLeagueModal(true);
                  }}
                  className="btn-primary"
                >
                  Create New League
                </button>
                <button
                  onClick={() => {
                    setLeagueMode('join');
                    setShowLeagueModal(true);
                  }}
                  className="btn-secondary"
                >
                  Join Existing League
                </button>
              </div>
            </div>
          )}

          {/* Next Match - Only show if user has league */}
          {hasLeague && nextMatch && (
            <div className="card-gradient rounded-2xl p-6 neon-border mb-6">
              <h3 className="text-xl font-bold mb-4 text-neon-green">Next Match</h3>
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">
                  {nextMatch.teamA?.name || 'Team A'} vs {nextMatch.teamB?.name || 'Team B'}
                </p>
                <div className="text-4xl font-bold text-neon-green mb-2">{countdown || 'Loading...'}</div>
                <p className="text-gray-400">
                  {nextMatch.matchTime ? new Date(nextMatch.matchTime).toLocaleString() : 'Date TBD'}
                </p>
              </div>
            </div>
          )}

          {/* Latest Result - Only show if user has league */}
          {hasLeague && latestMatch && (
            <div className="card-gradient rounded-2xl p-6 neon-border">
              <h3 className="text-xl font-bold mb-4">Latest Match Result</h3>
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">
                  {latestMatch.teamA?.name || 'Team A'} {latestMatch.scoreA || 0} - {latestMatch.scoreB || 0} {latestMatch.teamB?.name || 'Team B'}
                </p>
                <p className="text-gray-400">
                  {latestMatch.matchTime ? new Date(latestMatch.matchTime).toLocaleString() : 'Date TBD'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {hasTeam && team && (
            <div className="card-gradient rounded-2xl p-6 neon-border">
              <h3 className="text-xl font-bold mb-4 text-neon-green">Team Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Matches Played</span>
                  <span className="font-semibold">{team.matchesPlayed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="font-semibold text-green-400">{team.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losses</span>
                  <span className="font-semibold text-red-400">{team.losses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Points</span>
                  <span className="font-semibold text-neon-green">{team.points || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="card-gradient rounded-2xl p-6 neon-border">
            <h3 className="text-xl font-bold mb-4 text-neon-green">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleQuickAction('transfers')}
                className="w-full btn-secondary"
                disabled={!hasTeam}
              >
                View Transfer Market
              </button>
              <button 
                onClick={() => handleQuickAction('team')}
                className="w-full btn-secondary"
              >
                Manage Team
              </button>
              {hasLeague && (
                <button 
                  onClick={() => handleQuickAction('league')}
                  className="w-full btn-secondary"
                >
                  View League Table
                </button>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="card-gradient rounded-2xl p-6 neon-border">
            <h3 className="text-lg font-bold mb-3 text-neon-green">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Players gain XP after each match</li>
              <li>• Higher power = better performance</li>
              <li>• Trade players to improve your squad</li>
              <li>• Matches are simulated daily</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create/Join League Modal */}
      {showLeagueModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowLeagueModal(false)}>
          <div className="card-gradient rounded-2xl p-6 max-w-md w-full neon-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neon-green">
                {leagueMode === 'create' ? 'Create New League' : 'Join Existing League'}
              </h2>
              <button 
                onClick={() => setShowLeagueModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {modalError && (
              <div className="bg-red-600/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {modalError}
              </div>
            )}

            {leagueMode === 'create' ? (
              <form onSubmit={handleCreateLeague} className="space-y-4">
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
                    placeholder="Your team name"
                    required
                    minLength="3"
                  />
                  {team && (
                    <p className="text-gray-500 text-xs mt-1">Current team: {team.name}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Create League'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoinLeague} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">League Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="input-field"
                    placeholder="Enter league code"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">Ask the league creator for the code</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input-field"
                    placeholder="Your team name"
                    required
                    minLength="3"
                  />
                  {team && (
                    <p className="text-gray-500 text-xs mt-1">Current team: {team.name}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {modalLoading ? 'Joining...' : 'Join League'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;