import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🏆',
    title: 'Create Leagues',
    desc: 'Set up your own private league and invite friends with a unique code.',
  },
  {
    icon: '⚽',
    title: 'Manage Your Team',
    desc: 'Pick your squad of 11 players, track power and XP progression.',
  },
  {
    icon: '🎮',
    title: 'Simulated Matches',
    desc: 'Watch match events unfold in real time with live score updates.',
  },
  {
    icon: '📊',
    title: 'Live Standings',
    desc: 'Climb the league table with wins, goals and form tracked.',
  },
  {
    icon: '💸',
    title: 'Transfer Market',
    desc: 'Buy, sell and scout players across the market. (Coming Soon)',
    soon: true,
  },
  {
    icon: '🌐',
    title: 'Multiplayer',
    desc: 'Compete against real managers from around the world.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  // If already in a league, redirect
  useEffect(() => {
    const league = localStorage.getItem('fm_league');
    const team = localStorage.getItem('fm_team');
    if (league && team) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div>
      {/* Hero */}
      <section className="home-hero">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div className="home-hero-badge">
            <span>🟢</span>
            <span>Multiplayer Season Active</span>
          </div>

          <h1 className="home-hero-title">
            The Ultimate<br />
            <span className="highlight">Football Manager</span>
          </h1>

          <p className="home-hero-subtitle">
            Build your squad, manage your tactics, and dominate the league.
            Compete against real managers in real-time simulated matches.
          </p>

          <div className="home-hero-actions">
            <Link to="/create-league" className="btn btn-primary btn-lg">
              ⚡ Create League
            </Link>
            <Link to="/join-league" className="btn btn-outline btn-lg">
              🤝 Join League
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="home-stats">
        <div className="home-stat-item">
          <span className="home-stat-number">2,481</span>
          <span className="home-stat-label">Active Managers</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-number">14,822</span>
          <span className="home-stat-label">Matches Played</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-number">318</span>
          <span className="home-stat-label">Leagues Running</span>
        </div>
      </div>

      {/* Features */}
      <section className="container page-section">
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-eyebrow">Everything You Need</div>
          <div className="section-title-lg">Built for Managers</div>
        </div>

        <div
          className="stagger-children"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card card-glow animate-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                style={{
                  fontSize: 32,
                  marginBottom: 14,
                  filter: f.soon ? 'grayscale(0.5)' : undefined,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: 0.5,
                  }}
                >
                  {f.title}
                </h3>
                {f.soon && (
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(180,79,255,0.1)',
                      border: '1px solid rgba(180,79,255,0.4)',
                      color: 'var(--neon-purple)',
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '80px 24px',
          textAlign: 'center',
          background: 'var(--bg-deep)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: -1,
            marginBottom: 16,
            color: 'var(--text-primary)',
          }}
        >
          Ready to{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dominate
          </span>
          ?
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 16,
            marginBottom: 36,
          }}
        >
          Create a league in under 60 seconds. Free to play.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/create-league" className="btn btn-primary btn-lg">
            ⚡ Start a League
          </Link>
          <Link to="/join-league" className="btn btn-ghost btn-lg">
            Enter League Code
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
