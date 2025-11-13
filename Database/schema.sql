-- ============================================
-- Game Universe - Schéma de base de données
-- Projet MESI
-- ============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS game_universe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_universe;

-- ============================================
-- Table: users (Utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('player', 'developer', 'admin') DEFAULT 'player',
    avatar_url VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: games (Jeux)
-- ============================================
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500) DEFAULT NULL,
    developer_id INT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    release_date DATE DEFAULT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    cover_image_url VARCHAR(255) DEFAULT NULL,
    trailer_url VARCHAR(255) DEFAULT NULL,
    game_url VARCHAR(255) DEFAULT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_developer (developer_id),
    INDEX idx_genre (genre),
    INDEX idx_status (status),
    INDEX idx_release_date (release_date),
    FULLTEXT idx_search (title, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: game_images (Images des jeux)
-- ============================================
CREATE TABLE IF NOT EXISTS game_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: ratings (Notes/Évaluations)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game_rating (user_id, game_id),
    INDEX idx_game (game_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: comments (Commentaires)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_game (game_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: favorites (Favoris)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game_favorite (user_id, game_id),
    INDEX idx_user (user_id),
    INDEX idx_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: genres (Genres de jeux)
-- ============================================
CREATE TABLE IF NOT EXISTS genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des genres de base
INSERT INTO genres (name, description) VALUES
('Action', 'Jeux d''action avec combats et mouvements rapides'),
('Aventure', 'Jeux d''aventure avec exploration et quêtes'),
('RPG', 'Jeux de rôle avec progression de personnage'),
('Stratégie', 'Jeux de stratégie et de tactique'),
('Puzzle', 'Jeux de réflexion et de casse-tête'),
('Sport', 'Jeux sportifs et de simulation sportive'),
('Course', 'Jeux de course et de conduite'),
('Arcade', 'Jeux d''arcade classiques'),
('Simulation', 'Jeux de simulation'),
('Plateforme', 'Jeux de plateforme et saut'),
('Survie', 'Jeux de survie'),
('Horreur', 'Jeux d''horreur et de suspense')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- Vue: game_stats (Statistiques des jeux)
-- ============================================
CREATE OR REPLACE VIEW game_stats AS
SELECT 
    g.id,
    g.title,
    g.developer_id,
    COUNT(DISTINCT r.id) as ratings_count,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT f.id) as favorites_count,
    g.views_count,
    g.downloads_count
FROM games g
LEFT JOIN ratings r ON g.id = r.game_id
LEFT JOIN comments c ON g.id = c.game_id AND c.is_approved = TRUE
LEFT JOIN favorites f ON g.id = f.game_id
WHERE g.status = 'published'
GROUP BY g.id, g.title, g.developer_id, g.views_count, g.downloads_count;

