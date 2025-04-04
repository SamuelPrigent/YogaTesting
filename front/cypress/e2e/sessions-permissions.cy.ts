/// <reference types="cypress" />

describe('Sessions Permissions', () => {
    it('Éléments visibles pour un administrateur', () => {
      // Se connecter en tant qu'admin
      cy.loginAsAdmin()
      
      // Vérifier que le bouton Create est visible
      cy.contains('button', 'Create').should('be.visible')
      
      // Vérifier que les boutons Edit sont visibles
      cy.contains('button', 'Edit').should('be.visible')
      
      // Vérifier que les boutons Detail sont visibles
      cy.contains('button', 'Detail').should('be.visible')
      
      // Vérifier l'accès à la page de détail
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      cy.url().should('include', '/sessions/detail/')
      
      // Vérifier que le bouton Delete est visible sur la page de détail
      cy.contains('button', 'Delete').should('be.visible')
      
      // Retour à la liste
      cy.go('back')
      cy.url().should('include', '/sessions')
    })
    
    it('Éléments visibles pour un utilisateur standard', () => {
      // Se connecter en tant qu'utilisateur standard
      cy.loginAsUser()
      
      // Vérifier que le bouton Create n'est pas visible
      cy.contains('button', 'Create').should('not.exist')
      
      // Vérifier que les boutons Edit ne sont pas visibles
      cy.contains('button', 'Edit').should('not.exist')
      
      // Vérifier que les boutons Detail sont visibles
      cy.contains('button', 'Detail').should('be.visible')
      
      // Vérifier l'accès à la page de détail
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      cy.url().should('include', '/sessions/detail/')
      
      // Vérifier que le bouton Delete n'est pas visible sur la page de détail pour un utilisateur standard
      cy.contains('button', 'Delete').should('not.exist')
    })
    
    it('Tentative d\'accès direct à la page de création', () => {
      // Se connecter en tant qu'utilisateur standard
      cy.loginAsUser()
      
      // Tenter d'accéder directement à la page de création
      cy.visit('/sessions/create')
      
      // Vérifier qu'on est redirigé (ou que la page est interdite)
      cy.url().should('not.include', '/sessions/create')
    })

    it('Tentative d\'accès direct à la page d\'update', () => {
      // Se connecter en tant qu'utilisateur standard
      cy.loginAsUser()

      // D'abord, accéder normalement à la page de détail pour obtenir un ID de session
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Extraire l'ID de l'URL
      cy.url().then((url) => {
        const sessionId = url.split('/').pop()
        
        // Vérifier qu'on n'a pas accès au bouton Delete sur la page de détail
        cy.contains('button', 'Delete').should('not.exist')
        
        // Retour à la liste
        cy.get('[fxlayout="row"] > .mat-focus-indicator > .mat-button-wrapper > .mat-icon').click()
        cy.url().should('include', '/sessions')
        
        // Tenter d'accéder directement à la page d'édition
        cy.visit(`/sessions/update/${sessionId}`)
        
        // Vérifier qu'on est redirigé (ou que la page est interdite)
        cy.url().should('not.include', `/sessions/update/${sessionId}`)
      })
    })
  })