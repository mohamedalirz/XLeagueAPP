import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TableRow from '../components/TableRow';

const League = () => {
  const { user } = useAuth();
  const [standings, setStandings] = useState([]);
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonStarted, setSeasonStarted] = useState(false);
  const [seasonCompleted, setSeasonCompleted] = useState(false);
  const [startingSeason, setStartingSeason] = useState(false);
  const [advancingSeason, setAdvancingSeason] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [playedMatches, setPlayedMatches] = useState(0);

  useEffect(() => {
    if (user?.username) {
      fetchLeagueData();
      const interval = setInterval(fetchLeagueData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchLeagueData = async () => {
    try {
      // Get user's league with username parameter
      const leagueRes = await axios.get('/leagues/my-league', {
        params: { username: user.username }
      });
      setLeagueInfo(leagueRes.data);
      
      if (leagueRes.data?.id) {
        // Get matches to check season status
        const matchesRes = await axios.get(`/matches/league/${leagueRes.data.id}`);
        const matches = matchesRes.data || [];
        setTotalMatches(matches.length);
        
        const played = matches.filter(m => m.played === true).length;
        setPlayedMatches(played);
        
        const hasMatches = matches.length > 0;
        const allMatchesPlayed = hasMatches && played === matches.length;
        
        setSeasonStarted(hasMatches);
        setSeasonCompleted(allMatchesPlayed && hasMatches);
        
        // Get league table
        const tableRes = await axios.get(`/leagues/${leagueRes.data.id}/table`);
        const sortedStandings = tableRes.data.sort((a, b) => b.points - a.points);
        setStandings(sortedStandings);
      }
    } catch (error) {
      console.error('Error fetching league data:', error);
      if (error.response?.status === 400) {
        setLeagueInfo(null);
        setStandings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSeason = async () => {
    if (!leagueInfo) return;
    
    setStartingSeason(true);
    try {
      console.log('Starting season for league:', leagueInfo.id);
      const response = await axios.post(`/leagues/${leagueInfo.id}/start-season`);
      console.log('Season started:', response.data);
      alert('Season started successfully! Matches have been generated.');
      await fetchLeagueData();
    } catch (error) {
      console.error('Error starting season:', error);
      alert(error.response?.data?.message || 'Failed to start season. Make sure you have at least 2 teams in the league.');
    } finally {
      setStartingSeason(false);
    }
  };

  const handleNextSeason = async () => {
    if (!leagueInfo) return;
    
    setAdvancingSeason(true);
    try {
      console.log('Advancing to next season for league:', leagueInfo.id);
      const response = await axios.post(`/leagues/${leagueInfo.id}/next-season`);
      console.log('Next season started:', response.data);
      alert('Season completed! Moving to next season...');
      await fetchLeagueData();
    } catch (error) {
      console.error('Error advancing season:', error);
      alert(error.response?.data?.message || 'Failed to advance to next season.');
    } finally {
      setAdvancingSeason(false);
    }
  };

  const getSeasonProgress = () => {
    if (totalMatches === 0) return 0;
    return (playedMatches / totalMatches) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!leagueInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card-gradient rounded-2xl p-12 neon-border text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-4">No League Yet</h2>
          <p className="text-gray-400 mb-6">
            You haven't joined a league yet. Create or join a league to see the standings!
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">{leagueInfo.name}</h1>
        <p className="text-center text-gray-400">League Standings - Season {leagueInfo.season || 1}</p>
        <p className="text-center text-neon-green text-sm mt-2">League Code: {leagueInfo.code}</p>
      </div>

      {/* Season Actions */}
      <div className="max-w-4xl mx-auto mb-8">
        {/* Start Season Button */}
        {!seasonStarted && standings.length >= 2 && (
          <div className="card-gradient rounded-2xl p-6 neon-border text-center">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2 text-neon-green">Season Not Started</h3>
            <p className="text-gray-400 mb-4">
              Your league has {standings.length} teams ready to play!
            </p>
            <button
              onClick={handleStartSeason}
              disabled={startingSeason}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50"
            >
              {startingSeason ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-bg inline-block mr-2"></div>
                  Starting Season...
                </>
              ) : (
                '🏆 Start Season 🏆'
              )}
            </button>
          </div>
        )}

        {/* Season Progress */}
        {seasonStarted && !seasonCompleted && (
          <div className="card-gradient rounded-2xl p-6 neon-border">
            <h3 className="text-lg font-bold mb-3 text-neon-green">Season {leagueInfo.season} in Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Matches Played</span>
                <span>{playedMatches} / {totalMatches}</span>
              </div>
              <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-neon-green to-green-400 h-full transition-all duration-500"
                  style={{ width: `${getSeasonProgress()}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Season Completed - Next Season Button */}
        {seasonCompleted && (
          <div className="card-gradient rounded-2xl p-6 neon-border text-center">
            <div className="text-5xl mb-4">🏆✨</div>
            <h3 className="text-xl font-bold mb-2 text-neon-green">Season {leagueInfo.season} Completed!</h3>
            <p className="text-gray-400 mb-4">
              Congratulations to the champion: <span className="text-neon-green font-bold">{standings[0]?.name}</span>!
            </p>
            <div className="bg-dark-surface rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300">
                🎉 All players will gain bonus XP<br/>
                📈 Player values will be updated<br/>
                🔄 New season will start with the same teams
              </p>
            </div>
            <button
              onClick={handleNextSeason}
              disabled={advancingSeason}
              className="btn-primary text-lg px-8 py-3 disabled:opacity-50"
            >
              {advancingSeason ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-bg inline-block mr-2"></div>
                  Starting Next Season...
                </>
              ) : (
                '🔄 Start Next Season 🔄'
              )}
            </button>
          </div>
        )}

        {/* Not enough teams message */}
        {!seasonStarted && standings.length < 2 && (
          <div className="card-gradient rounded-2xl p-6 neon-border text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2 text-yellow-400">Need More Teams</h3>
            <p className="text-gray-400 mb-4">
              You need at least 2 teams to start the season.
              Current teams: {standings.length}
            </p>
            <p className="text-sm text-gray-500">
              Share your league code <span className="text-neon-green font-bold">{leagueInfo.code}</span> with friends to join!
            </p>
          </div>
        )}
      </div>

      {/* League Table */}
      <div className="max-w-4xl mx-auto">
        <div className="card-gradient rounded-2xl overflow-hidden neon-border">
          {/* Header */}
          <div className="bg-dark-surface p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-neon-green font-bold">#</span>
                <span className="font-bold">Team</span>
              </div>
              <div className="flex space-x-6 text-center">
                <div className="min-w-[50px] font-bold">P</div>
                <div className="min-w-[50px] font-bold">W</div>
                <div className="min-w-[50px] font-bold">L</div>
                <div className="min-w-[60px] font-bold text-neon-green">PTS</div>
              </div>
            </div>
          </div>

          {/* Standings */}
          <div className="divide-y divide-gray-700">
            {standings.map((team, index) => (
              <TableRow key={team.id} team={team} index={index} />
            ))}
          </div>
        </div>

        {/* League Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card-gradient rounded-xl p-4 neon-border text-center">
            <p className="text-gray-400 text-sm">Total Teams</p>
            <p className="text-2xl font-bold text-neon-green">{standings.length}</p>
          </div>
          <div className="card-gradient rounded-xl p-4 neon-border text-center">
            <p className="text-gray-400 text-sm">Total Matches</p>
            <p className="text-2xl font-bold text-neon-green">{totalMatches}</p>
          </div>
          <div className="card-gradient rounded-xl p-4 neon-border text-center">
            <p className="text-gray-400 text-sm">League Leader</p>
            <p className="text-lg font-bold text-neon-green truncate">
              {standings[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default League;