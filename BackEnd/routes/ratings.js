const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');
const { body, validationResult } = require('express-validator');

// Obtenir la note d'un utilisateur pour un jeu
router.get('/game/:gameId/user', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;

    const [ratings] = await pool.execute(
      'SELECT * FROM ratings WHERE game_id = ? AND user_id = ?',
      [gameId, req.user.userId]
    );

    res.json({
      success: true,
      data: ratings.length > 0 ? ratings[0] : null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la note',
      error: error.message
    });
  }
});

// Ajouter ou mettre à jour une note
router.post('/', authenticateToken, [
  body('game_id').isInt().withMessage('ID de jeu invalide'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { game_id, rating } = req.body;

    // Vérifier que le jeu existe
    const [games] = await pool.execute('SELECT id FROM games WHERE id = ?', [game_id]);
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    // Vérifier si une note existe déjà
    const [existing] = await pool.execute(
      'SELECT id FROM ratings WHERE game_id = ? AND user_id = ?',
      [game_id, req.user.userId]
    );

    if (existing.length > 0) {
      // Mettre à jour la note existante
      await pool.execute(
        'UPDATE ratings SET rating = ? WHERE id = ?',
        [rating, existing[0].id]
      );

      res.json({
        success: true,
        message: 'Note mise à jour avec succès'
      });
    } else {
      // Créer une nouvelle note
      await pool.execute(
        'INSERT INTO ratings (game_id, user_id, rating) VALUES (?, ?, ?)',
        [game_id, req.user.userId, rating]
      );

      res.status(201).json({
        success: true,
        message: 'Note ajoutée avec succès'
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la note',
      error: error.message
    });
  }
});

// Supprimer une note
router.delete('/game/:gameId', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;

    await pool.execute(
      'DELETE FROM ratings WHERE game_id = ? AND user_id = ?',
      [gameId, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la note',
      error: error.message
    });
  }
});

module.exports = router;

