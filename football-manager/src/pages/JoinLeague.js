import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { joinLeague } from '../api/api';

const JoinLeague = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    leagueCode: '',
    teamName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'leagueCode' ? value.toUpperCase() : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, leagueCode, teamName } = form;
    if (!username.trim() || !leagueCode.trim() || !teamName.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await joinLeague({ username, leagueCode, teamName });

      localStorage.setItem('fm_league', JSON.stringify(data.league || data));
      localStorage.setItem(
        'fm_team',
        JSON.stringify({
          teamName,
          managerName: username,
          id: data.teamId || data.team?.id,
          ...(data.team || {}),
        })
      );

      setSuccess(data);
    } catch (err) {
      setError(err.message || 'Failed to join league. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const leagueName =
      success.league?.leagueName ||
      success.leagueName ||
      'your league';

    return (
      <div className="form-page">
        <div className="form-page-inner">
          <div className="success-box">
            <div className="success-icon">🤝</div>
            <div className="success-title">Joined Successfully!</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Welcome to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {leagueName}
              </strong>
              ! Your team{' '}
              <strong style={{ color: 'var(--accent-primary)' }}>
                {form.teamName}
              </strong>{' '}
              is ready to compete.
            </p>

            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 24 }}>⚽</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {form.teamName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  @{form.username}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/dashboard')}
            >
              Enter Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-inner">
        {/* Header */}
        <div className="form-page-header">
          <Link
            to="/"
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 24,
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
          <span className="form-page-eyebrow">Join a League</span>
          <h1 className="form-page-title">Enter the<br />Arena</h1>
          <p className="form-page-desc">
            Got a league code? Jump right in and start competing.
          </p>
        </div>

        {/* Form */}
        <div className="form-card">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Your Username
              </label>
              <input
                id="username"
                name="username"
                className="form-input"
                type="text"
                placeholder="e.g. TacticalGenius99"
                value={form.username}
                onChange={handleChange}
                autoComplete="off"
                maxLength={32}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="leagueCode">
                League Code
              </label>
              <input
                id="leagueCode"
                name="leagueCode"
                className="form-input"
                type="text"
                placeholder="e.g. ABC123"
                value={form.leagueCode}
                onChange={handleChange}
                autoComplete="off"
                maxLength={12}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  letterSpacing: 4,
                  textAlign: 'center',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="teamName">
                Your Team Name
              </label>
              <input
                id="teamName"
                name="teamName"
                className="form-input"
                type="text"
                placeholder="e.g. Storm United"
                value={form.teamName}
                onChange={handleChange}
                autoComplete="off"
                maxLength={32}
              />
            </div>

            <div style={{ height: 8 }} />

            <button
              type="submit"
              className={`btn btn-success btn-full${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Joining League...
                </>
              ) : (
                '🤝 Join League'
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            No league yet?{' '}
            <Link to="/create-league" style={{ color: 'var(--accent-primary)' }}>
              Create one instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinLeague;
