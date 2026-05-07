import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createLeague } from '../api/api';

const CreateLeague = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    leagueName: '',
    teamName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, leagueName, teamName } = form;
    if (!username.trim() || !leagueName.trim() || !teamName.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createLeague({ username, leagueName, teamName });

      // Persist league + team info
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
      setError(err.message || 'Failed to create league. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDashboard = () => {
    navigate('/dashboard');
  };

  if (success) {
    const code = success.leagueCode || success.code || success.league?.code || '------';
    return (
      <div className="form-page">
        <div className="form-page-inner">
          <div className="success-box">
            <div className="success-icon">🏆</div>
            <div className="success-title">League Created!</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
              Share this code with your friends so they can join{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {form.leagueName}
              </strong>
            </p>

            <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              League Code
            </div>
            <div className="code-display">{code}</div>

            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 28 }}>
              Keep this code safe — your friends will need it to join
            </p>

            <button
              className="btn btn-primary btn-full"
              onClick={handleEnterDashboard}
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
          <span className="form-page-eyebrow">New League</span>
          <h1 className="form-page-title">Create Your<br />League</h1>
          <p className="form-page-desc">
            Set up your league and invite managers with a unique code.
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
              <label className="form-label" htmlFor="leagueName">
                League Name
              </label>
              <input
                id="leagueName"
                name="leagueName"
                className="form-input"
                type="text"
                placeholder="e.g. Premier Championship"
                value={form.leagueName}
                onChange={handleChange}
                autoComplete="off"
                maxLength={48}
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
                placeholder="e.g. Iron City FC"
                value={form.teamName}
                onChange={handleChange}
                autoComplete="off"
                maxLength={32}
              />
            </div>

            <div style={{ height: 8 }} />

            <button
              type="submit"
              className={`btn btn-primary btn-full${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Creating League...
                </>
              ) : (
                '⚡ Create League'
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
            Have a code?{' '}
            <Link to="/join-league" style={{ color: 'var(--accent-primary)' }}>
              Join a league instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeague;
