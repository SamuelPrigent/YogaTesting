/// <reference types="cypress" />

describe('Sessions CRUD', () => {
    beforeEach(() => {
      cy.loginAsAdmin()
    })
  
    it('Récupération de toutes les sessions (GET all)', () => {
      // Vérifier que des sessions sont affichées
      cy.get('.items .item').should('have.length.at.least', 1)
      
      // Vérifier la structure d'une session
      cy.get('.items .item').first().within(() => {
        cy.get('*').should('have.length.at.least', 1)
        cy.get('button').contains('Detail').should('exist')
      })
    })
  
    it('Récupération d\'une session spécifique (GET one)', () => {
      // Intercepter la requête de détails
      cy.intercept('GET', '/api/session/*').as('getSessionDetail')
      
      // Accéder aux détails de la première session
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Vérifier la redirection vers la page détail
      cy.url().should('include', '/sessions/detail/')
      
      // Attendre le chargement des détails
      cy.wait('@getSessionDetail')
      
      // Vérifier l'affichage des détails
      cy.get('h1').should('be.visible')
      cy.get('mat-card-content p').should('be.visible')
      cy.contains('span', 'Margot DELAHAYE').should('be.visible')
    })
  
    it('Création d\'une session (POST)', () => {
      // Intercepter la requête de création
      cy.intercept('POST', '/api/session').as('createSession')
      
      // Cliquer sur le bouton Create
      cy.contains('button', 'Create').click()
      cy.url().should('include', '/sessions/create')
  
      // Remplir le formulaire
      const sessionName = 'Session Test Cypress ' + new Date().getTime()
      cy.get('input[formControlName=name]').type(sessionName)
      cy.get('input[formControlName=date]').type('2025-06-15')
      cy.get('textarea[formControlName=description]').type('Description de test automatisé')
      
      // Sélectionner un enseignant
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.get('mat-option').should('be.visible')
      cy.contains('mat-option', 'Margot DELAHAYE').click()
  
      // Soumettre le formulaire
      cy.get('button[type="submit"]').click()
      
      // Attendre la création
      cy.wait('@createSession')
      
      // Vérifier le message de confirmation
      cy.get('.mat-simple-snack-bar-content').should('contain', 'Session created')
  
      // Vérifier la redirection et l'affichage de la nouvelle session
      cy.url().should('include', '/sessions')
      cy.contains(sessionName).should('be.visible')
    })
  
    it('Modification d\'une session (PUT)', () => {
      // Intercepter les requêtes
      cy.intercept('GET', '/api/session/*').as('getSessionDetails')
      cy.intercept('PUT', '/api/session/*').as('updateSession')
      
      // Accéder à la première session pour la modifier
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Edit').click()
      })
      
      // Attendre le chargement des détails
      cy.url().should('include', '/sessions/update/')
      cy.wait('@getSessionDetails')
      
      // Modifier les champs
      cy.get('input[formControlName=name]').clear()
      cy.get('textarea[formControlName=description]').clear()
      
      const nouveauNom = 'Session Modifiée ' + new Date().getTime()
      cy.get('input[formControlName=name]').type(nouveauNom)
      cy.get('textarea[formControlName=description]').type('Description mise à jour')
      cy.get('input[formControlName=date]').clear()
      cy.get('input[formControlName=date]').type('2025-07-20')
      
      // Soumettre le formulaire
      cy.get('button[type="submit"]').click()
      
      // Attendre la mise à jour
      cy.wait('@updateSession')
      
      // Vérifier le message de confirmation
      cy.get('.mat-simple-snack-bar-content').should('contain', 'Session updated')
      
      // Vérifier la redirection et l'affichage de la session modifiée
      cy.url().should('include', '/sessions')
      cy.contains(nouveauNom).should('be.visible')
    })
  
    it('Suppression d\'une session (DELETE)', () => {
      // Compter les sessions avant suppression
      cy.get('.items .item').its('length').then((initialCount) => {
        // Intercepter la requête de suppression
        cy.intercept('DELETE', '/api/session/*').as('deleteSession')
        
        // Accéder aux détails de la première session
        cy.get('.items .item').first().within(() => {
          cy.contains('button', 'Detail').click()
        })
        
        // Attendre le chargement de la page détail
        cy.url().should('include', '/sessions/detail/')
        
        // Supprimer la session
        cy.contains('button', 'Delete').click()
        
        // Confirmer la suppression
        cy.get('.mat-snack-bar-container').should('be.visible')
        cy.get('.mat-snack-bar-container').within(() => {
          cy.contains('div', 'Session deleted').click()
        })
        
        // Attendre la suppression
        cy.wait('@deleteSession')
        
        // Vérifier le message de confirmation
        cy.get('.mat-snack-bar-container').should('contain', 'Session deleted')
        
        // Vérifier la diminution du nombre de sessions
        cy.get('.items .item').its('length').should('eq', initialCount - 1)
      })
    })
  })