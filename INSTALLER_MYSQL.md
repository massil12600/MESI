# 📦 Installation de MySQL - Étape 1

## ✅ État actuel
- ✅ Node.js installé (v22.14.0)
- ✅ npm installé (v11.2.0)
- ❌ MySQL non installé

## 🎯 Option recommandée : XAMPP (le plus simple)

### Pourquoi XAMPP ?
- ✅ Installation simple en quelques clics
- ✅ Gère automatiquement le PATH
- ✅ Interface graphique pour démarrer/arrêter MySQL
- ✅ Pas de configuration complexe

### Étapes d'installation :

1. **Télécharger XAMPP**
   - Allez sur : https://www.apachefriends.org/
   - Cliquez sur "Download" pour Windows
   - Téléchargez la version avec PHP 8.x (environ 150 MB)

2. **Installer XAMPP**
   - Exécutez le fichier téléchargé
   - Choisissez les composants (MySQL est sélectionné par défaut)
   - Choisissez un dossier d'installation (par défaut : `C:\xampp`)
   - Cliquez sur "Next" jusqu'à la fin

3. **Démarrer MySQL**
   - Ouvrez le "XAMPP Control Panel"
   - Cliquez sur "Start" à côté de MySQL
   - Le bouton devrait devenir vert ✅

4. **Vérifier l'installation**
   - Ouvrez PowerShell
   - Tapez : `C:\xampp\mysql\bin\mysql.exe --version`
   - Vous devriez voir la version de MySQL

### Configuration du PATH (optionnel mais recommandé)

Pour pouvoir utiliser `mysql` directement dans PowerShell :

1. Ouvrez "Variables d'environnement" :
   - Appuyez sur `Windows + R`
   - Tapez : `sysdm.cpl`
   - Onglet "Avancé" → "Variables d'environnement"

2. Dans "Variables système", trouvez "Path" et cliquez "Modifier"

3. Cliquez "Nouveau" et ajoutez :
   ```
   C:\xampp\mysql\bin
   ```

4. Cliquez "OK" partout

5. **Redémarrez PowerShell** et testez :
   ```powershell
   mysql --version
   ```

---

## 🔄 Alternative : MySQL Server (installation complète)

Si vous préférez installer MySQL directement :

1. **Télécharger MySQL**
   - Allez sur : https://dev.mysql.com/downloads/installer/
   - Téléchargez "MySQL Installer for Windows"

2. **Installer**
   - Choisissez "Developer Default" ou "Server only"
   - Suivez l'assistant d'installation
   - **IMPORTANT** : Notez le mot de passe root que vous définissez !

3. **Vérifier**
   ```powershell
   mysql --version
   ```

---

## ✅ Après l'installation

Une fois MySQL installé, revenez ici et nous passerons à l'**Étape 2** !

Pour vérifier que MySQL fonctionne :
```powershell
mysql --version
```

Si vous voyez une version (ex: `mysql  Ver 8.0.xx`), c'est bon ! ✅

