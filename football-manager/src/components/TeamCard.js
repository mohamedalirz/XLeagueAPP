import React from 'react';
import { useNavigate } from 'react-router-dom';

const TEAM_EMOJIS = ['🦁', '🐯', '🦅', '🐺', '🦊', '🐉', '🦁', '🦂'];

const TeamCard = ({ team, index = 0, isMyTeam = false, onViewTeam }) => {
  const navigate = useNavigate();

  const {
    id,
    teamName = 'Unknown Team',
    managerName = 'Manager',
    wins = 0,
    losses = 0,
    points = 0,
    playerCount = 11,
  } = team;

  const emoji = TEAM_EMOJIS[index % TEAM_EMOJIS.length];

  const handleViewTeam = () => {
    if (isMyTeam) {
      navigate('/team');
    } else if (onViewTeam) {
      onViewTeam(team);
    }
  };

  return (
    <div
      className={`team-card animate-in${isMyTeam ? ' card-glow' : ''}`}
      style={{
        animationDelay: `${index * 0.06}s`,
        borderColor: isMyTeam ? 'var(--border-bright)' : undefined,
      }}
      onClick={handleViewTeam}
    >
      {/* Badge */}
      <div className="team-badge">{emoji}</div>

      {/* Info */}
      <div className="team-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="team-name">{teamName}</div>
          {isMyTeam && (
            <span className="badge badge-cyan">You</span>
          )}
        </div>
        <div className="team-manager">@{managerName}</div>
        <div className="team-meta">
          <span className="team-badge-stat">
            <span>⚡</span>
            <span>{playerCount} players</span>
          </span>
          <span className="team-badge-stat">
            <span>🏆</span>
            <span>{wins}W – {losses}L</span>
          </span>
          <span className="team-badge-stat">
            <span style={{ color: 'var(--accent-primary)' }}>●</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
              }}
            >
              {points} pts
            </span>
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          color: 'var(--text-muted)',
          fontSize: 18,
          flexShrink: 0,
          transition: 'var(--transition)',
        }}
      >
        →
      </div>
    </div>
  );
};

export default TeamCard;
