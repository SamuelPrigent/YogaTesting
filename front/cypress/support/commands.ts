// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Déclarer les types pour TypeScript
declare global {
    namespace Cypress {
      interface Chainable {
        loginAsAdmin(): Chainable<void>
        loginAsUser(): Chainable<void>
      }
    }
  }
  
  // Données mockées pour les sessions
  const mockSessions = [
    { 
      id: 413, 
      name: 'Yoga du matin', 
      description: 'Réveillez-vous en douceur', 
      date: '2025-06-10T00:00:00.000+00:00', 
      teacher_id: 1,
      users: [],
      createdAt: '2025-04-05T00:48:12',
      updatedAt: '2025-04-05T00:48:12'
    },
    { 
      id: 414, 
      name: 'Pilates intermédiaire', 
      description: 'Renforcement musculaire', 
      date: '2025-06-20T00:00:00.000+00:00', 
      teacher_id: 1,
      users: [], 
      createdAt: '2025-04-05T00:48:50',
      updatedAt: '2025-04-05T00:48:50'
    }
  ];
  
  const teachers = [
    { id: 1, firstName: 'Margot', lastName: 'DELAHAYE', createdAt: '2023-01-01', updatedAt: '2023-01-01' }
  ];
  
  // Commande pour se connecter en tant qu'administrateur
  Cypress.Commands.add('loginAsAdmin', () => {
    // Intercepter le login admin avec une réponse simulée
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'faketoken',
        type: 'Bearer',
        id: 898,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true
      }
    }).as('loginRequest')
    
    // Intercepter la liste des sessions
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: mockSessions
    }).as('sessionsRequest')
    
    // Intercepter la liste des enseignants
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: teachers
    }).as('getTeachers')
    
    // Intercepter les requêtes pour les détails d'un enseignant spécifique
    cy.intercept('GET', '/api/teacher/*', {
      statusCode: 200,
      body: teachers[0]
    }).as('getTeacherDetails')
    
    // Visiter la page de login
    cy.visit('/login')
  
    // Se connecter avec les identifiants admin
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre que le login soit terminé
    cy.wait('@loginRequest')
    
    // Attendre la redirection
    cy.url().should('include', '/sessions')
    
    // Attendre le chargement des sessions
    cy.wait('@sessionsRequest')
    
    // Vérifier que la page est chargée
    cy.contains('Rentals available').should('be.visible')
  })
  
  // Commande pour se connecter en tant qu'utilisateur standard
  Cypress.Commands.add('loginAsUser', () => {
    // Simuler l'enregistrement réussi
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        id: 899,
        email: 'user@studio.com',
        firstName: 'User',
        lastName: 'Test',
        admin: false
      }
    }).as('registerNonAdmin')
    
    // Simuler le login non-admin
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fakeusertoken',
        type: 'Bearer',
        id: 899,
        username: 'user@studio.com',
        firstName: 'User',
        lastName: 'Test',
        admin: false
      }
    }).as('loginNonAdminRequest')
    
    // Simuler la liste des sessions
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: mockSessions
    }).as('sessionsNonAdmin')
    
    // Intercepter les requêtes pour les informations utilisateur
    cy.intercept('GET', '/api/user/*', {
      statusCode: 200,
      body: {
        id: 899,
        email: 'user@studio.com',
        firstName: 'User',
        lastName: 'Test',
        admin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getUserDetails')
    
    // Au lieu de créer réellement l'utilisateur, on simule directement le login
    cy.visit('/login')
    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre que les requêtes soient terminées
    cy.wait('@loginNonAdminRequest')
    cy.wait('@sessionsNonAdmin')
    
    // Vérifier que la page des sessions est chargée
    cy.contains('Rentals available').should('be.visible')
  })
  
  export {}