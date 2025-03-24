/// <reference types="cypress" />

describe('Register spec', () => {
  it('Inscription réussie', () => {
    cy.visit('/register')

    // Intercepter la requête d'inscription
    cy.intercept('POST', '/api/auth/register', {
      body: {
        message: "User registered successfully!"
      }
    }).as('registerRequest')

    // Intercepter la requête de sessions
    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session')

    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Jean")
    cy.get('input[formControlName=lastName]').type("Dupont")
    cy.get('input[formControlName=email]').type("jean.dupont@example.com")
    cy.get('input[formControlName=password]').type("password123")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'inscription a été envoyée
    cy.wait('@registerRequest')

    // Vérifier la redirection vers la page de connexion
    cy.url().should('include', '/login')
  })

  it('Échec d\'inscription - Email déjà utilisé', () => {
    cy.visit('/register')

    // Intercepter la requête d'inscription - simulation d'un email déjà utilisé
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: "Error: Email is already taken!"
      }
    }).as('registerFailRequest')

    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Pierre")
    cy.get('input[formControlName=lastName]').type("Martin")
    cy.get('input[formControlName=email]').type("pierre.martin@example.com")
    cy.get('input[formControlName=password]').type("password123")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'inscription a été envoyée
    cy.wait('@registerFailRequest')

    // Vérifier qu'un message d'erreur est affiché
    cy.get('.error').should('be.visible')
    cy.get('.error').should('contain', 'An error occurred')

    // Vérifier qu'on reste sur la page d'inscription
    cy.url().should('include', '/register')
  })

  it('Formulaire invalide - Validation des champs', () => {
    cy.visit('/register')

    // Vérifier que le bouton est désactivé initialement (formulaire vide)
    cy.get('button[type="submit"]').should('be.disabled')

    // Tester uniquement avec email invalide
    cy.get('input[formControlName=firstName]').type("Paul")
    cy.get('input[formControlName=lastName]').type("Dubois")
    cy.get('input[formControlName=email]').type("email-invalide")
    cy.get('input[formControlName=password]').type("pass123")

    // Le bouton devrait toujours être désactivé
    cy.get('button[type="submit"]').should('be.disabled')

    // Corriger l'email
    cy.get('input[formControlName=email]').clear().type("paul.dubois@example.com")
    
    // Le bouton devrait maintenant être activé
    cy.get('button[type="submit"]').should('be.enabled')
  })
});
