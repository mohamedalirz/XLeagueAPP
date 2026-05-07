import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dark-card/95 backdrop-blur-md border-b border-neon-green/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
              <span className="text-dark-bg font-bold text-xl">X</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-neon-green to-green-400 bg-clip-text text-transparent">
              XLeague
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/league">League</NavLink>
              <NavLink to="/team">Team</NavLink>
              <NavLink to="/matches">Matches</NavLink>
              <NavLink to="/transfers">Transfers</NavLink>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-300">
                  Welcome, <span className="text-neon-green font-semibold">{user.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {user && (
          <div className="flex md:hidden justify-center space-x-4 mt-4">
            <MobileNavLink to="/dashboard">Home</MobileNavLink>
            <MobileNavLink to="/league">League</MobileNavLink>
            <MobileNavLink to="/team">Team</MobileNavLink>
            <MobileNavLink to="/matches">Matches</MobileNavLink>
            <MobileNavLink to="/transfers">Transfers</MobileNavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-300 hover:text-neon-green transition-colors duration-300 font-medium"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-sm text-gray-300 hover:text-neon-green transition-colors duration-300"
  >
    {children}
  </Link>
);

export default Navbar;