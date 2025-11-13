# 🎯 COMMENCEZ ICI - Guide de démarrage

Bienvenue ! Ce guide vous accompagne étape par étape pour configurer votre projet Game Universe.

## 📚 Choisissez votre guide

### 🚀 Pour aller vite (5 minutes)
→ Lisez **`SETUP_RAPIDE.md`**

### 📖 Pour un guide détaillé (15 minutes)
→ Lisez **`GUIDE_ETAPES.md`**

---

## ✅ Checklist de démarrage

Suivez ces étapes dans l'ordre :

### 1️⃣ Vérifier les prérequis
- [ ] Node.js installé ? → `node --version` dans PowerShell
- [ ] MySQL installé ? → `mysql --version` dans PowerShell

**Si non installé :**
- Node.js : https://nodejs.org/ (version LTS)
- MySQL : Utilisez XAMPP (plus simple) → https://www.apachefriends.org/

### 2️⃣ Installer les dépendances
```powershell
cd C:\Users\massil\MESI
npm run install-all
```

### 3️⃣ Créer la base de données

**Option A : Script automatique**
```powershell
.\setup-database.ps1
```

**Option B : Manuellement**
1. Ouvrez MySQL : `mysql -u root` (ou `mysql -u root -p` si vous avez un mot de passe)
2. Exécutez : `source C:/Users/massil/MESI/Database/schema.sql`
3. Vérifiez : `USE game_universe; SHOW TABLES;`
4. Quittez : `exit;`

### 4️⃣ Configurer le fichier .env

1. Allez dans le dossier `BackEnd`
2. Créez un fichier nommé `.env` (sans extension)
3. Copiez le contenu de `BackEnd/env.template` dans `.env`
4. Modifiez `DB_PASSWORD` si vous avez un mot de passe MySQL

### 5️⃣ Tester la connexion

```powershell
cd BackEnd
npm run dev
```

Vous devriez voir :
```
✅ Connexion à la base de données MySQL réussie
🚀 Serveur démarré sur le port 5000
```

**Testez dans le navigateur :**
- http://localhost:5000 → Devrait afficher un JSON
- http://localhost:5000/api/test-db → Devrait confirmer la connexion DB

Arrêtez avec `Ctrl + C`

### 6️⃣ Démarrer l'application complète

```powershell
# Depuis la racine du projet
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur 🎉

---

## 🆘 Besoin d'aide ?

### Problèmes courants

**"mysql: command not found"**
→ Installez XAMPP ou ajoutez MySQL au PATH Windows

**"Access denied for user 'root'"**
→ Vérifiez le mot de passe dans `BackEnd/.env`

**"Port 5000 already in use"**
→ Changez `PORT=5001` dans `BackEnd/.env`

**"Cannot find module"**
→ Réinstallez : `npm run install-all`

### Documentation

- **`GUIDE_ETAPES.md`** → Guide complet étape par étape
- **`SETUP_RAPIDE.md`** → Version rapide
- **`INSTALLATION.md`** → Documentation technique
- **`README.md`** → Vue d'ensemble du projet

---

## 🎓 Prochaines étapes

Une fois l'application démarrée :

1. ✅ Créez un compte (cliquez sur "Inscription")
2. ✅ Choisissez "Développeur" si vous voulez publier des jeux
3. ✅ Connectez-vous
4. ✅ Accédez au "Tableau de bord" pour créer votre premier jeu
5. ✅ Explorez le catalogue et testez les fonctionnalités

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez `GUIDE_ETAPES.md` section "Résolution des problèmes"
2. Vérifiez que tous les prérequis sont installés
3. Vérifiez les fichiers de configuration (.env)

**Bon développement ! 🚀**

