/// <reference types="cypress" />

describe('Sessions Validation', () => {
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
      
      cy.loginAsAdmin()
    })
  
    it('Validation du formulaire de création', () => {
      // Accéder à la page de création
      cy.contains('button', 'Create').click()
      cy.url().should('include', '/sessions/create')
      
      // Vérifier que le bouton Submit est désactivé au départ (formulaire vide)
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Test 1: Formulaire avec nom manquant
      cy.get('input[formControlName=date]').type('2025-06-15')
      cy.get('textarea[formControlName=description]').type('Description test')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.contains('mat-option', 'Margot DELAHAYE').click()
      
      // Vérifier que le bouton est toujours désactivé
      cy.get('button[type="submit"]').should('be.disabled') 
      
      // Ajouter le nom et vérifier que le formulaire est valide
      cy.get('input[formControlName=name]').type('Session Test')
      cy.get('button[type="submit"]').should('be.enabled')
      
      // Test 2: Formulaire avec date manquante
      // Nettoyer les champs manuellement au lieu de recharger
      cy.get('input[formControlName=name]').clear()
      cy.get('input[formControlName=date]').clear()
      cy.get('textarea[formControlName=description]').clear()
      
      // Remplir à nouveau mais sans la date
      cy.get('input[formControlName=name]').type('Session Test')
      cy.get('textarea[formControlName=description]').type('Description test')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.contains('mat-option', 'Margot DELAHAYE').click()
      
      // Vérifier que le bouton est désactivé (date manquante)
      cy.get('button[type="submit"]').should('be.disabled') 
      cy.get('input[formControlName=date]').should('have.class', 'ng-invalid')
      
      // Test 3: Formulaire avec description manquante
      // Nettoyer les champs manuellement au lieu de recharger
      cy.get('input[formControlName=name]').clear()
      cy.get('input[formControlName=date]').clear()
      cy.get('textarea[formControlName=description]').clear()
      
      // Remplir à nouveau mais sans la description
      cy.get('input[formControlName=name]').type('Session Test')
      cy.get('input[formControlName=date]').type('2025-06-15')
      cy.get('mat-select[formControlName=teacher_id]').click()
      cy.contains('mat-option', 'Margot DELAHAYE').click()
      
      // Vérifier que le champ description est marqué comme invalide
      cy.get('textarea[formControlName=description]').should('have.class', 'ng-invalid')
      
      // Vérifier que le bouton est désactivé (description manquante)
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Test 4: Formulaire avec enseignant manquant
      // Cliquer sur le bouton retour pour revenir à la liste
      cy.get('.mat-icon').click()
      cy.url().should('include', '/sessions')
      
      // Revenir à un formulaire vide en cliquant sur Create
      cy.contains('button', 'Create').click()
      cy.url().should('include', '/sessions/create')
      
      // Remplir uniquement les champs obligatoires sauf l'enseignant
      cy.get('input[formControlName=name]').type('Session Test')
      cy.get('input[formControlName=date]').type('2025-06-15')
      cy.get('textarea[formControlName=description]').type('Description test')
      
      // Vérifier que le bouton est désactivé car l'enseignant est manquant
      cy.get('button[type="submit"]').should('be.disabled')
      cy.get('mat-select[formControlName=teacher_id]').should('have.class', 'ng-invalid')
    })
  
    it('Validation du formulaire de modification', () => {
      // Intercepter les requêtes
      cy.intercept('GET', '/api/session/*', {
        statusCode: 200,
        body: {
          ...mockSessions[0],
          teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' }
        }
      }).as('getSessionDetails')
      
      // Accéder à la page d'édition
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Edit').click()
      })
      
      // Attendre le chargement des données
      cy.url().should('include', '/sessions/update/')
      cy.wait('@getSessionDetails')
      cy.wait(500)
      
      // Test 1: Effacer le nom
      cy.get('input[formControlName=name]').clear()
      cy.get('button[type="submit"]').should('be.disabled')
      cy.get('input[formControlName=name]').should('have.class', 'ng-invalid')
      
      // Restaurer le nom et vérifier que le formulaire est valide
      cy.get('input[formControlName=name]').type('Session Test')
      cy.get('button[type="submit"]').should('be.enabled')
      
      // Test 2: Effacer la date
      cy.get('input[formControlName=date]').clear()
      cy.get('button[type="submit"]').should('be.disabled')
      cy.get('input[formControlName=date]').should('have.class', 'ng-invalid')
      
      // Restaurer la date
      cy.get('input[formControlName=date]').type('2025-08-15')
      
      // Test 3: Tester avec une date vide (ce qui est invalide)
      cy.get('input[formControlName=date]').clear()
      cy.get('button[type="submit"]').should('be.disabled')
      cy.get('input[formControlName=date]').should('have.class', 'ng-invalid')
      
      // Restaurer une date valide
      cy.get('input[formControlName=date]').type('2025-08-15')
      cy.get('button[type="submit"]').should('be.enabled')
      
      // Vérifier que le formulaire est à nouveau valide
      cy.get('button[type="submit"]').should('be.enabled')
    })
  })