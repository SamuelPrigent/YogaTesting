/// <reference types="cypress" />

describe('Auth spec', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login')
  })
  
  it('Login successfull', () => {

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type(`${"test!1234"}{enter}{enter}`)

    cy.url().should('include', '/sessions')
  })

  it('Échec de connexion - Mauvais identifiants', () => {
    // Intercepter la requête de connexion avec une réponse d'erreur
    // cy.intercept('POST', '/api/auth/login', {
    //   statusCode: 401,
    //   body: {
    //     message: "Bad credentials"
    //   }
    // }).as('loginFailRequest')

    // Remplir le formulaire avec un mot de passe incorrect
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("mauvais_mot_de_passe")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'authentification a été envoyée
    // cy.wait('@loginFailRequest')

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

  it('Déconnexion réussie', () => {
    // Intercepter les requêtes importantes
    cy.intercept('POST', '/api/auth/login').as('loginRequest')
    cy.intercept('GET', '/api/session').as('sessionsRequest')
    
    // Se connecter d'abord
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre la connexion et la redirection
    cy.wait('@loginRequest')
    cy.url().should('include', '/sessions')
    cy.wait('@sessionsRequest')
    
    // Vérifier qu'on est bien sur la page des sessions avant de se déconnecter
    cy.contains('Rentals available').should('be.visible')
    
    // Cliquer sur le bouton de déconnexion dans la barre d'outils
    cy.get('.mat-toolbar > .ng-star-inserted > :nth-child(3)').click()
    
    // Vérifier qu'on est redirigé vers la page d'accueil après déconnexion
    cy.url().should('eq', 'http://localhost:4200/')
    
    // Vérifier qu'on n'est plus authentifié en essayant d'accéder à la page protégée des sessions
    cy.visit('/sessions')
    cy.url().should('include', '/login') // On est redirigé vers login
  })
  
  it('Affichage des informations utilisateur dans la page Account', () => {
    // Intercepter les requêtes importantes
    cy.intercept('POST', '/api/auth/login').as('loginRequest')
    cy.intercept('GET', '/api/user/*').as('getUserDetails')
    
    // Se connecter avec un compte admin
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre la connexion et la redirection
    cy.wait('@loginRequest')
    cy.url().should('include', '/sessions')
    
    // Cliquer sur le lien "Account" dans le header
    cy.get('.mat-toolbar > .ng-star-inserted > :nth-child(2)').click()
    
    // Vérifier qu'on est redirigé vers la page du compte utilisateur
    cy.url().should('include', '/me')
    
    // Attendre que les détails de l'utilisateur soient chargés
    cy.wait('@getUserDetails')
    
    // Vérifier que le titre de la page est affiché
    cy.get('h1').should('contain', 'User information')
    
    // Vérifier que les informations de l'utilisateur sont affichées
    // Vérifier le nom et prénom dans le premier élément
    cy.get('.mat-card-content > div.ng-star-inserted > :nth-child(1)').should('contain', 'Admin')
    
    // Vérifier l'email dans le deuxième élément
    cy.get('.mat-card-content > div.ng-star-inserted > :nth-child(2)').should('contain', 'yoga@studio.com')
    
    // Vérifier le statut d'admin
    cy.get('.my2').should('contain', 'You are admin')
  })
});