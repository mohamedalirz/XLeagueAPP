import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/PlayerCard';

const Team = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.username) {
      fetchTeamData();
    }
  }, [user]);

  const fetchTeamData = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('Fetching team data for user:', user.username);
      
      // Fetch team info with username parameter
      const teamRes = await axios.get('/teams/my-team', {
        params: { username: user.username }
      });
      console.log('Team API response:', teamRes.data);
      setTeamInfo(
  typeof teamRes.data === 'string'
    ? JSON.parse(teamRes.data)
    : teamRes.data
);  
      
      // Fetch players with username parameter
      const playersRes = await axios.get('/teams/my-team/players', {
        params: { username: user.username }
      });
      
      console.log('Players API response:', playersRes.data);
      console.log('Players response type:', typeof playersRes.data);
      console.log('Is players an array?', Array.isArray(playersRes.data));
      
      // Ensure players is always an array
      let playersData = [];
      if (Array.isArray(playersRes.data)) {
        playersData = playersRes.data;
      } else if (playersRes.data && typeof playersRes.data === 'object') {
        // If it's an object with a players property
        if (Array.isArray(playersRes.data.players)) {
          playersData = playersRes.data.players;
        } else {
          console.error('Unexpected players data format:', playersRes.data);
        }
      }
      
      setPlayers(playersData);
      console.log('Final players array length:', playersData.length);
      
    } catch (error) {
      console.error('Error fetching team data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400 || error.response?.status === 404) {
        setError('No team found. Please create or join a league first.');
        setTeamInfo(null);
        setPlayers([]);
      } else {
        setError('Failed to load team data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOffer = async (playerId, price) => {
    if (!teamInfo) {
      alert('Please wait for team data to load');
      return;
    }
    
    try {
      console.log('Listing player for sale:', {
        playerId: playerId,
        fromTeamId: teamInfo.id,
        price: price
      });

      const response = await axios.post('/leagues/offer', {
        playerId: playerId,
        fromTeamId: teamInfo.id,
        toTeamId: null,
        price: price
      });
      
      console.log('Player listed successfully:', response.data);
      alert('Player listed for transfer successfully!');
      fetchTeamData();
    } catch (error) {
      console.error('Error listing player:', error);
      alert('Failed to list player for transfer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  // Log state for debugging
  console.log('Render state:', { error, teamInfo, playersLength: players.length });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card-gradient rounded-2xl p-12 neon-border text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchTeamData()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card-gradient rounded-2xl p-12 neon-border text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-4">No Team Yet</h2>
          <p className="text-gray-400 mb-6">
            You need to create or join a league to get your team of 22 players.
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

  if (!players || players.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card-gradient rounded-2xl p-12 neon-border text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold mb-4">Team: {teamInfo.name}</h2>
          <p className="text-gray-400 mb-4">
            Your team exists but no players were found.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Players array length: {players.length}
          </p>
          <button 
            onClick={() => fetchTeamData()}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Safe calculations
  const avgPower = Math.floor(players.reduce((sum, p) => sum + (p?.power || 70), 0) / players.length);
  const totalXP = players.reduce((sum, p) => sum + (p?.xp || 0), 0);
  const totalValue = players.reduce((sum, p) => sum + (p?.value || 50000), 0);
  const topPlayer = players.reduce((prev, curr) => (curr?.power || 0) > (prev?.power || 0) ? curr : prev, players[0]);

  // Group players by position
  const goalkeepers = players.filter(p => p?.position?.toLowerCase() === 'goalkeeper' || p?.position?.toLowerCase() === 'gk');
  const defenders = players.filter(p => p?.position?.toLowerCase() === 'defender' || p?.position?.toLowerCase() === 'df');
  const midfielders = players.filter(p => p?.position?.toLowerCase() === 'midfielder' || p?.position?.toLowerCase() === 'mf');
  const forwards = players.filter(p => p?.position?.toLowerCase() === 'forward' || p?.position?.toLowerCase() === 'fw');
  
  const useIndexGrouping = goalkeepers.length === 0 && defenders.length === 0 && midfielders.length === 0 && forwards.length === 0;
  
  const groupedPlayers = useIndexGrouping ? {
    goalkeepers: players.slice(0, 2),
    defenders: players.slice(2, 8),
    midfielders: players.slice(8, 15),
    forwards: players.slice(15, 22)
  } : {
    goalkeepers, defenders, midfielders, forwards
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">{teamInfo.name}</h1>
        <p className="text-center text-gray-400">Your Squad - {players.length} Players</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-gradient rounded-xl p-4 neon-border text-center">
          <p className="text-gray-400 text-sm">Average Power</p>
          <p className="text-2xl font-bold text-neon-green">{avgPower}</p>
        </div>
        <div className="card-gradient rounded-xl p-4 neon-border text-center">
          <p className="text-gray-400 text-sm">Total XP</p>
          <p className="text-2xl font-bold text-neon-green">{totalXP.toLocaleString()}</p>
        </div>
        <div className="card-gradient rounded-xl p-4 neon-border text-center">
          <p className="text-gray-400 text-sm">Team Value</p>
          <p className="text-2xl font-bold text-neon-green">${totalValue.toLocaleString()}</p>
        </div>
        <div className="card-gradient rounded-xl p-4 neon-border text-center">
          <p className="text-gray-400 text-sm">Top Player</p>
          <p className="text-lg font-bold text-neon-green truncate">{topPlayer?.name || 'N/A'}</p>
        </div>
        <div className="card-gradient rounded-xl p-4 neon-border text-center">
  <p className="text-gray-400 text-sm">Budget</p>
  <p className="text-2xl font-bold text-neon-green">
    ${(teamInfo?.budget || 5000000).toLocaleString()}
  </p>
</div>
      </div>

      {groupedPlayers.goalkeepers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-green">Goalkeepers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPlayers.goalkeepers.map(player => (
              <PlayerCard key={player.id} player={player} onTransfer={(price) => handleTransferOffer(player.id, price)} />
            ))}
          </div>
        </div>
      )}

      {groupedPlayers.defenders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-green">Defenders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPlayers.defenders.map(player => (
              <PlayerCard key={player.id} player={player} onTransfer={(price) => handleTransferOffer(player.id, price)} />
            ))}
          </div>
        </div>
      )}

      {groupedPlayers.midfielders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-green">Midfielders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPlayers.midfielders.map(player => (
              <PlayerCard key={player.id} player={player} onTransfer={(price) => handleTransferOffer(player.id, price)} />
            ))}
          </div>
        </div>
      )}

      {groupedPlayers.forwards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-neon-green">Forwards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPlayers.forwards.map(player => (
              <PlayerCard key={player.id} player={player} onTransfer={(price) => handleTransferOffer(player.id, price)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;