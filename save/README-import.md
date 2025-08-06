# Import de sauvegarde vers Neon.tech

Ce dossier contient des scripts pour importer votre fichier de sauvegarde JSON vers une base de données Neon.tech.

## Fichiers disponibles

- `import-backup.cjs` - Script d'importation utilisant pg (connexion directe PostgreSQL)
- `import-backup-prisma.cjs` - Script d'importation utilisant Prisma ORM
- `install-pg-deps.cjs` - Script pour installer les dépendances pg
- `test-backup-file.cjs` - Script pour tester et analyser le fichier de sauvegarde
- `.env.example` - Exemple de configuration des variables d'environnement

## Configuration

### 1. Variables d'environnement

Copiez le fichier `.env.example` vers `.env` et configurez votre chaîne de connexion Neon.tech :

```bash
cp .env.example .env
```

Puis éditez le fichier `.env` :

```env
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Installation des dépendances

#### Pour utiliser la version avec pg :
```bash
node install-pg-deps.cjs
```

#### Pour utiliser la version avec Prisma :
Les dépendances Prisma sont déjà installées dans votre projet.

## Utilisation

### Option 1 : Avec pg (connexion directe)

Ce script crée automatiquement toutes les tables nécessaires :

```bash
node import-backup.cjs
```

### Option 2 : Avec Prisma

⚠️ **Important** : Cette option nécessite que votre schéma Prisma soit configuré avec les modèles correspondants aux données à importer.

```bash
node import-backup-prisma.cjs
```

### Option 3 : Tester le fichier de sauvegarde

Avant d'importer, vous pouvez tester et analyser votre fichier :

```bash
node test-backup-file.cjs
```

## Structure des données importées

Le script importe les données suivantes :

### Tables principales :
- `users` - Informations utilisateur
- `user_games` - Jeux de l'utilisateur
- `bundles` - Bundles de jeux
- `bundle_games` - Relation entre bundles et jeux

### Tables de référence :
- `roles` - Rôles utilisateur
- `labels` - Labels configurables
- `user_label_visibility` - Visibilité des labels par utilisateur
- `platforms` - Plateformes de jeu
- `tags` - Tags de jeux
- `months` / `years` - Références temporelles
- `states` - États des bundles
- `ratings` - Évaluations
- `base_games` - Jeux de base
- `emplacements` - Emplacements

## Fonctionnalités

- ✅ Création automatique des tables (version pg)
- ✅ Gestion des conflits avec `ON CONFLICT DO NOTHING` / `upsert`
- ✅ Transactions pour assurer la cohérence des données
- ✅ Statistiques d'importation
- ✅ Gestion d'erreurs complète
- ✅ Support des relations entre tables

## Exemple de sortie

```
🚀 Début de l'importation...
📖 Lecture du fichier de sauvegarde...
📊 Données trouvées:
- Export date: 2025-08-05T21:14:45.690Z
- User ID: user-2283
- Nombre de jeux: 796
- Nombre de bundles: 522
- Nombre de tags: 6
- Nombre de plateformes: 5
🏗️  Création des tables...
✅ Tables créées avec succès
💾 Insertion des données...
✅ Toutes les données ont été importées avec succès

📊 Statistiques d'importation:
- Utilisateurs: 1
- Jeux: 796
- Bundles: 522
- Tags: 6
- Plateformes: 5
🎉 Importation terminée avec succès !
```

## Dépannage

### Erreur de connexion
- Vérifiez que votre `DATABASE_URL` est correcte
- Assurez-vous que votre base de données Neon.tech est accessible

### Erreur de schéma (version Prisma)
- Assurez-vous que votre schéma Prisma contient tous les modèles nécessaires
- Exécutez `npx prisma generate` et `npx prisma db push`

### Fichier JSON non trouvé
- Vérifiez le chemin vers votre fichier de sauvegarde dans le script
- Par défaut : `c:\\Users\\Yllan\\Downloads\\backup_2025-08-05 (2).json`

## Personnalisation

Pour modifier le chemin du fichier de sauvegarde, éditez la variable `backupPath` dans la fonction `main()` :

```javascript
const backupPath = 'chemin/vers/votre/fichier.json';
```