import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Home() {
  const { data: gamesData, isLoading } = useQuery('featuredGames', async () => {
    const response = await axios.get(`${API_URL}/games?limit=6&sort=popularity`);
    return response.data;
  });

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Bienvenue sur Game Universe</h1>
          <p className="hero-subtitle">
            Découvrez une collection unique de jeux indépendants créés par des développeurs passionnés
          </p>
          <div className="hero-buttons">
            <Link to="/games" className="btn btn-primary">Explorer les jeux</Link>
            <Link to="/register" className="btn btn-secondary">Devenir développeur</Link>
          </div>
        </div>
      </section>

      <section className="featured-games">
        <div className="container">
          <h2 className="section-title">Jeux populaires</h2>
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <div className="games-grid">
              {gamesData?.data?.map(game => (
                <div key={game.id} className="game-card">
                  <Link to={`/games/${game.id}`}>
                    <img 
                      src={game.cover_image_url || '/api/placeholder/300/180'} 
                      alt={game.title}
                      className="game-img"
                    />
                    <div className="game-info">
                      <h3>{game.title}</h3>
                      <p className="game-description">{game.short_description || game.description.substring(0, 100)}...</p>
                      <div className="game-meta">
                        <div className="rating">★ {parseFloat(game.average_rating).toFixed(1)}</div>
                        <div className="genre">{game.genre}</div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

