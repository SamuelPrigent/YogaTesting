/// <reference types="cypress" />

describe('Register spec', () => {
  beforeEach(() => {
    // Visiter la page d'inscription avant chaque test
    cy.visit('/register')
  })
  it('Inscription réussie', () => {
    // Générer un email aléatoire pour éviter les conflits
    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `jean.dupont${randomSuffix}@example.com`;
    
    // Intercepter la requête d'inscription avec une réponse de succès
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        id: 10,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: email,
        admin: false
      }
    }).as('registerRequest')

    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Jean")
    cy.get('input[formControlName=lastName]').type("Dupont")
    cy.get('input[formControlName=email]').type(email)
    cy.get('input[formControlName=password]').type("password123")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'inscription a été envoyée
    cy.wait('@registerRequest')

    // Vérifier la redirection vers la page de connexion
    cy.url().should('include', '/login')
  })

  it('Échec d\'inscription - Email déjà utilisé 400', () => {
    // Intercepter la requête d'inscription pour email déjà utilisé avec une réponse d'erreur
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        message: 'Email déjà utilisé',
        error: 'Bad Request'
      }
    }).as('registerFailRequest')

    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Pierre")
    cy.get('input[formControlName=lastName]').type("Martin")
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("password123")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'inscription a été envoyée
    cy.wait('@registerFailRequest')
    
    // Note: Le comportement réel est de ne pas afficher de message d'erreur spécifique
    // Vérifier simplement qu'on reste sur la page d'inscription et qu'on n'est pas redirigé

    // Vérifier qu'on reste sur la page d'inscription
    cy.url().should('include', '/register')
  })

  it('Échec d\'inscription - Erreur serveur 500', () => {
    // Intercepter la requête d'inscription avec une erreur serveur 500
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 500,
      body: { message: 'Internal Server Error' }
    }).as('registerServerError')
    
    // Générer un email aléatoire
    const randomSuffix = Math.floor(Math.random() * 100000);
    const email = `error.test${randomSuffix}@example.com`;
    
    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Error")
    cy.get('input[formControlName=lastName]').type("Test")
    cy.get('input[formControlName=email]').type(email)
    cy.get('input[formControlName=password]').type("password123")
    
    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()
    
    // Attendre que la requête interceptée soit terminée
    cy.wait('@registerServerError')
    
    // Vérifier qu'un message d'erreur est affiché (si applicable dans l'UI)
    // Si l'application affiche un message d'erreur spécifique, vérifiez-le ici
    
    // Vérifier qu'on reste sur la page d'inscription en cas d'erreur serveur
    cy.url().should('include', '/register')
  })

  it('Formulaire invalide - Validation des champs', () => {
    // (Ne devrait pas être appelé dans ce test)
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200, 
      body: {}
    }).as('registerFormValidation')

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

  it('Vérification de la validation des champs obligatoires', () => {
    // Préparer l'intercepteur en cas de soumission (ne devrait pas être appelé dans ce test)
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {}
    }).as('registerFieldsValidation')
    
    // Vérifier que le bouton est désactivé initialement (formulaire vide)
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Tester avec seulement le prénom
    cy.get('input[formControlName=firstName]').type("Thomas")
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Ajouter le nom de famille
    cy.get('input[formControlName=lastName]').type("Dupuis")
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Ajouter un email invalide
    cy.get('input[formControlName=email]').type("email-invalide")
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Corriger l'email
    cy.get('input[formControlName=email]').clear().type("thomas.dupuis@example.com")
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Ajouter le mot de passe
    cy.get('input[formControlName=password]').type("password123")
    
    // Vérifier que le bouton est maintenant actif
    cy.get('button[type="submit"]').should('be.enabled')
  })
  
});
