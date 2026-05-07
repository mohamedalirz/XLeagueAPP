import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';

const POSITIONS = ['GK', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

const PLAYER_NAMES = [
  'Marco Rossi', 'Luca Bianchi', 'Kenji Tanaka', 'Carlos Vega',
  'Alexei Volkov', 'Diego Morales', 'Kwame Asante', 'Pierre Dubois',
  'Hamid Nazari', 'Tomas Novak', 'Elan Brightwell',
];

const generatePlayers = (teamId) => {
  const seed = (teamId || '').charCodeAt(0) || 42;
  return PLAYER_NAMES.map((name, i) => {
    const base = ((seed * (i + 3)) % 40) + 55;
    return {
      id: `p-${i}`,
      name,
      position: POSITIONS[i],
      power: Math.min(99, base + (i % 5)),
      xp: Math.floor(((seed + i * 17) % 800) + 50),
      number: i + 1,
    };
  });
};

const Team = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTeam = JSON.parse(localStorage.getItem('fm_team') || 'null');
    const storedLeague = JSON.parse(localStorage.getItem('fm_league') || 'null');

    if (!storedTeam || !storedLeague) {
      navigate('/');
      return;
    }

    setTeam(storedTeam);

    // Try to get real players from stored data, else generate
    const existingPlayers =
      storedTeam.players ||
      (storedLeague.teams || []).find(
        (t) => t.teamName === storedTeam.teamName || t.id === storedTeam.id
      )?.players;

    if (existingPlayers && existingPlayers.length > 0) {
      setPlayers(existingPlayers);
    } else {
      setPlayers(generatePlayers(storedTeam.id || storedTeam.teamName));
    }

    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Loading Squad</div>
      </div>
    );
  }

  const avgPower =
    players.length > 0
      ? Math.round(players.reduce((s, p) => s + (p.power || 0), 0) / players.length)
      : 0;

  const totalXp = players.reduce((s, p) => s + (p.xp || 0), 0);

  return (
    <div className="container">
      {/* Header */}
      <div className="team-page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                marginBottom: 8,
              }}
            >
              My Squad
            </div>
            <h1 className="team-page-title">
              {team?.teamName || 'My Team'}
            </h1>
            <div className="team-page-meta">
              <div className="team-page-stat">
                <span>👤</span>
                <span>{team?.managerName || 'Manager'}</span>
              </div>
              <div className="team-page-stat">
                <span>⚽</span>
                <span>{players.length} Players</span>
              </div>
              <div className="team-page-stat">
                <span style={{ color: 'var(--neon-green)' }}>★</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-green)',
                    fontWeight: 700,
                  }}
                >
                  {avgPower} OVR
                </span>
              </div>
              <div className="team-page-stat">
                <span>⚡</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-amber)',
                  }}
                >
                  {totalXp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/match" className="btn btn-primary btn-sm">
              ⚽ Play Match
            </Link>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Team strength */}
      <div className="team-strength-bar">
        <div className="team-strength-label">
          <span className="team-strength-text">Team Overall Strength</span>
          <span className="team-strength-value">{avgPower} / 99</span>
        </div>
        <div className="team-strength-track">
          <div
            className="team-strength-fill"
            style={{ width: `${avgPower}%` }}
          />
        </div>
      </div>

      {/* Formation */}
      <div>
        <div className="formation-label">Formation: 4-3-3</div>

        <div className="players-grid stagger-children">
          {players.map((player, i) => (
            <PlayerCard key={player.id || i} player={player} index={i} />
          ))}
        </div>
      </div>

      {/* Transfer Market Teaser */}
      <div style={{ marginTop: 40 }}>
        <div className="coming-soon-banner">
          <div className="coming-soon-tag">Coming Soon</div>
          <h3 className="coming-soon-title">Transfer Market</h3>
          <p className="coming-soon-desc">
            Scout, bid, and sign world-class players from the global transfer market.
            Upgrade your squad with strategic signings.
          </p>
          <button
            className="btn btn-outline"
            style={{ marginTop: 24, borderColor: 'rgba(180,79,255,0.5)', color: 'var(--neon-purple)' }}
            disabled
          >
            💸 Open Transfer Market
          </button>
        </div>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
};

export default Team;
