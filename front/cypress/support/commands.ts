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
  
  // Commande pour se connecter en tant qu'administrateur
  Cypress.Commands.add('loginAsAdmin', () => {
    // Intercepter les requêtes pour pouvoir vérifier qu'elles sont bien terminées
    cy.intercept('POST', '/api/auth/login').as('loginRequest')
    cy.intercept('GET', '/api/session').as('sessionsRequest')
    
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
    // S'assurer que l'utilisateur non-admin existe
    cy.intercept('POST', '/api/auth/register').as('registerNonAdmin')
    cy.visit('/register')
    cy.get('input[formControlName=firstName]').type("User")
    cy.get('input[formControlName=lastName]').type("Test")
    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Intercepter les requêtes pour le login et les sessions
    cy.intercept('POST', '/api/auth/login').as('loginNonAdminRequest')
    cy.intercept('GET', '/api/session').as('sessionsNonAdmin')
    
    // Se connecter avec l'utilisateur standard
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