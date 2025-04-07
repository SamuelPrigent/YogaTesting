/// <reference types="cypress" />

describe('Sessions CRUD', () => {
  const mockSessions = [
    {
      id: 413,
      name: 'Yoga du matin',
      description: 'Réveillez-vous en douceur',
      date: '2025-06-10T00:00:00.000+00:00',
      teacher_id: 1,
      users: [],
      createdAt: '2025-04-05T00:48:12',
      updatedAt: '2025-04-05T00:48:12',
    },
    {
      id: 414,
      name: 'Pilates intermédiaire',
      description: 'Renforcement musculaire',
      date: '2025-06-20T00:00:00.000+00:00',
      teacher_id: 1,
      users: [],
      createdAt: '2025-04-05T00:48:50',
      updatedAt: '2025-04-05T00:48:50',
    },
  ];

  const teachers = [
    {
      id: 1,
      firstName: 'Margot',
      lastName: 'DELAHAYE',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    },
  ];

  beforeEach(() => {
    // Intercepter le login admin (normalement déjà fait dans loginAsAdmin, mais pour être sûr)
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'faketoken',
        type: 'Bearer',
        id: 898,
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'Admin',
        admin: true,
      },
    }).as('loginAdminRequest');

    // Intercepter la liste des sessions
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: mockSessions,
    }).as('getSessions');

    // Intercepter la liste des enseignants
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: teachers,
    }).as('getTeachers');

    // Intercepter les requêtes pour les détails d'un enseignant spécifique
    cy.intercept('GET', '/api/teacher/*', {
      statusCode: 200,
      body: teachers[0],
    }).as('getTeacherDetails');

    cy.loginAsAdmin();
  });

  it('Récupération de toutes les sessions (GET all)', () => {
    // Vérifier que des sessions sont affichées
    cy.get('.items .item').should('have.length.at.least', 1);

    // Vérifier la structure d'une session
    cy.get('.items .item')
      .first()
      .within(() => {
        cy.get('*').should('have.length.at.least', 1);
        cy.get('button').contains('Detail').should('exist');
      });
  });

  it("Récupération d'une session spécifique (GET one)", () => {
    // Intercepter la requête de détails avec une réponse simulée
    cy.intercept('GET', '/api/session/*', {
      statusCode: 200,
      body: {
        ...mockSessions[0],
        // Ajouter les informations de l'enseignant qui sont retournées par l'API pour les détails
        teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
      },
    }).as('getSessionDetail');

    // Accéder aux détails de la première session
    cy.get('.items .item')
      .first()
      .within(() => {
        cy.contains('button', 'Detail').click();
      });

    // Vérifier la redirection vers la page détail
    cy.url().should('include', '/sessions/detail/');

    // Attendre le chargement des détails
    cy.wait('@getSessionDetail');

    // Vérifier l'affichage des détails
    cy.get('h1').should('be.visible');
    cy.get('mat-card-content p').should('be.visible');
    // Vérifier que le nom de l'enseignant est présent quelque part sur la page
    cy.contains('Margot DELAHAYE').should('be.visible');
  });

  it("Création d'une session (POST)", () => {
    // Intercepter la requête de création avec une réponse simulée
    cy.intercept('POST', '/api/session', (req) => {
      // Créer un nouvel objet session avec les données du corps de la requête
      const newSession = {
        id: 3, // nouvel ID
        ...req.body,
        teacher: { id: 1, firstName: 'Margot', lastName: 'DELAHAYE' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      req.reply({
        statusCode: 200,
        body: newSession,
      });

      // Mettre à jour la liste des sessions pour les futurs appels
      mockSessions.push(newSession);
    }).as('createSession');

    // Intercepter la requête pour obtenir les enseignants
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: teachers,
    }).as('getTeachersForCreate');

    // Intercepter la redirection vers la liste après création
    // On va capturer le nom de session généré dynamiquement et le réutiliser pour la réponse
    let dynamicSessionName = '';

    cy.intercept('GET', '/api/session', (req) => {
      // Si nous avons un nom de session dynamique, créons une version mise à jour des sessions
      if (dynamicSessionName) {
        const updatedSessions = [
          ...mockSessions,
          {
            id: 999,
            name: dynamicSessionName,
            description: 'Description de test automatisé',
            date: '2025-06-15T00:00:00.000+00:00',
            teacher_id: 1,
            users: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        req.reply({
          statusCode: 200,
          body: updatedSessions,
        });
      } else {
        req.reply({
          statusCode: 200,
          body: mockSessions,
        });
      }
    }).as('getSessionsAfterCreate');

    // Cliquer sur le bouton Create
    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');

    // S'assurer que les enseignants sont chargés
    cy.wait('@getTeachersForCreate');

    // Remplir le formulaire
    const sessionName = 'Session Test Cypress ' + new Date().getTime();
    // On stocke la valeur dans une variable pour pouvoir la réutiliser dans l'intercepteur
    dynamicSessionName = sessionName;

    cy.get('input[formControlName=name]').type(sessionName);
    cy.get('input[formControlName=date]').type('2025-06-15');
    cy.get('textarea[formControlName=description]').type(
      'Description de test automatisé'
    );

    // Sélectionner un enseignant
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.get('mat-option').should('be.visible');
    cy.contains('mat-option', 'Margot DELAHAYE').click();

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la création
    cy.wait('@createSession');

    // Vérifier le message de confirmation
    cy.get('.mat-simple-snack-bar-content').should(
      'contain',
      'Session created'
    );

    // Vérifier la redirection et l'affichage de la nouvelle session
    cy.url().should('include', '/sessions');
    cy.contains(sessionName).should('be.visible');
  });

  it("Modification d'une session (PUT)", () => {
    // Intercepter la requête pour obtenir les détails d'une session
    cy.intercept('GET', '/api/session/*', {
      statusCode: 200,
      body: mockSessions[0],
    }).as('getSessionDetails');

    // Intercepter la requête d'obtention des enseignants
    cy.intercept('GET', '/api/teacher', {
      statusCode: 200,
      body: teachers,
    }).as('getTeachersForUpdate');

    // Intercepter la requête de mise à jour
    cy.intercept('PUT', '/api/session/*', (req) => {
      // Mettre à jour la session dans le mock pour les futurs appels
      const updatedSession = {
        ...mockSessions[0],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      // Remplacer la session dans le tableau mock
      mockSessions[0] = updatedSession;

      req.reply({
        statusCode: 200,
        body: updatedSession,
      });
    }).as('updateSession');

    // Variable pour stocker le nouveau nom de session
    let nouveauNomSession = '';

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
              description: 'Description mise à jour',
              date: '2025-07-20T00:00:00.000+00:00',
              updatedAt: new Date().toISOString(),
            };
          }
          return session;
        });

        req.reply({
          statusCode: 200,
          body: updatedSessions,
        });
      } else {
        req.reply({
          statusCode: 200,
          body: mockSessions,
        });
      }
    }).as('getSessionsAfterUpdate');

    // Accéder à la première session pour la modifier
    cy.get('.items .item')
      .first()
      .within(() => {
        cy.contains('button', 'Edit').click();
      });

    // Attendre le chargement des détails
    cy.url().should('include', '/sessions/update/');
    cy.wait('@getSessionDetails');
    cy.wait('@getTeachersForUpdate');

    // Modifier les champs
    cy.get('input[formControlName=name]').clear();
    cy.get('textarea[formControlName=description]').clear();

    const nouveauNom = 'Session Modifiée ' + new Date().getTime();
    // Stocker le nouveau nom pour l'utiliser dans l'intercepteur
    nouveauNomSession = nouveauNom;

    cy.get('input[formControlName=name]').type(nouveauNom);
    cy.get('textarea[formControlName=description]').type(
      'Description mise à jour'
    );
    cy.get('input[formControlName=date]').clear();
    cy.get('input[formControlName=date]').type('2025-07-20');

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click();

    // Attendre la mise à jour
    cy.wait('@updateSession');

    // Vérifier le message de confirmation
    cy.get('.mat-simple-snack-bar-content').should(
      'contain',
      'Session updated'
    );

    // Vérifier la redirection et l'affichage de la session modifiée
    cy.url().should('include', '/sessions');
    cy.contains(nouveauNom).should('be.visible');
  });

  it("Suppression d'une session (DELETE)", () => {
    // Intercepter la requête pour obtenir les détails d'une session
    cy.intercept('GET', '/api/session/*', {
      statusCode: 200,
      body: mockSessions[0],
    }).as('getSessionDetailForDelete');

    // Intercepter la requête de suppression
    cy.intercept('DELETE', '/api/session/*', {
      statusCode: 200,
      body: { message: 'Session deleted successfully' },
    }).as('deleteSession');

    // Intercepter la redirection vers la liste après suppression
    cy.intercept('GET', '/api/session', {
      statusCode: 200,
      body: [mockSessions[1]], // Ne garder que la deuxième session pour simuler la suppression de la première
    }).as('getSessionsAfterDelete');

    // Compter les sessions avant suppression
    cy.get('.items .item')
      .its('length')
      .then((initialCount) => {
        // Accéder aux détails de la première session
        cy.get('.items .item')
          .first()
          .within(() => {
            cy.contains('button', 'Detail').click();
          });

        // Attendre le chargement de la page détail
        cy.url().should('include', '/sessions/detail/');
        cy.wait('@getSessionDetailForDelete');

        // Supprimer la session
        cy.contains('button', 'Delete').click();

        // Confirmer la suppression
        cy.get('.mat-snack-bar-container').should('be.visible');
        cy.get('.mat-snack-bar-container').within(() => {
          cy.contains('div', 'Session deleted').click();
        });

        // Attendre la suppression
        cy.wait('@deleteSession');

        // Vérifier le message de confirmation
        cy.get('.mat-snack-bar-container').should('contain', 'Session deleted');

        // S'assurer qu'on est redirigé vers la liste des sessions
        cy.url().should('include', '/sessions');
        cy.wait('@getSessionsAfterDelete');

        // Vérifier la diminution du nombre de sessions
        cy.get('.items .item').its('length').should('eq', 1); // Après suppression, il ne doit rester qu'une seule session
      });
  });
});
