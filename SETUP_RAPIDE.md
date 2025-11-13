# ⚡ Setup Rapide - Game Universe

## 🎯 Guide ultra-rapide (5 minutes)

### Étape 1 : Installer MySQL (si pas déjà fait)

**Option simple : XAMPP**
1. Téléchargez : https://www.apachefriends.org/
2. Installez et lancez XAMPP
3. Cliquez sur "Start" pour MySQL
4. ✅ MySQL est prêt (pas de mot de passe par défaut)

### Étape 2 : Installer les dépendances

```powershell
cd C:\Users\massil\MESI
npm run install-all
```

### Étape 3 : Créer la base de données

**Option A : Script automatique (recommandé)**
```powershell
.\setup-database.ps1
```

**Option B : Manuellement**
```powershell
# Se connecter à MySQL
mysql -u root

# Dans MySQL, exécuter :
source C:/Users/massil/MESI/Database/schema.sql
exit;
```

### Étape 4 : Configurer .env

1. Créez `BackEnd\.env` avec ce contenu :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=game_universe
PORT=5000
NODE_ENV=development
JWT_SECRET=game_universe_secret_key_2024
CORS_ORIGIN=http://localhost:3000
```

**Si vous avez un mot de passe MySQL**, modifiez `DB_PASSWORD=votre_mot_de_passe`

### Étape 5 : Démarrer !

```powershell
npm run dev
```

Ouvrez http://localhost:3000 🎉

---

## 📝 Commandes utiles

```powershell
# Installer tout
npm run install-all

# Démarrer frontend + backend
npm run dev

# Backend uniquement
cd BackEnd
npm run dev

# Frontend uniquement
cd FrontEnd\react-app
npm start
```

---

## ❓ Problèmes ?

**"mysql: command not found"**
→ Utilisez XAMPP ou ajoutez MySQL au PATH

**"Port 5000 already in use"**
→ Changez `PORT=5001` dans `BackEnd\.env`

**"Access denied"**
→ Vérifiez le mot de passe dans `BackEnd\.env`

---

Pour plus de détails, consultez `GUIDE_ETAPES.md`

