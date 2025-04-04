/// <reference types="cypress" />

describe('Sessions Navigation', () => {
    beforeEach(() => {
      cy.loginAsAdmin()
    })
  
    it('Navigation entre la liste et les détails', () => {
      // Aller aux détails
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Vérifier qu'on est sur la page de détails
      cy.url().should('include', '/sessions/detail/')
      
      // Cliquer sur le bouton Back avec le sélecteur correct
      cy.get('[fxlayout="row"] > .mat-focus-indicator > .mat-button-wrapper > .mat-icon').click()
      
      // Vérifier qu'on est revenu à la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/detail')
    })
  
    it('Navigation entre la liste et le formulaire de création', () => {
      // Aller à la page de création
      cy.contains('button', 'Create').click()
      
      // Vérifier qu'on est sur la page de création
      cy.url().should('include', '/sessions/create')
      
      // Cliquer sur le bouton Back
      cy.get('.mat-icon').click()
      
      // Vérifier qu'on est revenu à la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/create')
    })
  
    it('Navigation entre la liste et le formulaire d\'édition', () => {
      // Aller à la page d'édition
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Edit').click()
      })
      
      // Vérifier qu'on est sur la page d'édition
      cy.url().should('include', '/sessions/update/')
      
      // Cliquer sur le bouton back
      cy.get('.mat-icon').click()
      
      // Vérifier qu'on est revenu à la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/update')
    })
  
    it('Redirection après création réussie', () => {
      // Intercepter la requête de création
      cy.intercept('POST', '/api/session').as('createSession')
      
      // Aller à la page de création
      cy.contains('button', 'Create').click()
      
      // Remplir le formulaire
      cy.get('input[formControlName=name]').type('Session Navigation Test')
      cy.get('input[formControlName=date]').type('2025-09-10')
      cy.get('textarea[formControlName=description]').type('Test de navigation')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.contains('mat-option', 'Margot DELAHAYE').click()
      
      // Soumettre le formulaire
      cy.get('button[type="submit"]').click()
      
      // Attendre la création
      cy.wait('@createSession')
      
      // Vérifier la redirection vers la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/create')
      
      // Vérifier l'affichage du message de confirmation
      cy.get('.mat-simple-snack-bar-content').should('contain', 'Session created')
    })
  
    it('Redirection après modification réussie', () => {
      // Intercepter les requêtes
      cy.intercept('GET', '/api/session/*').as('getSessionDetails')
      cy.intercept('PUT', '/api/session/*').as('updateSession')
      
      // Aller à la page d'édition
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Edit').click()
      })
      
      // Attendre le chargement
      cy.url().should('include', '/sessions/update/')
      cy.wait('@getSessionDetails')
      
      // Modifier le titre
      cy.get('input[formControlName=name]').clear()
      cy.get('input[formControlName=name]').type('Session Modifiée Pour Navigation')
      
      // Soumettre le formulaire
      cy.get('button[type="submit"]').click()
      
      // Attendre la mise à jour
      cy.wait('@updateSession')
      
      // Vérifier la redirection vers la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/update')
      
      // Vérifier l'affichage du message de confirmation
      cy.get('.mat-simple-snack-bar-content').should('contain', 'Session updated')
    })
  
    it('Redirection après suppression réussie', () => {
      // Intercepter la requête de suppression
      cy.intercept('DELETE', '/api/session/*').as('deleteSession')
      
      // Aller à la page de détails
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Vérifier qu'on est sur la page de détails
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
      
      // Vérifier la redirection vers la liste
      cy.url().should('include', '/sessions')
      cy.url().should('not.include', '/detail')
      
      // Vérifier l'affichage du message de confirmation
      cy.get('.mat-snack-bar-container').should('contain', 'Session deleted')
    })
  })