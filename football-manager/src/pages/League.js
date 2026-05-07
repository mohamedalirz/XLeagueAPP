import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getLeague } from '../api/api';
import LeagueTable from '../components/LeagueTable';

const League = () => {
  const navigate = useNavigate();

  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedLeague = JSON.parse(localStorage.getItem('fm_league') || 'null');
  const storedTeam = JSON.parse(localStorage.getItem('fm_team') || 'null');

  const fetchLeague = useCallback(async () => {
    setLoading(true);
    const id = storedLeague?.id || storedLeague?.leagueId;

    if (!id) {
      setLeagueData(storedLeague);
      setLoading(false);
      return;
    }

    try {
      const data = await getLeague(id);
      setLeagueData(data);
      localStorage.setItem('fm_league', JSON.stringify(data.league || data));
    } catch (err) {
      setError(err.message);
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div className="loading-text">Loading League</div>
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

  // Stats
  const myTeamData = teams.find(
    (t) => t.teamName === myTeamName || t.id === storedTeam?.id
  );
  const myRank = myTeamData
    ? [...teams]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .findIndex((t) => t.teamName === myTeamName || t.id === storedTeam?.id) + 1
    : null;

  const totalMatches = teams.reduce(
    (s, t) => s + (t.wins || 0) + (t.draws || 0) + (t.losses || 0),
    0
  ) / 2;

  const topScorer = teams.reduce(
    (best, t) => ((t.goalsFor || 0) > (best?.goalsFor || 0) ? t : best),
    null
  );

  return (
    <div className="container">
      {/* Header */}
      <div style={{ padding: '40px 0 32px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: 8 }}>
              League Overview
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 }}>
              {leagueName}
            </h1>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 10,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 4,
                padding: '5px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--accent-primary)',
              }}
            >
              Code: {leagueCode}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/match" className="btn btn-primary btn-sm">
              ⚽ Play Match
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchLeague}
            >
              🔄 Refresh
            </button>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          <span className="alert-icon">ℹ️</span>
          <span>Showing cached data — {error}</span>
        </div>
      )}

      {/* League Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {[
          { label: 'Teams', value: teams.length, icon: '👥', color: 'var(--accent-primary)' },
          { label: 'Matches Played', value: Math.floor(totalMatches), icon: '⚽', color: 'var(--neon-green)' },
          { label: 'My Rank', value: myRank ? `#${myRank}` : '—', icon: '🏆', color: 'var(--neon-amber)' },
          { label: 'Top Attack', value: topScorer?.teamName?.split(' ')[0] || '—', icon: '🎯', color: 'var(--neon-red)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 700,
                color: stat.color,
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* My position highlight */}
      {myTeamData && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            background: 'rgba(0, 229, 255, 0.04)',
            borderColor: 'var(--border-bright)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 20px',
          }}
        >
          <div style={{ fontSize: 28 }}>
            {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '📍'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {myTeamData.teamName}
              <span className="badge badge-cyan" style={{ marginLeft: 8, fontSize: 9 }}>YOU</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {myTeamData.wins || 0}W — {myTeamData.draws || 0}D — {myTeamData.losses || 0}L
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1 }}>
              {myTeamData.points || 0}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
              Points
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--neon-amber)', lineHeight: 1 }}>
              #{myRank}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>
              Rank
            </div>
          </div>
        </div>
      )}

      {/* League Table */}
      <LeagueTable teams={teams} myTeamId={myTeamName} />

      {/* Transfer Market CTA */}
      <div style={{ marginTop: 40 }}>
        <div className="coming-soon-banner">
          <div className="coming-soon-tag">Coming Soon</div>
          <h3 className="coming-soon-title">Player Transfer Market</h3>
          <p className="coming-soon-desc">
            Strengthen your squad by signing top players from the global market.
            Trade, bid, and negotiate your way to the top.
          </p>
        </div>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
};

export default League;
