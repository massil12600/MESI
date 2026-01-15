# Game Universe - Plateforme de Jeux Indépendants

## 📋 Présentation du projet

Game Universe est une plateforme en ligne dédiée à la publication, la découverte et la mise en valeur de jeux indépendants. Elle permet aux développeurs de présenter leurs créations et aux joueurs de découvrir un catalogue riche et personnalisé.

## 🛠️ Technologies utilisées

- **Front-end** : React.js
- **Back-end** : Node.js avec Express
- **Base de données** : MySQL
- **Versioning** : GitHub

## 📁 Structure du projet

```
MESI/
├── FrontEnd/
│   ├── react-app/          # Application React
│   └── [fichiers HTML statiques existants]
├── BackEnd/                # API RESTful Node.js/Express
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
├── Database/               # Schémas et scripts SQL
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

### Installation des dépendances

```bash
npm run install-all
```

### Configuration

1. Créer un fichier `.env` dans le dossier `BackEnd/` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=game_universe
PORT=5000
JWT_SECRET=votre_secret_jwt
```


### Lancement

**Développement (frontend + backend) :**
```bash
npm run dev
```

**Backend uniquement :**
```bash
npm run server
```

**Frontend uniquement :**
```bash
npm run client
```

## 📝 Fonctionnalités

- ✅ Gestion des comptes utilisateurs (inscription, connexion, profil)
- ✅ Publication de jeux (ajout, modification, suppression)
- ✅ Catalogue et recherche avancée (filtres par genre, popularité, date, studio)
- ✅ Interactions communautaires (commentaires, notations, partages)
- ✅ Espace développeur (tableau de bord)
- ✅ Interface d'administration (gestion utilisateurs, modération)

## 👥 Équipe

- **Rezkhalla Massil** : Formulaire développeurs + Base de données
- **Galmiche Joachim** : Système de recherche + Filtres
- **De Lima Valente José** : Page d'accueil + Page jeu

## 📅 Planning

Voir le cahier des charges pour le planning détaillé.

