import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import './DeveloperDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialFormState = {
  title: '',
  description: '',
  short_description: '',
  genre: '',
  release_date: '',
  price: '',
  cover_image_url: '',
  trailer_url: '',
  game_url: ''
};

function DeveloperDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingGameId, setEditingGameId] = useState(null);
  const [editingGameStatus, setEditingGameStatus] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  const isAuthorized = !!token && (user?.role === 'developer' || user?.role === 'admin');

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingGameId(null);
    setEditingGameStatus(null);
    setIsFormLoading(false);
    setFormError('');
    setShowForm(false);
  };

  const { data: gamesData, isLoading } = useQuery(
    ['myGames', user?.id],
    async () => {
      const response = await axios.get(`${API_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data.games || [];
    },
    {
      enabled: isAuthorized && !!user?.id
    }
  );

  const { data: genresData } = useQuery(
    'genres',
    async () => {
      const response = await axios.get(`${API_URL}/games/genres/list`);
      return response.data;
    },
    {
      enabled: isAuthorized
    }
  );

  const createGameMutation = useMutation(
    async (data) => {
      return axios.post(`${API_URL}/games`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myGames');
  setFeedback('Jeu enregistré en brouillon. Publiez-le quand il est prêt.');
        resetForm();
      },
      onError: (error) => {
        setFormError(error?.response?.data?.message || 'Erreur lors de la création du jeu');
      }
    }
  );

  const updateGameMutation = useMutation(
    async ({ id, data }) => {
      return axios.put(`${API_URL}/games/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('myGames');
        setFeedback(variables?.message || 'Jeu mis à jour avec succès');
        if (variables?.newStatus) {
          setEditingGameStatus(variables.newStatus);
        }
        if (variables?.resetForm !== false) {
          resetForm();
        }
      },
      onError: (error) => {
        setFormError(error?.response?.data?.message || 'Erreur lors de la mise à jour du jeu');
      }
    }
  );

  const deleteGameMutation = useMutation(
    async ({ id }) => {
      return axios.delete(`${API_URL}/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('myGames');
        setFeedback(variables?.message || 'Jeu supprimé avec succès');
        if (editingGameId === variables?.id) {
          resetForm();
        }
      },
      onError: (error) => {
        setFormError(error?.response?.data?.message || 'Erreur lors de la suppression du jeu');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setFormError('Permissions insuffisantes');
      return;
    }
    setFormError('');
    setFeedback('');

    const payload = {
      ...formData,
      price: formData.price === '' ? 0 : parseFloat(formData.price),
      release_date: formData.release_date || null
    };

    if (editingGameId) {
      updateGameMutation.mutate({
        id: editingGameId,
        data: payload,
        message: 'Jeu mis à jour avec succès'
      });
    } else {
      createGameMutation.mutate(payload);
    }
  };

  const handleToggleForm = () => {
    setFeedback('');
    setFormError('');
    if (showForm) {
      resetForm();
    } else {
      setFormData(initialFormState);
      setEditingGameId(null);
      setEditingGameStatus(null);
      setIsFormLoading(false);
      setShowForm(true);
    }
  };

  const handleEdit = async (gameId) => {
    if (!isAuthorized) {
      setFormError('Permissions insuffisantes');
      return;
    }
    setFeedback('');
    setFormError('');
    setIsFormLoading(true);
    try {
      const response = await axios.get(`${API_URL}/games/${gameId}`);
      const game = response.data.data;
      setFormData({
        title: game.title || '',
        description: game.description || '',
        short_description: game.short_description || '',
        genre: game.genre || '',
        release_date: game.release_date ? game.release_date.substring(0, 10) : '',
        price: game.price != null ? String(game.price) : '',
        cover_image_url: game.cover_image_url || '',
        trailer_url: game.trailer_url || '',
        game_url: game.game_url || ''
      });
      setEditingGameId(gameId);
      setEditingGameStatus(game.status);
      setShowForm(true);
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Impossible de charger le jeu');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handlePublish = (gameId) => {
    if (!isAuthorized) {
      setFormError('Permissions insuffisantes');
      return;
    }
    setFeedback('');
    setFormError('');
    updateGameMutation.mutate({
      id: gameId,
      data: { status: 'published' },
      message: 'Jeu publié avec succès',
      resetForm: false,
      newStatus: 'published'
    });
  };

  const handleDelete = (gameId) => {
    if (!isAuthorized) {
      setFormError('Permissions insuffisantes');
      return;
    }
    if (!window.confirm('Supprimer ce jeu ? Cette action est irréversible.')) {
      return;
    }
    setFeedback('');
    setFormError('');
    deleteGameMutation.mutate({ id: gameId, message: 'Jeu supprimé avec succès' });
  };

  if (!isAuthorized) {
    return (
      <div className="container">
        <div className="error-message">
          Vous devez être connecté en tant que développeur pour accéder à cette page.
        </div>
      </div>
    );
  }

  return (
    <div className="developer-dashboard">
      <div className="container">
        <h1>Tableau de bord développeur</h1>
        
        <div className="dashboard-header">
          <button onClick={handleToggleForm} className="btn btn-primary">
            {showForm ? 'Fermer le formulaire' : '+ Ajouter un jeu'}
          </button>
        </div>

        {feedback && <div className="feedback-message">{feedback}</div>}
        {formError && <div className="form-error">{formError}</div>}

        {showForm && (
          <div className="game-form">
            <h2>{editingGameId ? 'Modifier le jeu' : 'Nouveau jeu'}</h2>
            {editingGameStatus && (
              <p className="form-hint">Statut actuel : <strong>{editingGameStatus}</strong></p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isFormLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Genre *</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    required
                    disabled={isFormLoading}
                  >
                    <option value="">Sélectionner un genre</option>
                    {genresData?.data?.map(genre => (
                      <option key={genre.id} value={genre.name}>{genre.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description courte</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  maxLength={500}
                  disabled={isFormLoading}
                />
              </div>
              <div className="form-group">
                <label>Description complète *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="5"
                  required
                  disabled={isFormLoading}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de sortie</label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    disabled={isFormLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Prix (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={isFormLoading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>URL de l'image de couverture</label>
                  <input
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    disabled={isFormLoading}
                  />
                </div>
                <div className="form-group">
                  <label>URL du jeu</label>
                  <input
                    type="url"
                    value={formData.game_url}
                    onChange={(e) => setFormData({ ...formData, game_url: e.target.value })}
                    disabled={isFormLoading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>URL de la bande-annonce</label>
                <input
                  type="url"
                  value={formData.trailer_url}
                  onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                  disabled={isFormLoading}
                  />
                </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isFormLoading || createGameMutation.isLoading || updateGameMutation.isLoading}
              >
                {isFormLoading
                  ? 'Chargement...'
                  : editingGameId
                    ? (updateGameMutation.isLoading ? 'Enregistrement...' : 'Enregistrer les modifications')
                    : (createGameMutation.isLoading ? 'Création...' : 'Créer le jeu')}
              </button>
            </form>
          </div>
        )}

        <div className="my-games">
          <h2>Mes jeux ({gamesData?.length || 0})</h2>
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : gamesData?.length > 0 ? (
            <div className="games-grid">
              {gamesData.map(game => (
                <div key={game.id} className="game-card">
                  <img 
                    src={game.cover_image_url || '/api/placeholder/300/180'} 
                    alt={game.title}
                    className="game-img"
                  />
                  <div className="game-info">
                    <h3>{game.title}</h3>
                    <div className="game-status">
                      <span className={`status-badge ${game.status}`}>{game.status}</span>
                    </div>
                    <div className="game-stats">
                      <span>{game.views_count} vues</span>
                      {game.created_at && (
                        <span>Créé le {new Date(game.created_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                    <div className="game-actions">
                      <button 
                        onClick={() => navigate(`/games/${game.id}`)}
                        className="btn btn-secondary"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleEdit(game.id)}
                        className="btn btn-secondary"
                        disabled={isFormLoading}
                      >
                        Modifier
                      </button>
                      {game.status !== 'published' && (
                        <button
                          onClick={() => handlePublish(game.id)}
                          className="btn btn-primary"
                          disabled={updateGameMutation.isLoading}
                        >
                          Publier
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="btn btn-danger"
                        disabled={deleteGameMutation.isLoading}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-games">Aucun jeu créé pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeveloperDashboard;

