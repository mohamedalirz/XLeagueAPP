import React from 'react';

const MatchCard = ({ match }) => {
  const isPlayed = match.played;
  const matchDate = new Date(match.matchTime);
  const now = new Date();
  const isUpcoming = matchDate > now && !isPlayed;

  return (
    <div className={`card-gradient rounded-xl p-4 neon-border transition-all duration-300 ${
      isPlayed ? 'opacity-90' : 'hover:scale-105'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1 text-right">
          <p className="font-bold text-lg">{match.teamA?.name || 'Team A'}</p>
          {isPlayed && <p className="text-2xl font-bold text-neon-green">{match.scoreA}</p>}
        </div>
        
        <div className="px-4 text-center">
          <span className="text-gray-400 text-sm">VS</span>
          {!isPlayed && (
            <div className="text-xs text-gray-500 mt-1">
              {isUpcoming ? 'Upcoming' : 'Scheduled'}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-left">
          <p className="font-bold text-lg">{match.teamB?.name || 'Team B'}</p>
          {isPlayed && <p className="text-2xl font-bold text-neon-green">{match.scoreB}</p>}
        </div>
      </div>

      <div className="text-center text-sm text-gray-400">
        {isPlayed ? (
          <span className="text-green-400">✓ Match Completed</span>
        ) : (
          <span>Kickoff: {matchDate.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};

export default MatchCard;