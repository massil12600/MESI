# 🚀 Guide étape par étape - Configuration complète

## 📋 Étape 1 : Vérifier les prérequis

### 1.1. Vérifier Node.js

Ouvrez PowerShell ou CMD et tapez :

```powershell
node --version
npm --version
```

**Si Node.js n'est pas installé :**
- Téléchargez depuis : https://nodejs.org/
- Installez la version LTS (Long Term Support)
- Redémarrez votre terminal après l'installation

### 1.2. Vérifier MySQL

Tapez dans votre terminal :

```powershell
mysql --version
```

**Si MySQL n'est pas installé :**

#### Option A : Installer MySQL (recommandé)
1. Téléchargez MySQL Installer : https://dev.mysql.com/downloads/installer/
2. Choisissez "MySQL Installer for Windows"
3. Sélectionnez "Full" ou "Developer Default"
4. **IMPORTANT** : Notez le mot de passe root que vous définissez pendant l'installation
5. Assurez-vous que MySQL est démarré (il devrait démarrer automatiquement)

#### Option B : Utiliser XAMPP (plus simple)
1. Téléchargez XAMPP : https://www.apachefriends.org/
2. Installez XAMPP
3. Lancez le panneau de contrôle XAMPP
4. Cliquez sur "Start" pour MySQL
5. Le mot de passe root est vide par défaut (vous pouvez le changer)

---

## 📋 Étape 2 : Installer les dépendances du projet

### 2.1. Ouvrir le terminal dans le dossier du projet

1. Ouvrez PowerShell ou CMD
2. Naviguez vers votre dossier projet :

```powershell
cd C:\Users\massil\MESI
```

### 2.2. Installer toutes les dépendances

Exécutez cette commande (cela peut prendre quelques minutes) :

```powershell
npm run install-all
```

**Si vous obtenez une erreur**, installez manuellement :

```powershell
# 1. Installer les dépendances racine
npm install

# 2. Installer les dépendances backend
cd BackEnd
npm install
cd ..

# 3. Installer les dépendances frontend
cd FrontEnd\react-app
npm install
cd ..\..
```

---

## 📋 Étape 3 : Créer la base de données MySQL

### 3.1. Se connecter à MySQL

Ouvrez un nouveau terminal et connectez-vous à MySQL :

**Si vous avez installé MySQL directement :**
```powershell
mysql -u root -p
```
Entrez le mot de passe root que vous avez défini lors de l'installation.

**Si vous utilisez XAMPP :**
```powershell
mysql -u root
```
(Pas de mot de passe par défaut)

### 3.2. Créer la base de données

Une fois connecté à MySQL, exécutez le script SQL :

**Méthode 1 : Depuis MySQL (recommandé)**

Dans le terminal MySQL, tapez :

```sql
source C:/Users/massil/MESI/Database/schema.sql
```

**OU** copiez-collez le contenu du fichier `Database/schema.sql` directement dans MySQL.

**Méthode 2 : Depuis PowerShell**

Ouvrez un nouveau terminal PowerShell et exécutez :

```powershell
mysql -u root -p < Database\schema.sql
```

(Remplacez `root` par votre utilisateur MySQL et entrez le mot de passe si nécessaire)

### 3.3. Vérifier que la base de données est créée

Dans MySQL, tapez :

```sql
USE game_universe;
SHOW TABLES;
```

Vous devriez voir les tables suivantes :
- comments
- favorites
- game_images
- games
- genres
- ratings
- users

Tapez `exit;` pour quitter MySQL.

---

## 📋 Étape 4 : Configurer le fichier .env du backend

### 4.1. Créer le fichier .env

1. Allez dans le dossier `BackEnd`
2. Créez un nouveau fichier nommé `.env` (sans extension)
3. Copiez le contenu suivant dans ce fichier :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=game_universe

# Configuration du serveur
PORT=5000
NODE_ENV=development

# JWT Secret (à changer en production)
JWT_SECRET=game_universe_secret_key_2024_change_in_production

# Configuration CORS
CORS_ORIGIN=http://localhost:3000

# Configuration des uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 4.2. Modifier les valeurs selon votre configuration

**IMPORTANT** : Modifiez `DB_PASSWORD` si vous avez un mot de passe MySQL :

```env
DB_PASSWORD=votre_mot_de_passe_mysql
```

Si vous utilisez XAMPP sans mot de passe, laissez `DB_PASSWORD=` vide.

---

## 📋 Étape 5 : Tester la connexion à la base de données

### 5.1. Démarrer le serveur backend

Dans votre terminal, depuis la racine du projet :

