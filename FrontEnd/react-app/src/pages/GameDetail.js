import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import './GameDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function GameDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: gameData, isLoading } = useQuery(['game', id], async () => {
    const response = await axios.get(`${API_URL}/games/${id}`);
    return response.data;
  });

  const { data: commentsData, refetch: refetchComments } = useQuery(
    ['comments', id],
    async () => {
      const response = await axios.get(`${API_URL}/comments/game/${id}`);
      return response.data;
    }
  );

  const { data: userRating } = useQuery(
    ['rating', id],
    async () => {
      if (!token) return null;
      const response = await axios.get(`${API_URL}/ratings/game/${id}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    { enabled: !!token }
  );

  const { data: isFavorite } = useQuery(
    ['favorite', id],
    async () => {
      if (!token) return null;
      const response = await axios.get(`${API_URL}/favorites/game/${id}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    { enabled: !!token }
  );

  const rateMutation = useMutation(
    async (ratingValue) => {
      return axios.post(
        `${API_URL}/ratings`,
        { game_id: parseInt(id), rating: ratingValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['game', id]);
        queryClient.invalidateQueries(['rating', id]);
      }
    }
  );

  const commentMutation = useMutation(
    async () => {
      return axios.post(
        `${API_URL}/comments`,
        { game_id: parseInt(id), content: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    {
      onSuccess: () => {
        setComment('');
        refetchComments();
      }
    }
  );

  const favoriteMutation = useMutation(
    async (favorite) => {
      if (favorite) {
        return axios.delete(`${API_URL}/favorites/game/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      return axios.post(
        `${API_URL}/favorites`,
        { game_id: parseInt(id, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorite', id]);
        queryClient.invalidateQueries(['game', id]);
      }
    }
  );

  const favoriteStatus = Boolean(isFavorite);

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  const game = gameData?.data;

  return (
    <div className="game-detail">
      <div className="container">
        <div className="game-header">
          <img 
            src={game?.cover_image_url || '/api/placeholder/800/400'} 
            alt={game?.title}
            className="game-cover"
          />
          <div className="game-header-info">
            <h1>{game?.title}</h1>
            <p className="game-developer">Par {game?.developer_name}</p>
            <div className="game-stats">
              <div className="stat">
                <span className="stat-label">Note moyenne</span>
                <span className="stat-value">★ {parseFloat(game?.average_rating || 0).toFixed(1)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Vues</span>
                <span className="stat-value">{game?.views_count || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Favoris</span>
                <span className="stat-value">{game?.favorites_count || 0}</span>
              </div>
            </div>
            {token && (
              <button
                type="button"
                className="btn btn-secondary favorite-button"
                onClick={() => favoriteMutation.mutate(favoriteStatus)}
                disabled={favoriteMutation.isLoading}
              >
                {favoriteStatus ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
            )}
            {game?.game_url && (
              <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Jouer maintenant
              </a>
            )}
          </div>
        </div>

        <div className="game-content">
          <div className="game-description">
            <h2>Description</h2>
            <p>{game?.description}</p>
            <div className="game-tags">
              <span className="tag">{game?.genre}</span>
            </div>
          </div>

          {token && (
            <div className="rating-section">
              <h3>Votre note</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star ${star <= (userRating?.rating || rating) ? 'active' : ''}`}
                    onClick={() => {
                      setRating(star);
                      rateMutation.mutate(star);
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="comments-section">
            <h2>Commentaires ({commentsData?.data?.length || 0})</h2>
            
            {token && (
              <div className="comment-form">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Écrivez un commentaire..."
                  rows="4"
                />
                <button
                  onClick={() => commentMutation.mutate()}
                  disabled={!comment.trim() || commentMutation.isLoading}
                  className="btn btn-primary"
                >
                  {commentMutation.isLoading ? 'Publication…' : 'Publier'}
                </button>
              </div>
            )}

            <div className="comments-list">
              {commentsData?.data?.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.username}</strong>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;

