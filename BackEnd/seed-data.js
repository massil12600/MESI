const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const pool = require('./db');

const DEFAULT_PASSWORD = 'Password123!';

const users = [
  { username: 'player01', email: 'player01@example.com', role: 'player' },
  { username: 'player02', email: 'player02@example.com', role: 'player' },
  { username: 'devstudio', email: 'devstudio@example.com', role: 'developer' },
  { username: 'pixelcraft', email: 'pixelcraft@example.com', role: 'developer' }
];

const games = [
  {
    title: 'Neon Sky Racer',
    developerEmail: 'devstudio@example.com',
    genre: 'Course',
    price: 9.99,
    release_date: '2024-06-21',
    short_description: 'Courses futuristes à travers une mégapole néon.',
    description: 'Prenez le contrôle d\'un hovercar et filez à toute vitesse dans une ville néon. Débloquez des pièces, affrontez des rivaux et améliorez votre machine pour atteindre les sommets du classement.',
    cover_image_url: 'https://images.unsplash.com/photo-1518112166137-85f9979a43a0',
    trailer_url: 'https://www.youtube.com/watch?v=2g811Eo7K8U',
    game_url: 'https://itch.io'
  },
  {
    title: 'Dungeon Loop',
    developerEmail: 'devstudio@example.com',
    genre: 'RPG',
    price: 14.99,
    release_date: '2023-11-10',
    short_description: 'Un rogue-lite tactique avec des boucles temporelles.',
    description: 'Chaque run révèle un nouvel angle du mystère du donjon infini. Collectez des artefacts, adaptez votre build et survivez assez longtemps pour déclencher la boucle suivante.',
    cover_image_url: 'https://images.unsplash.com/photo-1508921971720-8f23fd4943c7',
    trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    game_url: 'https://itch.io'
  },
  {
    title: "Pixel Defense Squad",
    developerEmail: 'pixelcraft@example.com',
    genre: 'Stratégie',
    price: 4.99,
    release_date: '2022-09-05',
    short_description: 'Tower defense rétro avec coop en ligne.',
    description: "Déployez votre escouade de défenseurs pixelisés et repoussez des vagues successives d'envahisseurs. Combinez les capacités spéciales de chaque unité pour survivre.",
    cover_image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    trailer_url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    game_url: 'https://itch.io'
  }
];

async function ensureUser({ username, email, role }) {
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, role]
  );

  return result.insertId;
}

async function ensureGame(game, developersMap) {
  const [existing] = await pool.execute('SELECT id FROM games WHERE title = ?', [game.title]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const developerId = developersMap.get(game.developerEmail);
  if (!developerId) {
    throw new Error(`Aucun développeur trouvé pour l\'email ${game.developerEmail}`);
  }

  const [result] = await pool.execute(
    `INSERT INTO games 
      (title, description, short_description, developer_id, genre, release_date, price, cover_image_url, trailer_url, game_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
    [
      game.title,
      game.description,
      game.short_description,
      developerId,
      game.genre,
      game.release_date,
      game.price,
      game.cover_image_url,
      game.trailer_url,
      game.game_url
    ]
  );

  return result.insertId;
}

async function seed() {
  console.log('🧪 Insertion de données de démonstration...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const developersMap = new Map();

    for (const user of users) {
      const userId = await ensureUser(user);
      console.log(`✔️ Utilisateur prêt: ${user.username} (${user.email})`);
      if (user.role === 'developer') {
        developersMap.set(user.email, userId);
      }
    }

    for (const game of games) {
      const gameId = await ensureGame(game, developersMap);
      console.log(`🎮 Jeu prêt: ${game.title} (ID ${gameId})`);
    }

    await connection.commit();
    console.log('\n✅ Données de démonstration insérées.');
    console.log(`Mot de passe par défaut pour les comptes créés: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    await connection.rollback();
    console.error('❌ Échec de la création des données:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('❌ Erreur inattendue:', error);
  process.exit(1);
});
