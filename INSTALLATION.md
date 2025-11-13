# Guide d'installation - Game Universe

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 16 ou supérieure) : [Télécharger Node.js](https://nodejs.org/)
- **MySQL** (version 8.0 ou supérieure) : [Télécharger MySQL](https://dev.mysql.com/downloads/mysql/)
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** (pour le versioning)

## 🚀 Installation étape par étape

### 1. Cloner le projet (si applicable)

```bash
git clone <url-du-repo>
cd MESI
```

### 2. Installer les dépendances

Installez toutes les dépendances du projet (racine, backend et frontend) :

```bash
npm run install-all
```

Ou manuellement :

```bash
# Dépendances racine
npm install

# Dépendances backend
cd BackEnd
npm install
cd ..

# Dépendances frontend
cd FrontEnd/react-app
npm install
cd ../..
```

### 3. Configuration de la base de données

#### 3.1. Créer la base de données MySQL

Connectez-vous à MySQL :

```bash
mysql -u root -p
```

Puis exécutez le script SQL :

```sql
source Database/schema.sql
```

Ou depuis la ligne de commande :

```bash
mysql -u root -p < Database/schema.sql
```

#### 3.2. Vérifier la création

Vérifiez que la base de données a été créée :

```bash
mysql -u root -p -e "USE game_universe; SHOW TABLES;"
```

### 4. Configuration de l'environnement

#### 4.1. Backend

Créez un fichier `.env` dans le dossier `BackEnd/` :

```bash
cd BackEnd
cp .env.example .env
```

Éditez le fichier `.env` et configurez vos paramètres :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=game_universe
PORT=5000
NODE_ENV=development
JWT_SECRET=votre_secret_jwt_super_securise
CORS_ORIGIN=http://localhost:3000
```

#### 4.2. Frontend (optionnel)

Si vous souhaitez changer l'URL de l'API, créez un fichier `.env` dans `FrontEnd/react-app/` :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Démarrer l'application

#### Option 1 : Démarrer tout en même temps (recommandé pour le développement)

Depuis la racine du projet :

```bash
npm run dev
```

Cela démarre :
- Le serveur backend sur `http://localhost:5000`
- L'application React sur `http://localhost:3000`

#### Option 2 : Démarrer séparément

**Backend uniquement :**

```bash
cd BackEnd
npm run dev
```

**Frontend uniquement :**

```bash
cd FrontEnd/react-app
npm start
```

### 6. Vérifier que tout fonctionne

1. **Backend** : Ouvrez `http://localhost:5000` dans votre navigateur
   - Vous devriez voir : `{"message":"Game Universe API","version":"1.0.0","status":"running"}`

2. **Test de la base de données** : Ouvrez `http://localhost:5000/api/test-db`
   - Vous devriez voir : `{"success":true,"message":"Connexion à la base de données réussie"}`

3. **Frontend** : Ouvrez `http://localhost:3000`
   - L'application React devrait se charger

## 🐛 Résolution des problèmes

### Erreur de connexion à la base de données

- Vérifiez que MySQL est démarré : `mysql -u root -p`
- Vérifiez les identifiants dans `BackEnd/.env`
- Vérifiez que la base de données existe : `SHOW DATABASES;`

### Erreur "Port already in use"

- Changez le port dans `BackEnd/.env` (PORT=5001 par exemple)
- Ou arrêtez le processus utilisant le port :
  - Windows : `netstat -ano | findstr :5000` puis `taskkill /PID <PID> /F`
  - Linux/Mac : `lsof -ti:5000 | xargs kill`

### Erreur lors de l'installation des dépendances

- Supprimez `node_modules` et réinstallez :
  ```bash
  rm -rf node_modules BackEnd/node_modules FrontEnd/react-app/node_modules
  npm run install-all
  ```

### Erreur CORS

- Vérifiez que `CORS_ORIGIN` dans `BackEnd/.env` correspond à l'URL du frontend
- Par défaut : `http://localhost:3000`

## 📝 Prochaines étapes

1. Créez un compte développeur via l'interface d'inscription
2. Connectez-vous et accédez au tableau de bord développeur
3. Ajoutez votre premier jeu
4. Explorez les fonctionnalités de l'API

## 🔧 Commandes utiles

```bash
# Installer toutes les dépendances
npm run install-all

# Démarrer en mode développement (frontend + backend)
npm run dev

# Démarrer uniquement le backend
npm run server

# Démarrer uniquement le frontend
npm run client

# Construire le frontend pour la production
cd FrontEnd/react-app
npm run build
```

## 📚 Documentation API

L'API est disponible sur `http://localhost:5000/api`

### Endpoints principaux :

- `GET /api/games` - Liste des jeux (avec filtres)
- `GET /api/games/:id` - Détails d'un jeu
- `POST /api/games` - Créer un jeu (développeur)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/comments/game/:id` - Commentaires d'un jeu
- `POST /api/comments` - Ajouter un commentaire
- `POST /api/ratings` - Noter un jeu

Pour plus de détails, consultez les fichiers dans `BackEnd/routes/`.

