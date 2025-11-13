const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('./auth');

const router = express.Router();

// Middleware global : seulement pour les admins
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Gestion des utilisateurs
router.get('/users', [
  query('role').optional().isIn(['player', 'developer', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, username, email, role, created_at, updated_at FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    const [users] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

router.patch('/users/:id/role', [
  param('id').isInt().withMessage('ID utilisateur invalide').toInt(),
  body('role').isIn(['player', 'developer', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    const [result] = await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rôle',
      error: error.message
    });
  }
});

// Modération des commentaires
router.get('/comments/pending', async (req, res) => {
  try {
    const [comments] = await pool.execute(`
      SELECT c.id, c.game_id, c.user_id, c.content, c.created_at,
             u.username AS author, g.title AS game_title
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN games g ON c.game_id = g.id
      WHERE c.is_approved = FALSE
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires en attente',
      error: error.message
    });
  }
});

router.patch('/comments/:id/approval', [
  param('id').isInt().withMessage('ID de commentaire invalide').toInt(),
  body('is_approved').isBoolean().withMessage('Statut invalide').toBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { is_approved } = req.body;

    const [result] = await pool.execute(
      'UPDATE comments SET is_approved = ? WHERE id = ?',
      [is_approved, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Statut du commentaire mis à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du commentaire',
      error: error.message
    });
  }
});

router.delete('/comments/:id', [
  param('id').isInt().withMessage('ID de commentaire invalide').toInt()
], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Commentaire supprimé'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
});

// Gestion des jeux
router.get('/games', [
  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT g.id, g.title, g.status, g.genre, g.created_at, g.updated_at,
             u.username AS developer_name
      FROM games g
      JOIN users u ON g.developer_id = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE g.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY g.created_at DESC';

    const [games] = await pool.execute(sql, params);

    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des jeux',
      error: error.message
    });
  }
});

router.patch('/games/:id/status', [
  param('id').isInt().withMessage('ID de jeu invalide').toInt(),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.execute(
      'UPDATE games SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Statut du jeu mis à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du jeu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du jeu',
      error: error.message
    });
  }
});

module.exports = router;
