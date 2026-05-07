import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getLeague } from '../api/api';
import TeamCard from '../components/TeamCard';
import LeagueTable from '../components/LeagueTable';

const Dashboard = () => {
  const navigate = useNavigate();

  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedLeague = JSON.parse(localStorage.getItem('fm_league') || 'null');
  const storedTeam = JSON.parse(localStorage.getItem('fm_team') || 'null');

  const fetchLeague = useCallback(async () => {
    const id = storedLeague?.id || storedLeague?.leagueId;
    if (!id) {
      setLeagueData(storedLeague);
      setLoading(false);
      return;
    }

    try {
      const data = await getLeague(id);
      setLeagueData(data);
      // Refresh stored
      localStorage.setItem('fm_league', JSON.stringify(data.league || data));
    } catch (err) {
      setError(err.message);
      // Fall back to stored data
      setLeagueData(storedLeague);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!storedLeague || !storedTeam) {
      navigate('/');
      return;
    }
    fetchLeague();
  }, [navigate, fetchLeague]); // eslint-disable-line

  const handleLeave = () => {
    if (window.confirm('Leave this league? Your progress will be lost.')) {
      localStorage.removeItem('fm_league');
      localStorage.removeItem('fm_team');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Loading Dashboard</div>
        <div className="loading-pulse">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  const league = leagueData?.league || leagueData || storedLeague || {};
  const teams = leagueData?.teams || league.teams || [];
  const leagueName = league.leagueName || league.name || 'My League';
  const leagueCode = league.code || league.leagueCode || '------';
  const myTeamName = storedTeam?.teamName;

  return (
    <div className="container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-league-info">
          <div>
            <div className="dashboard-league-name">{leagueName}</div>
            <div className="dashboard-league-code">
              <span style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Code:
              </span>
              <span>{leagueCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(leagueCode);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 0,
                }}
                title="Copy code"
              >
                📋
              </button>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link to="/match" className="btn btn-primary">
              ⚽ Play Match
            </Link>
            <Link to="/team" className="btn btn-outline">
              👥 My Team
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLeave}>
              Leave
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <span className="alert-icon">ℹ️</span>
          <span>Using cached data — {error}</span>
        </div>
      )}

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Teams list */}
        <div className="dashboard-teams-section">
          <div className="section-title" style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            Teams
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span className="badge badge-cyan">{teams.length}</span>
          </div>

          {teams.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No teams yet</div>
              <div className="empty-state-desc">
                Share code <strong style={{ color: 'var(--accent-primary)' }}>{leagueCode}</strong> to invite managers
              </div>
            </div>
          ) : (
            <div className="teams-list stagger-children">
              {/* My team first */}
              {storedTeam && (
                <TeamCard
                  team={{
                    ...storedTeam,
                    teamName: myTeamName,
                    managerName: storedTeam.managerName || storedTeam.username,
                    ...teams.find((t) => t.teamName === myTeamName || t.id === storedTeam.id),
                  }}
                  index={0}
                  isMyTeam={true}
                />
              )}
              {teams
                .filter((t) => t.teamName !== myTeamName && t.id !== storedTeam?.id)
                .map((team, i) => (
                  <TeamCard key={team.id || i} team={team} index={i + 1} />
                ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <Link to="/match" className="btn btn-success" style={{ flex: 1 }}>
              ⚽ Play Next Match
            </Link>
            <Link to="/league" className="btn btn-outline">
              📊 Full Table
            </Link>
          </div>
        </div>

        {/* Sidebar: Standings */}
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            Standings
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>
          <LeagueTable teams={teams} myTeamId={myTeamName} />

          {/* Refresh button */}
          <button
            className="btn btn-ghost btn-sm btn-full"
            style={{ marginTop: 12 }}
            onClick={fetchLeague}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
};

export default Dashboard;
