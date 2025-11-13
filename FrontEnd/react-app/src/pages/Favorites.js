import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import './Favorites.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Favorites() {
  const token = localStorage.getItem('token');
  const { data, isLoading, isError, error } = useQuery(
    ['favorites'],
    async () => {
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    {
      enabled: !!token
    }
  );

  if (!token) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="info-card">
            <h1>Mes favoris</h1>
            <p>Vous devez être connecté pour consulter vos jeux favoris.</p>
            <Link to="/login" className="btn btn-primary">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="error-card">
            <h1>Mes favoris</h1>
            <p>Une erreur est survenue : {error?.response?.data?.message || error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        <h1 className="page-title">Mes jeux favoris</h1>
        {data?.length ? (
          <div className="games-grid">
            {data.map((game) => (
              <Link key={game.game_id} to={`/games/${game.game_id}`} className="game-card">
                <img
                  src={game.cover_image_url || '/api/placeholder/300/180'}
                  alt={game.title}
                  className="game-img"
                />
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-meta">
                    <span className="genre">{game.genre}</span>
                    <span>{game.views_count} vues</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="info-card">
            <h2>Aucun favori pour le moment</h2>
            <p>Explorez le catalogue et ajoutez des jeux à vos favoris.</p>
            <Link to="/games" className="btn btn-secondary">Découvrir des jeux</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
