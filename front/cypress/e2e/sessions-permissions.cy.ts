/// <reference types="cypress" />

describe('Sessions Permissions', () => {
    // Données mockées pour les tests
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
    it('Éléments visibles pour un administrateur', () => {
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
      }).as('loginAdminRequest')
      
      // Intercepter la liste des sessions
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: mockSessions
      }).as('getSessions')
      
      // Intercepter la requête pour les détails d'une session
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetail')
      
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
      // Intercepter le login en tant qu'utilisateur standard
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
      }).as('loginUserRequest')
      
      // Intercepter la liste des sessions
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: mockSessions
      }).as('getSessionsUser')
      
      // Intercepter la requête pour les détails d'une session (vue utilisateur)
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetailUser')
      
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
      // Mêmes intercepteurs que dans le test précédent pour l'utilisateur standard
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
      }).as('loginUserRequest')
      
      // Intercepter la liste des sessions
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: mockSessions
      }).as('getSessionsUser')
      
      // Intercepter les accès non autorisés
      cy.intercept('GET', '/api/session/create', {
        statusCode: 403,
        body: { message: 'Access forbidden' }
      }).as('accessForbidden')
      
      // Se connecter en tant qu'utilisateur standard
      cy.loginAsUser()
      
      // Tenter d'accéder directement à la page de création
      cy.visit('/sessions/create')
      
      // Vérifier qu'on est redirigé (ou que la page est interdite)
      cy.url().should('not.include', '/sessions/create')
    })

    it('Tentative d\'accès direct à la page d\'update', () => {
      // Mêmes intercepteurs que dans le test précédent pour l'utilisateur standard
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
      }).as('loginUserRequest')
      
      // Intercepter la liste des sessions
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: mockSessions
      }).as('getSessionsUser')
      
      // Intercepter la requête pour les détails d'une session (vue utilisateur)
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetailUser')
      
      // Intercepter les accès non autorisés à l'update
      cy.intercept('GET', '/api/session/*/update', {
        statusCode: 403,
        body: { message: 'Access forbidden' }
      }).as('updateForbidden')
      
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