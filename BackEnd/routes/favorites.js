const express = require('express');
const { body, validationResult, param } = require('express-validator');
const pool = require('../db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer les favoris de l'utilisateur connecté
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [favorites] = await pool.execute(
      `SELECT f.game_id, g.title, g.cover_image_url, g.status, g.genre, g.views_count
       FROM favorites f
       JOIN games g ON f.game_id = g.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris',
      error: error.message
    });
  }
});

// Vérifier si l'utilisateur a ajouté le jeu en favori
router.get('/game/:gameId/user', authenticateToken, [
  param('gameId').isInt().withMessage('ID de jeu invalide').toInt()
], async (req, res) => {
  try {
    const { gameId } = req.params;
    const [rows] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND game_id = ?',
      [req.user.userId, gameId]
    );

    res.json({
      success: true,
      data: rows.length > 0
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du favori',
      error: error.message
    });
  }
});

// Ajouter un favori
router.post('/', authenticateToken, [
  body('game_id').isInt().withMessage('ID de jeu invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { game_id } = req.body;

    // Vérifier que le jeu existe
    const [games] = await pool.execute('SELECT id FROM games WHERE id = ? AND status = "published"', [game_id]);
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    try {
      await pool.execute(
        'INSERT INTO favorites (user_id, game_id) VALUES (?, ?)',
        [req.user.userId, game_id]
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Ce jeu est déjà dans vos favoris'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Jeu ajouté aux favoris'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du favori:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du favori',
      error: error.message
    });
  }
});

// Supprimer un favori
router.delete('/game/:gameId', authenticateToken, [
  param('gameId').isInt().withMessage('ID de jeu invalide').toInt()
], async (req, res) => {
  try {
    const { gameId } = req.params;

    await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND game_id = ?',
      [req.user.userId, gameId]
    );

    res.json({
      success: true,
      message: 'Jeu retiré des favoris'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du favori',
      error: error.message
    });
  }
});

module.exports = router;
