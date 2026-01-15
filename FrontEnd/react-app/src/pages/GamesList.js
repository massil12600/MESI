import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import './GamesList.css';
import SearchBar from '../components/SearchBar';
import FiltersPanel from '../components/FiltersPanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function GamesList() {
  const [filters, setFilters] = useState({
    genre: '',
    genres: [],
    platforms: [],
    search: '',
    sort: 'popularity',
    page: 1
  });

  const { data, isLoading, refetch } = useQuery(
    ['games', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.search) params.append('q', filters.search);
      if (filters.genres && filters.genres.length) {
        filters.genres.forEach(g => params.append('genres', g));
      }
      if (filters.platforms && filters.platforms.length) {
        filters.platforms.forEach(p => params.append('platforms', p));
      }
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

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handlePanelChange = (nextFilters) => {
    setFilters(prev => ({ ...prev, ...nextFilters, page: 1 }));
  };

  return (
    <div className="games-list">
      <div className="container">
        <h1 className="page-title">Catalogue de Jeux</h1>
        
        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label>Recherche</label>
              <SearchBar value={filters.search} onChange={handleSearchChange} />
            </div>
            <div className="filter-group">
              <label>Filtres</label>
              <FiltersPanel
                filters={filters}
                options={{ genres: genresData?.data?.map(g => g.name) || [] }}
                onChange={handlePanelChange}
              />
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
          </div>
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

