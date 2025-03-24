/// <reference types="cypress" />

describe('Login spec', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login')
  })
  
  it('Login successfull', () => {
    // La visite de la page est déjà gérée dans beforeEach

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session')

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')
  })

  it('Échec de connexion - Mauvais identifiants', () => {
    // Intercepter la requête de connexion avec une réponse d'erreur
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: "Bad credentials"
      }
    }).as('loginFailRequest')

    // Remplir le formulaire avec un mot de passe incorrect
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("mauvais_mot_de_passe")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'authentification a été envoyée
    cy.wait('@loginFailRequest')

    // Attendre que l'application ait le temps de traiter la réponse
    cy.wait(500)
    
    // Vérifier qu'un message d'erreur est affiché
    cy.get('p.error').should('be.visible')
    cy.get('p.error').should('contain', 'An error occurred')

    // Vérifier qu'on reste sur la page de connexion
    cy.url().should('include', '/login')
  })

  it('Validation des champs obligatoires', () => {
    // Vérifier que le bouton est désactivé initialement (formulaire vide)
    cy.get('button[type="submit"]').should('be.disabled')

    // Tester avec email mais sans mot de passe
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('button[type="submit"]').should('be.disabled')

    // Effacer l'email et tester avec mot de passe seulement
    cy.get('input[formControlName=email]').clear()
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').should('be.disabled')

    // Remplir les deux champs
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    
    // Le bouton devrait maintenant être activé
    cy.get('button[type="submit"]').should('be.enabled')
  })
});