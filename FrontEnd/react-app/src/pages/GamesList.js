import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import './GamesList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function GamesList() {
  const [filters, setFilters] = useState({
    genre: '',
    search: '',
    sort: 'popularity',
    page: 1
  });

  const { data, isLoading, refetch } = useQuery(
    ['games', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.search) params.append('search', filters.search);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 12);

      const response = await axios.get(`${API_URL}/games?${params.toString()}`);
      return response.data;
    }
  );

  const { data: genresData } = useQuery('genres', async () => {
    const response = await axios.get(`${API_URL}/games/genres/list`);
    return response.data;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="games-list">
      <div className="container">
        <h1 className="page-title">Catalogue de Jeux</h1>
        
        <div className="filter-section">
          <form onSubmit={handleSearch}>
            <div className="filter-controls">
              <div className="filter-group">
                <label>Recherche</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Rechercher un jeu..."
                  className="filter-control"
                />
              </div>
              <div className="filter-group">
                <label>Genre</label>
                <select
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                  className="filter-control"
                >
                  <option value="">Tous les genres</option>
                  {genresData?.data?.map(genre => (
                    <option key={genre.id} value={genre.name}>{genre.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Trier par</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="filter-control"
                >
                  <option value="popularity">Popularité</option>
                  <option value="rating">Note</option>
                  <option value="date">Date de sortie</option>
                  <option value="name">Nom (A-Z)</option>
                </select>
              </div>
              <div className="filter-group">
                <button type="submit" className="btn btn-primary">Rechercher</button>
              </div>
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            <div className="games-grid">
              {data?.data?.map(game => (
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

            {data?.pagination && (
              <div className="pagination">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="btn btn-secondary"
                >
                  Précédent
                </button>
                <span>Page {data.pagination.page} sur {data.pagination.totalPages}</span>
                <button
                  disabled={filters.page >= data.pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="btn btn-secondary"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GamesList;

