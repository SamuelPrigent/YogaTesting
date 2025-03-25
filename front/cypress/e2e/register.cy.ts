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
    
    // Intercepter la requête d'inscription
    cy.intercept('POST', '/api/auth/register').as('registerRequest')

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

  it('Échec d\'inscription - Email déjà utilisé', () => {
    // Intercepter la requête d'inscription pour email déjà utilisé
    cy.intercept('POST', '/api/auth/register').as('registerFailRequest')

    // Remplir le formulaire
    cy.get('input[formControlName=firstName]').type("Pierre")
    cy.get('input[formControlName=lastName]').type("Martin")
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("password123")

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()

    // Vérifier que la requête d'inscription a été envoyée
    cy.wait('@registerFailRequest')

    // Attendre que l'application ait le temps de traiter la réponse
    cy.wait(500)
    
    // Note: Le comportement réel est de ne pas afficher de message d'erreur spécifique
    // Vérifier simplement qu'on reste sur la page d'inscription et qu'on n'est pas redirigé

    // Vérifier qu'on reste sur la page d'inscription
    cy.url().should('include', '/register')
  })

  it('Formulaire invalide - Validation des champs', () => {

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
