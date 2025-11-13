import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = !!token && user?.role === 'admin';

  const fetchUsers = async () => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  };

  const fetchGames = async () => {
    const queryParam = selectedStatusFilter !== 'all' ? `?status=${selectedStatusFilter}` : '';
    const response = await axios.get(`${API_URL}/admin/games${queryParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  };

  const fetchPendingComments = async () => {
    const response = await axios.get(`${API_URL}/admin/comments/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  };

  const { data: users, isLoading: usersLoading } = useQuery(['admin-users'], fetchUsers, {
    enabled: isAdmin
  });
  const { data: games, isLoading: gamesLoading } = useQuery(['admin-games', selectedStatusFilter], fetchGames, {
    enabled: isAdmin
  });
  const { data: comments, isLoading: commentsLoading } = useQuery(['admin-comments'], fetchPendingComments, {
    enabled: isAdmin
  });

  const handleError = (error, fallback) => {
    setErrorMessage(error?.response?.data?.message || fallback);
    setSuccessMessage('');
  };

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');
  };

  const updateUserRoleMutation = useMutation(
    async ({ id, role }) => {
      return axios.patch(`${API_URL}/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['admin-users']);
        handleSuccess(`Rôle mis à jour pour l'utilisateur #${variables.id}`);
      },
      onError: (error) => handleError(error, 'Erreur lors de la mise à jour du rôle utilisateur')
    }
  );

  const updateGameStatusMutation = useMutation(
    async ({ id, status }) => {
      return axios.patch(`${API_URL}/admin/games/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['admin-games']);
        queryClient.invalidateQueries('myGames');
        handleSuccess(`Statut du jeu #${variables.id} mis à jour`);
      },
      onError: (error) => handleError(error, 'Erreur lors de la mise à jour du statut du jeu')
    }
  );

  const approveCommentMutation = useMutation(
    async ({ id, isApproved }) => {
      return axios.patch(`${API_URL}/admin/comments/${id}/approval`, { is_approved: isApproved }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-comments']);
        handleSuccess('Commentaire mis à jour');
      },
      onError: (error) => handleError(error, 'Erreur lors de la mise à jour du commentaire')
    }
  );

  const deleteCommentMutation = useMutation(
    async ({ id }) => {
      return axios.delete(`${API_URL}/admin/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-comments']);
        handleSuccess('Commentaire supprimé');
      },
      onError: (error) => handleError(error, 'Erreur lors de la suppression du commentaire')
    }
  );

  const renderUsersSection = () => (
    <section>
      <div className="section-header">
        <h2>Utilisateurs</h2>
      </div>
      {usersLoading ? (
        <div className="loading">Chargement…</div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(event) =>
                        updateUserRoleMutation.mutate({ id: u.id, role: event.target.value })
                      }
                      disabled={updateUserRoleMutation.isLoading}
                    >
                      <option value="player">Joueur</option>
                      <option value="developer">Développeur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderGamesSection = () => (
    <section>
      <div className="section-header">
        <h2>Jeux</h2>
        <select
          value={selectedStatusFilter}
          onChange={(event) => {
            setSelectedStatusFilter(event.target.value);
          }}
        >
          <option value="all">Tous</option>
          <option value="draft">Brouillons</option>
          <option value="published">Publiés</option>
          <option value="archived">Archivés</option>
        </select>
      </div>
      {gamesLoading ? (
        <div className="loading">Chargement…</div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Développeur</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {games?.map((game) => (
                <tr key={game.id}>
                  <td>{game.id}</td>
                  <td>{game.title}</td>
                  <td>{game.developer_name}</td>
                  <td>
                    <select
                      value={game.status}
                      onChange={(event) =>
                        updateGameStatusMutation.mutate({ id: game.id, status: event.target.value })
                      }
                      disabled={updateGameStatusMutation.isLoading}
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </td>
                  <td>{new Date(game.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="table-actions">
                    <Link
                      className="btn btn-secondary"
                      to={`/games/${game.id}`}
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderCommentsSection = () => (
    <section>
      <div className="section-header">
        <h2>Commentaires en attente</h2>
      </div>
      {commentsLoading ? (
        <div className="loading">Chargement…</div>
      ) : comments?.length ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div>
                  <strong>#{comment.id}</strong> – {comment.author}
                </div>
                <span>
                  Jeu #{comment.game_id} • {comment.game_title}
                </span>
              </div>
              <p>{comment.content}</p>
              <div className="comment-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => approveCommentMutation.mutate({ id: comment.id, isApproved: true })}
                  disabled={approveCommentMutation.isLoading}
                >
                  Approuver
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => approveCommentMutation.mutate({ id: comment.id, isApproved: false })}
                  disabled={approveCommentMutation.isLoading}
                >
                  Rejeter
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => deleteCommentMutation.mutate({ id: comment.id })}
                  disabled={deleteCommentMutation.isLoading}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">Aucun commentaire à valider.</p>
      )}
    </section>
  );

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error-message">
            Accès réservé à l'administration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Administration</h1>
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <div className="admin-grid">
          {renderUsersSection()}
          {renderGamesSection()}
          {renderCommentsSection()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
