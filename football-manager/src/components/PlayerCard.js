import React from 'react';

const POSITION_EMOJIS = {
  GK: '🧤',
  CB: '🛡️',
  LB: '↙️',
  RB: '↘️',
  CDM: '⚙️',
  CM: '🔄',
  CAM: '🎯',
  LW: '⚡',
  RW: '⚡',
  CF: '🔥',
  ST: '⚽',
};

const getPowerClass = (power) => {
  if (power >= 80) return 'high';
  if (power >= 60) return 'mid';
  return 'low';
};

const getXpClass = (xp) => {
  if (xp >= 500) return 'high';
  if (xp >= 200) return 'mid';
  return 'low';
};

const PlayerCard = ({ player, index = 0 }) => {
  const {
    name = 'Unknown Player',
    position = 'CM',
    power = 0,
    xp = 0,
    number = index + 1,
  } = player;

  const powerPercent = Math.min(100, Math.max(0, power));
  const emoji = POSITION_EMOJIS[position] || '⚽';

  return (
    <div
      className="player-card animate-in"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Avatar */}
      <div className="player-avatar">
        <div className="player-avatar-ring" />
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-default)',
            borderRadius: '4px',
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-muted)',
            padding: '1px 4px',
            lineHeight: 1.4,
          }}
        >
          {number}
        </span>
      </div>

      {/* Info */}
      <div className="player-info">
        <div className="player-name">{name}</div>
        <div className="player-position">{position}</div>
        {/* Power bar */}
        <div className="power-bar-wrap">
          <div className="power-bar-track">
            <div
              className="power-bar-fill"
              style={{ width: `${powerPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="player-stats">
        <div className="player-stat">
          <span className={`player-stat-value ${getPowerClass(power)}`}>
            {power}
          </span>
          <span className="player-stat-label">PWR</span>
        </div>
        <div className="player-stat">
          <span className={`player-stat-value ${getXpClass(xp)}`}>
            {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
          </span>
          <span className="player-stat-label">XP</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
