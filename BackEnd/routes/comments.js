const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');
const { body, validationResult } = require('express-validator');

// Obtenir les commentaires d'un jeu
router.get('/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const [comments] = await pool.execute(`
      SELECT 
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.game_id = ? AND c.is_approved = TRUE AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, [gameId]);

    // Pour chaque commentaire, récupérer les réponses
    for (let comment of comments) {
      const [replies] = await pool.execute(`
        SELECT 
          c.*,
          u.username,
          u.avatar_url
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ? AND c.is_approved = TRUE
        ORDER BY c.created_at ASC
      `, [comment.id]);
      comment.replies = replies;
    }

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
});

// Créer un commentaire
router.post('/', authenticateToken, [
  body('game_id').isInt().withMessage('ID de jeu invalide'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Le commentaire doit contenir entre 1 et 1000 caractères'),
  body('parent_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { game_id, content, parent_id } = req.body;

    // Vérifier que le jeu existe
    const [games] = await pool.execute('SELECT id FROM games WHERE id = ?', [game_id]);
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    // Si c'est une réponse, vérifier que le commentaire parent existe
    if (parent_id) {
      const [parents] = await pool.execute('SELECT id FROM comments WHERE id = ?', [parent_id]);
      if (parents.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Commentaire parent non trouvé'
        });
      }
    }

    const isApproved = req.user.role === 'admin';

    const [result] = await pool.execute(
      'INSERT INTO comments (game_id, user_id, content, parent_id, is_approved) VALUES (?, ?, ?, ?, ?)',
      [game_id, req.user.userId, content, parent_id || null, isApproved]
    );

    // Récupérer le commentaire créé
    const [newComment] = await pool.execute(`
      SELECT 
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: isApproved ? 'Commentaire ajouté avec succès' : 'Commentaire en attente de validation',
      data: newComment[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du commentaire',
      error: error.message
    });
  }
});

// Supprimer un commentaire (propriétaire ou admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [comments] = await pool.execute(
      'SELECT user_id FROM comments WHERE id = ?',
      [id]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    if (comments[0].user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de supprimer ce commentaire'
      });
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
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

module.exports = router;

