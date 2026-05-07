import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { playMatch } from '../api/api';
import MatchCard from '../components/MatchCard';

const Match = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);

  const storedTeam = JSON.parse(localStorage.getItem('fm_team') || 'null');
  const storedLeague = JSON.parse(localStorage.getItem('fm_league') || 'null');

  useEffect(() => {
    if (!storedTeam || !storedLeague) {
      navigate('/');
      return;
    }

    // Load match history from storage
    const history = JSON.parse(localStorage.getItem('fm_match_history') || '[]');
    setMatchHistory(history);
  }, [navigate]); // eslint-disable-line

  const handlePlayMatch = async () => {
    setLoading(true);
    setError('');
    setCurrentMatch(null);

    try {
      const payload = {
        leagueId: storedLeague?.id || storedLeague?.leagueId,
        teamId: storedTeam?.id,
        teamName: storedTeam?.teamName,
      };

      const result = await playMatch(payload);

      const matchResult = result.match || result;
      setCurrentMatch(matchResult);

      // Save to history
      const history = JSON.parse(localStorage.getItem('fm_match_history') || '[]');
      const updated = [matchResult, ...history].slice(0, 20);
      localStorage.setItem('fm_match_history', JSON.stringify(updated));
      setMatchHistory(updated);

    } catch (err) {
      setError(err.message || 'Match failed to load. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const myTeamName = storedTeam?.teamName;

  const getResultLabel = (match) => {
    if (!match) return null;
    const isHome = match.homeTeam === myTeamName;
    const isAway = match.awayTeam === myTeamName;
    if (!isHome && !isAway) return null;
    if (match.homeScore === match.awayScore) return 'D';
    if ((isHome && match.homeScore > match.awayScore) ||
        (isAway && match.awayScore > match.homeScore)) {
      return 'W';
    }
    return 'L';
  };

  return (
    <div className="container match-page">
      {/* Header */}
      <div className="match-page-header">
        <h1 className="match-page-title">Match Day</h1>
        <p className="match-page-subtitle">
          {myTeamName ? (
            <>
              Playing as{' '}
              <strong style={{ color: 'var(--accent-primary)' }}>{myTeamName}</strong>
            </>
          ) : (
            'No team selected'
          )}
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="match-content-grid">
        {/* Play area */}
        <div>
          <div className="card match-play-card" style={{ padding: '36px 28px' }}>
            <div className="match-play-card card-title"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 8,
              }}
            >
              Ready to Kick Off
            </div>

            {!currentMatch && !loading && (
              <span className="match-play-icon">⚽</span>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div
                  style={{
                    fontSize: 48,
                    marginBottom: 20,
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }}
                >
                  ⚽
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  Match in Progress...
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}
                >
                  Simulating 90 minutes
                </div>
              </div>
            )}

            {currentMatch && !loading && (
              <MatchCard match={currentMatch} myTeamName={myTeamName} />
            )}

            <button
              className={`btn btn-primary btn-full${loading ? ' loading' : ''}`}
              onClick={handlePlayMatch}
              disabled={loading}
              style={{ marginTop: currentMatch ? 20 : 0 }}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Simulating...
                </>
              ) : currentMatch ? (
                '🔄 Play Again'
              ) : (
                '⚽ Kick Off'
              )}
            </button>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 12,
              }}
            >
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                Dashboard
              </Link>
              <Link to="/league" className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                Standings
              </Link>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Recent Results
            <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            {matchHistory.length > 0 && (
              <span className="badge badge-cyan">{matchHistory.length}</span>
            )}
          </div>

          {matchHistory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No matches yet</div>
              <div className="empty-state-desc">Play your first match to see results here</div>
            </div>
          ) : (
            <div className="match-history stagger-children">
              {matchHistory.map((m, i) => {
                const result = getResultLabel(m);
                return (
                  <div
                    key={i}
                    className="match-history-item animate-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="match-history-score">
                      {m.homeScore ?? '?'} – {m.awayScore ?? '?'}
                    </div>
                    <div className="match-history-teams">
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {m.homeTeam} vs {m.awayTeam}
                      </div>
                      {m.winner && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          🏆 {m.winner}
                        </div>
                      )}
                    </div>
                    {result && (
                      <div className={`match-history-result ${result}`}>
                        {result}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {matchHistory.length > 0 && (
            <button
              className="btn btn-ghost btn-sm btn-full"
              style={{ marginTop: 12 }}
              onClick={() => {
                localStorage.removeItem('fm_match_history');
                setMatchHistory([]);
              }}
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
};

export default Match;
