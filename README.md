# Yoga App

Un projet mono-repo comportant **frontend** et **backend**.

## 📌 Prérequis & Documentation

### 🔹 Backend ([Documentation](./back/README.md))

- **Langage** : Java 11
- **Base de données** : MySQL

### 🔹 Frontend ([Documentation](./front/README.md))

- **Runtime** : Node.js 16
- **Framework** : Angular CLI 14

## ✅ Testing

### Test Frontend : unitaire et d'intégration

Launching test with coverage :

> npm run test 

Check coverage page : 

```bash
front/coverage/jest/lcov-report/index.html
```

### Test Backend : unitaire et d'intégration

Launch & generate the jacoco code coverage:

> mvn clean test

### Test E2E (End-to-End)

Lancement des tests E2E en mode interactif :

```bash
npm run e2e
```

Génération du rapport de couverture E2E (processus en deux étapes) :

```bash
# Étape 1 : Exécution des tests en mode CI et collecte des données brutes de couverture
npm run e2e:ci

# Étape 2 : Génération du rapport HTML à partir des données collectées
npm run e2e:coverage
```

Le rapport de couverture E2E est disponible à l'emplacement suivant :

```bash
front/coverage/lcov-report/index.html
```
