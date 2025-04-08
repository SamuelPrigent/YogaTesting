/// <reference types="cypress" />

describe('Sessions Navigation', () => {
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
    
    beforeEach(() => {
      // Intercepter le login admin
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
      
      // Intercepter la requête pour les détails d'une session
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetail')
      
      cy.loginAsAdmin()
    })
  
    it('Navigation entre la liste et les détails', () => {
      // Intercepter la requête de détails avec une réponse simulée
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetail')
      
      // Aller aux détails
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Vérifier qu'on est sur la page de détails
      cy.url().should('include', '/sessions/detail/')
      cy.wait('@getSessionDetail')
      
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
      // Variable pour stocker le nom de session dynamique
      let sessionName = ""
      
      // Intercepter la requête de création avec une réponse simulée
      cy.intercept('POST', '/api/session', (req) => {
        // Créer un nouvel objet session avec les données du corps de la requête
        const newSession = {
          id: 999,
          ...req.body,
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        req.reply({
          statusCode: 200,
          body: newSession
        });
        
        // Mettre à jour le nom de session
        sessionName = req.body.name;
      }).as('createSession')
      
      // Intercepter la redirection vers la liste après création
      cy.intercept('GET', '/api/session', (req) => {
        if (sessionName) {
          const updatedSessions = [...mockSessions, {
            id: 999,
            name: sessionName,
            description: 'Test de navigation',
            date: '2025-09-10T00:00:00.000+00:00',
            teacher_id: 1,
            users: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];
          
          req.reply({
            statusCode: 200,
            body: updatedSessions
          });
        } else {
          req.reply({
            statusCode: 200,
            body: mockSessions
          });
        }
      }).as('getSessionsAfterCreate')
      
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
      // Variable pour stocker le nouveau nom de session
      let nouveauNomSession = ""
      
      // Intercepter la requête pour obtenir les détails d'une session
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: mockSessions[0]
      }).as('getSessionDetails')
      
      // Intercepter la requête d'obtention des enseignants
      cy.intercept('GET', '/api/teacher', {
        statusCode: 200,
        body: teachers
      }).as('getTeachersForUpdate')
      
      // Intercepter la requête de mise à jour
      cy.intercept('PUT', '/api/session/*', (req) => {
        // Créer une session mise à jour
        const updatedSession = {
          ...mockSessions[0],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        req.reply({
          statusCode: 200,
          body: updatedSession
        });
        
        // Stocker le nouveau nom pour l'utiliser dans l'autre intercepteur
        nouveauNomSession = req.body.name;
      }).as('updateSession')
      
      // Intercepter la redirection vers la liste après mise à jour
      cy.intercept('GET', '/api/session', (req) => {
        // Si nous avons un nouveau nom, créons une version mise à jour des sessions
        if (nouveauNomSession) {
          // Créer une copie du tableau avec la première session modifiée
          const updatedSessions = mockSessions.map((session, index) => {
            if (index === 0) {
              return {
                ...session,
                name: nouveauNomSession,
                updatedAt: new Date().toISOString()
              };
            }
            return session;
          });
          
          req.reply({
            statusCode: 200,
            body: updatedSessions
          });
        } else {
          req.reply({
            statusCode: 200,
            body: mockSessions
          });
        }
      }).as('getSessionsAfterUpdate')
      
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
      // Intercepter la requête pour obtenir les détails d'une session
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetailForDelete')
      
      // Intercepter la requête de suppression
      cy.intercept('DELETE', '/api/session/*', {
        statusCode: 200,
        body: { message: 'Session deleted successfully' }
      }).as('deleteSession')
      
      // Intercepter la redirection vers la liste après suppression
      cy.intercept('GET', '/api/session', (req) => {
        // Simuler la suppression en retirant la première session du mockSessions
        const updatedSessions = [...mockSessions];
        updatedSessions.shift(); // Retire le premier élément
        
        req.reply({
          statusCode: 200,
          body: updatedSessions
        });
      }).as('getSessionsAfterDelete')
      
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