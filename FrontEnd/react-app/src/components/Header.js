import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Game<span>Universe</span>
          </Link>
          <nav>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/games">Jeux</Link></li>
              <li><Link to="/catalogue">Catalogue</Link></li>
              {token && <li><Link to="/favorites">Mes favoris</Link></li>}
              {currentUser?.role === 'admin' && (
                <li><Link to="/admin/dashboard">Administration</Link></li>
              )}
            </ul>
          </nav>
          <div className="auth-buttons">
            {token ? (
              <>
                {(currentUser?.role === 'developer' || currentUser?.role === 'admin') && (
                  <Link to="/developer/dashboard" className="btn btn-secondary">
                    Tableau de bord
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-secondary">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Connexion</Link>
                <Link to="/register" className="btn btn-primary">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

