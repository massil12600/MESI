const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');

// Obtenir le profil d'un utilisateur
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      'SELECT id, username, email, role, avatar_url, bio, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Si c'est un développeur, récupérer ses jeux
    if (users[0].role === 'developer') {
      const [games] = await pool.execute(
        'SELECT id, title, cover_image_url, status, views_count, created_at FROM games WHERE developer_id = ? ORDER BY created_at DESC',
        [id]
      );
      users[0].games = games;
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
});

// Mettre à jour le profil (utilisateur connecté uniquement)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur modifie son propre profil ou est admin
    if (parseInt(id) !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier ce profil'
      });
    }

    const { username, bio, avatar_url } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (username) {
      // Vérifier que le nom d'utilisateur n'est pas déjà pris
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà pris'
        });
      }
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }

    if (avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatar_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
});

module.exports = router;

