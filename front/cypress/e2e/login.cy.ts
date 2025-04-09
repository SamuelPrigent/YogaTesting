/// <reference types="cypress" />
import { admin, sessions } from '../fixtures/data.json';

describe('Login & Account information', () => {
  // Définir les données statiques pour les tests
  const adminData = admin;
  const sessionsData = sessions;

  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login');
  });

  it('Login successfull', () => {
    // Intercepter la requête de login avec une réponse de succès
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: adminData,
    }).as('loginSuccess');

    // Intercepter la redirection vers les sessions
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: sessionsData,
    }).as('getSessions');

    // Saisir les informations de connexion
    cy.get('input[formControlName=email]').type(adminData.email);
    cy.get('input[formControlName=password]').type(
      `${adminData.password}{enter}{enter}`
    );

    // Attendre que la requête interceptée soit terminée
    cy.wait('@loginSuccess');

    // Vérifier qu'on est redirigé vers la page des sessions
    cy.url().should('include', '/sessions');
  });

  it('Échec de connexion - Mauvais identifiants', () => {
    // Intercepter la requête de connexion avec une réponse d'erreur 401
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Bad credentials' },
    }).as('loginFailed');

    // Remplir le formulaire avec un mot de passe incorrect
    cy.get('input[formControlName=email]').type(adminData.email);
    cy.get('input[formControlName=password]')
      .should('not.be.disabled')
      .type('mauvais_mot_de_passe');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre que la requête interceptée soit terminée
    cy.wait('@loginFailed');

    // Vérifier qu'un message d'erreur est affiché
    cy.get('p.error').should('be.visible');
    cy.get('p.error').should('contain', 'An error occurred');

    // Vérifier qu'on reste sur la page de connexion
    cy.url().should('include', '/login');
  });

  it('Échec de connexion - Erreur serveur 500', () => {
    // Intercepter la requête de login et simuler une erreur 500
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('loginServerError');

    // Remplir le formulaire avec des identifiants valides
    cy.get('input[formControlName=email]').type(adminData.email);
    cy.get('input[formControlName=password]').type(adminData.password);

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre que la requête interceptée soit terminée
    cy.wait('@loginServerError');

    // Vérifier qu'un message d'erreur est affiché
    cy.get('p.error').should('be.visible');
    cy.get('p.error').should('contain', 'An error occurred');

    // Vérifier qu'on reste sur la page de connexion
    cy.url().should('include', '/login');
  });

  it('Validation des champs obligatoires', () => {
    // Vérifier que le bouton est désactivé initialement (formulaire vide)
    cy.get('button[type="submit"]').should('be.disabled');

    // Tester avec email mais sans mot de passe
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type="submit"]').should('be.disabled');

    // Effacer l'email et tester avec mot de passe seulement
    cy.get('input[formControlName=email]').clear();
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type="submit"]').should('be.disabled');

    // Remplir les deux champs
    cy.get('input[formControlName=email]').type('yoga@studio.com');

    // Le bouton devrait maintenant être activé
    cy.get('button[type="submit"]').should('be.enabled');
  });

  it('Déconnexion réussie', () => {
    // Intercepter les requêtes importantes
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: adminData,
    }).as('loginRequest');

    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: sessionsData,
    }).as('sessionsRequest');

    // Se connecter d'abord
    cy.get('input[formControlName=email]').type(adminData.email);
    cy.get('input[formControlName=password]').type(adminData.password);
    cy.get('button[type="submit"]').click();

    // Attendre la connexion et la redirection
    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsRequest');

    // Vérifier qu'on est bien sur la page des sessions avant de se déconnecter
    cy.contains('Rentals available').should('be.visible');

    // Cliquer sur le bouton de déconnexion dans la barre d'outils
    cy.get('.mat-toolbar > .ng-star-inserted > :nth-child(3)').click();

    // Vérifier qu'on est redirigé vers la page d'accueil après déconnexion
    cy.url().should('eq', 'http://localhost:4200/');

    // Intercepter la tentative d'accès aux sessions pour simuler la redirection de sécurité
    cy.intercept('GET', '/api/session', (req) => {
      req.reply({
        statusCode: 401,
        body: { message: 'Unauthorized' },
      });
    }).as('unauthorizedRequest');

    // Vérifier qu'on n'est plus authentifié en essayant d'accéder à la page protégée des sessions
    cy.visit('/sessions');
    cy.url().should('include', '/login'); // On est redirigé vers login
  });

  it('Affichage des informations utilisateur dans la page Account', () => {
    // Intercepter les requêtes importantes
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: adminData,
    }).as('loginRequest');

    // Intercepter les sessions
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: sessionsData,
    }).as('sessionsApiCall');

    // Intercepter les détails utilisateur
    cy.intercept('GET', '/api/user/*', {
      statusCode: 200,
      body: adminData,
    }).as('getUserDetails');

    // Se connecter avec un compte admin
    cy.get('input[formControlName=email]').type(adminData.email);
    cy.get('input[formControlName=password]').type(adminData.password);
    cy.get('button[type="submit"]').click();

    // Attendre la connexion et la redirection
    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');

    // Cliquer sur le lien "Account" dans le header
    cy.get('.mat-toolbar > .ng-star-inserted > :nth-child(2)').click();

    // Vérifier qu'on est redirigé vers la page du compte utilisateur
    cy.url().should('include', '/me');

    // Attendre que les détails de l'utilisateur soient chargés
    cy.wait('@getUserDetails');

    // Vérifier que le titre de la page est affiché
    cy.get('h1').should('contain', 'User information');

    // Vérifier que les informations de l'utilisateur sont affichées
    // Vérifier le nom et prénom dans le premier élément
    cy.get('.mat-card-content > div.ng-star-inserted > :nth-child(1)').should(
      'contain',
      'Admin'
    );

    // Vérifier l'email dans le deuxième élément
    cy.get('.mat-card-content > div.ng-star-inserted > :nth-child(2)').should(
      'contain',
      adminData.email
    );

    // Vérifier le statut d'admin
    cy.get('.my2').should('contain', 'You are admin');
  });
});
