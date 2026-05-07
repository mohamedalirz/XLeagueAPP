import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const leagueData = JSON.parse(localStorage.getItem('fm_league') || 'null');
  const teamData = JSON.parse(localStorage.getItem('fm_team') || 'null');
  const isInLeague = !!(leagueData && teamData);

  const handleLogoClick = () => {
    navigate(isInLeague ? '/dashboard' : '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          className="navbar-logo"
          onClick={handleLogoClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="navbar-logo-icon">⚽</div>
          <span className="navbar-logo-text">
            Field<span>Ops</span>
          </span>
        </button>

        {/* Nav Links */}
        <div className="navbar-nav">
          {!isInLeague ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
                end
              >
                Home
              </NavLink>
              <NavLink
                to="/create-league"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                Create League
              </NavLink>
              <NavLink
                to="/join-league"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                Join League
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/team"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                My Team
              </NavLink>
              <NavLink
                to="/match"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                Match
              </NavLink>
              <NavLink
                to="/league"
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                League
              </NavLink>
            </>
          )}
        </div>

        {/* Status */}
        <div className="navbar-status">
          {isInLeague ? (
            <>
              <div className="status-dot" />
              <span>{teamData?.teamName || 'My Team'}</span>
            </>
          ) : (
            <>
              <div className="status-dot" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
              <span>Not in league</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