```powershell
cd BackEnd
npm run dev
```

Vous devriez voir :
```
✅ Connexion à la base de données MySQL réussie
🚀 Serveur démarré sur le port 5000
📡 API disponible sur http://localhost:5000
```

**Si vous voyez une erreur de connexion :**
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `BackEnd/.env`
- Vérifiez que la base de données `game_universe` existe

### 5.2. Tester l'API

Ouvrez votre navigateur et allez sur :
- http://localhost:5000 → Devrait afficher un message JSON
- http://localhost:5000/api/test-db → Devrait confirmer la connexion à la DB

**Arrêtez le serveur** avec `Ctrl + C` dans le terminal.

---

## 📋 Étape 6 : Démarrer l'application complète

### 6.1. Démarrer frontend + backend ensemble

Depuis la racine du projet :

```powershell
npm run dev
```

Cette commande démarre :
- ✅ Le backend sur http://localhost:5000
- ✅ Le frontend React sur http://localhost:3000

### 6.2. Accéder à l'application

Ouvrez votre navigateur et allez sur :
**http://localhost:3000**

Vous devriez voir la page d'accueil de Game Universe !

---

## 📋 Étape 7 : Créer votre premier compte

### 7.1. S'inscrire

1. Cliquez sur "Inscription" dans le header
2. Remplissez le formulaire :
   - Nom d'utilisateur (min 3 caractères)
   - Email
   - Mot de passe (min 8 caractères)
   - Type de compte : Choisissez "Développeur" si vous voulez publier des jeux
3. Cliquez sur "S'inscrire"

### 7.2. Se connecter

1. Cliquez sur "Connexion"
2. Entrez votre email et mot de passe
3. Vous êtes maintenant connecté !

---

## 📋 Étape 8 : Tester les fonctionnalités

### 8.1. En tant que développeur

1. Connectez-vous avec un compte développeur
2. Cliquez sur "Tableau de bord" dans le header
3. Cliquez sur "+ Ajouter un jeu"
4. Remplissez le formulaire et créez votre premier jeu

### 8.2. En tant que joueur

1. Explorez le catalogue de jeux
2. Utilisez les filtres (genre, recherche, tri)
3. Cliquez sur un jeu pour voir les détails
4. Notez et commentez les jeux

---

## 🐛 Résolution des problèmes courants

### Problème 1 : "mysql: command not found"

**Solution :**
- Ajoutez MySQL au PATH Windows
- Ou utilisez le chemin complet : `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
- Ou utilisez XAMPP qui gère cela automatiquement

### Problème 2 : "Access denied for user 'root'@'localhost'"

**Solution :**
- Vérifiez le mot de passe dans `BackEnd/.env`
- Si vous avez oublié le mot de passe MySQL, réinitialisez-le ou utilisez XAMPP

### Problème 3 : "Port 5000 already in use"

**Solution :**
- Changez le port dans `BackEnd/.env` : `PORT=5001`
- Ou arrêtez le processus utilisant le port :
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <numéro_PID> /F
  ```

### Problème 4 : "Cannot find module"

**Solution :**
- Réinstallez les dépendances :
  ```powershell
  npm run install-all
  ```

### Problème 5 : Erreur lors de l'exécution de schema.sql

**Solution :**
- Vérifiez que vous êtes dans le bon répertoire
- Utilisez des slashes `/` au lieu de backslashes `\` dans le chemin
- Ou copiez-collez le contenu du fichier directement dans MySQL

---

## ✅ Checklist de vérification

Avant de commencer à développer, vérifiez que :

- [ ] Node.js est installé (`node --version`)
- [ ] MySQL est installé et démarré (`mysql --version`)
- [ ] Les dépendances sont installées (`npm run install-all` terminé sans erreur)
- [ ] La base de données `game_universe` existe
- [ ] Le fichier `BackEnd/.env` est créé et configuré
- [ ] Le backend démarre sans erreur (`npm run dev`)
- [ ] L'application s'ouvre sur http://localhost:3000
- [ ] Vous pouvez créer un compte et vous connecter

---

## 🎉 Félicitations !

Votre environnement est maintenant configuré ! Vous pouvez commencer à développer.

**Prochaines étapes suggérées :**
1. Créez quelques jeux de test via le tableau de bord développeur
2. Testez les fonctionnalités de recherche et filtres
3. Ajoutez des commentaires et notes
4. Personnalisez le design selon vos besoins

**Besoin d'aide ?** Consultez les fichiers :
- `README.md` - Documentation générale
- `INSTALLATION.md` - Guide d'installation détaillé
- `Database/schema.sql` - Structure de la base de données

