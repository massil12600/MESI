const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');
const { body, validationResult, query } = require('express-validator');

// Obtenir tous les jeux (avec filtres et pagination)
router.get('/', [
  query('genre').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['popularity', 'rating', 'date', 'name']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { genre, search, sort = 'popularity', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        g.*,
        u.username as developer_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as ratings_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count
      FROM games g
      LEFT JOIN users u ON g.developer_id = u.id
      LEFT JOIN ratings r ON g.id = r.game_id
      LEFT JOIN comments c ON g.id = c.game_id AND c.is_approved = TRUE
      LEFT JOIN favorites f ON g.id = f.game_id
      WHERE g.status = 'published'
    `;

    const params = [];

    // Filtre par genre
    if (genre) {
      query += ' AND g.genre = ?';
      params.push(genre);
    }

    // Recherche textuelle
    if (search) {
      query += ' AND (g.title LIKE ? OR g.description LIKE ? OR g.short_description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY g.id, u.username';

    // Tri
    switch (sort) {
      case 'rating':
        query += ' ORDER BY average_rating DESC, g.created_at DESC';
        break;
      case 'date':
        query += ' ORDER BY g.release_date DESC, g.created_at DESC';
        break;
      case 'name':
        query += ' ORDER BY g.title ASC';
        break;
      case 'popularity':
      default:
        query += ' ORDER BY g.views_count DESC, average_rating DESC';
        break;
    }

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [games] = await pool.execute(query, params);

    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(DISTINCT g.id) as total FROM games g WHERE g.status = \'published\'';
    const countParams = [];

    if (genre) {
      countQuery += ' AND g.genre = ?';
      countParams.push(genre);
    }

    if (search) {
      countQuery += ' AND (g.title LIKE ? OR g.description LIKE ? OR g.short_description LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
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

// Obtenir un jeu par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le jeu avec ses statistiques
    const [games] = await pool.execute(`
      SELECT 
        g.*,
        u.username as developer_name,
        u.id as developer_id,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as ratings_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT f.id) as favorites_count
      FROM games g
      LEFT JOIN users u ON g.developer_id = u.id
      LEFT JOIN ratings r ON g.id = r.game_id
      LEFT JOIN comments c ON g.id = c.game_id AND c.is_approved = TRUE
      LEFT JOIN favorites f ON g.id = f.game_id
      WHERE g.id = ?
      GROUP BY g.id, u.username, u.id
    `, [id]);

    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    // Récupérer les images du jeu
    const [images] = await pool.execute(
      'SELECT * FROM game_images WHERE game_id = ? ORDER BY display_order, id',
      [id]
    );

    // Incrémenter le compteur de vues
    await pool.execute(
      'UPDATE games SET views_count = views_count + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...games[0],
        images
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du jeu',
      error: error.message
    });
  }
});

// Créer un nouveau jeu (développeur uniquement)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Le titre est requis (max 200 caractères)'),
  body('description').trim().isLength({ min: 1 }).withMessage('La description est requise'),
  body('genre').notEmpty().withMessage('Le genre est requis'),
  body('short_description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un développeur
    if (req.user.role !== 'developer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les développeurs peuvent publier des jeux'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      short_description,
      genre,
      release_date,
      price = 0,
      cover_image_url,
      trailer_url,
      game_url
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO games 
       (title, description, short_description, developer_id, genre, release_date, price, cover_image_url, trailer_url, game_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [title, description, short_description, req.user.userId, genre, release_date || null, price, cover_image_url, trailer_url, game_url]
    );

    res.status(201).json({
      success: true,
      message: 'Jeu créé avec succès',
      data: {
        id: result.insertId,
        title,
        status: 'draft'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du jeu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du jeu',
      error: error.message
    });
  }
});

// Mettre à jour un jeu (développeur propriétaire uniquement)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le jeu existe et appartient au développeur
    const [games] = await pool.execute(
      'SELECT developer_id FROM games WHERE id = ?',
      [id]
    );

    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    if (games[0].developer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier ce jeu'
      });
    }

    const {
      title,
      description,
      short_description,
      genre,
      release_date,
      price,
      cover_image_url,
      trailer_url,
      game_url,
      status
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (title) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (short_description !== undefined) { updateFields.push('short_description = ?'); updateValues.push(short_description); }
    if (genre) { updateFields.push('genre = ?'); updateValues.push(genre); }
    if (release_date !== undefined) { updateFields.push('release_date = ?'); updateValues.push(release_date || null); }
    if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
    if (cover_image_url !== undefined) { updateFields.push('cover_image_url = ?'); updateValues.push(cover_image_url); }
    if (trailer_url !== undefined) { updateFields.push('trailer_url = ?'); updateValues.push(trailer_url); }
    if (game_url !== undefined) { updateFields.push('game_url = ?'); updateValues.push(game_url); }
    if (status && (req.user.role === 'admin' || status === 'published')) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour'
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE games SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Jeu mis à jour avec succès'
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

// Supprimer un jeu (développeur propriétaire ou admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que le jeu existe et appartient au développeur
    const [games] = await pool.execute(
      'SELECT developer_id FROM games WHERE id = ?',
      [id]
    );

    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }

    if (games[0].developer_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de supprimer ce jeu'
      });
    }

    await pool.execute('DELETE FROM games WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Jeu supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du jeu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du jeu',
      error: error.message
    });
  }
});

// Obtenir les genres disponibles
router.get('/genres/list', async (req, res) => {
  try {
    const [genres] = await pool.execute('SELECT * FROM genres ORDER BY name');
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des genres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des genres',
      error: error.message
    });
  }
});

module.exports = router;

