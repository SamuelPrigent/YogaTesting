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

Launching test (without coverage) :

> npm run test 

or to watch change :

> npm run test:watch

Launching test with coverage : 

> npx jest --coverage

### Test Backend : unitaire et d'intégration

Launch & generate the jacoco code coverage:

> mvn clean test

### Test E2E

Launching e2e test:

> npm run e2e

Generate coverage report (you should launch e2e test before):

> npm run e2e:coverage

Report is available here:

> front/coverage/lcov-report/index.html

