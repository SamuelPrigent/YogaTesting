/// <reference types="cypress" />

describe('Sessions spec', () => {
  beforeEach(() => {
    // Intercepter les requêtes pour pouvoir vérifier qu'elles sont bien terminées
    cy.intercept('POST', '/api/auth/login').as('loginRequest')
    cy.intercept('GET', '/api/session').as('sessionsRequest')
    
    // Visiter la page de login avant chaque test
    cy.visit('/login')

    // Se connecter avec les vrais identifiants admin
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre explicitement que la requête de login soit terminée
    cy.wait('@loginRequest')
    
    // Attendre que la redirection vers la page des sessions soit effectuée
    cy.url().should('include', '/sessions')
    
    // Attendre explicitement que les sessions soient chargées
    cy.wait('@sessionsRequest')
    
    // Vérifier que la page des sessions est bien chargée
    cy.contains('Rentals available').should('be.visible')
  })
  
  // Ajout d'un afterEach vide pour éviter tout conflit avec un afterEach global
  afterEach(() => {
    // Volontairement vide pour désactiver tout afterEach global
  })

  it('Affichage de la liste des sessions', () => {
    // Vérifier que le titre est affiché
    cy.get('[fxlayout="row"] > .mat-card-header-text > .mat-card-title').should('contain', 'Rentals available')

    // Vérifier que des sessions sont affichées (au moins une)
    cy.get('.items .item').should('have.length.at.least', 1)
    
    // Vérifier la structure d'une session sans dépendre du contenu spécifique
    cy.get('.items .item').first().within(() => {
      // Vérifier la présence des éléments structurels de base
      // Le titre peut être n'importe quel élément contenant du texte
      cy.get('*').should('have.length.at.least', 1) // Au moins un élément
      // Vérifier qu'il y a au moins un bouton Detail
      cy.get('button').contains('Detail').should('exist')
    })
  })

  // Test des permissions admin
  it('Affichage des boutons pour un utilisateur admin', () => {
    // L'utilisateur admin est déjà connecté grâce au beforeEach    
    // Vérifier que le bouton Create est visible pour un admin
    cy.contains('button', 'Create').should('be.visible')
    
    // Vérifier que les boutons Edit sont visibles pour un admin
    cy.contains('button', 'Edit').should('be.visible')
  })
  
  // Test des permissions utilisateur standard
  it('Affichage des boutons pour un utilisateur non-admin', () => {
    // D'abord, se déconnecter de l'utilisateur admin
    cy.get('.mat-toolbar > .ng-star-inserted > :nth-child(3)').click()
    // La redirection après déconnexion va vers la page d'accueil, pas directement vers login
    cy.url().should('eq', 'http://localhost:4200/')
    
    // Ensuite, naviguons manuellement vers la page d'inscription
    cy.visit('/register')
    
    // S'assurer que l'utilisateur non-admin existe
    // D'abord, essayer de créer l'utilisateur (si ça échoue ce n'est pas grave)
    cy.intercept('POST', '/api/auth/register').as('registerNonAdmin')
    cy.visit('/register')
    cy.get('input[formControlName=firstName]').type("User")
    cy.get('input[formControlName=lastName]').type("Test")
    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()

    // On ne fait pas de wait car l'inscription peut échouer si l'utilisateur existe déjà
    // Dans tous les cas, on continue avec la connexion
    
    // Intercepter les requêtes pour le login non-admin et les sessions
    cy.intercept('POST', '/api/auth/login').as('loginNonAdminRequest')
    cy.intercept('GET', '/api/session').as('sessionsNonAdmin')
    
    // Maintenant, se connecter avec l'utilisateur non-admin
    cy.visit('/login')
    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre que les requêtes soient terminées
    cy.wait('@loginNonAdminRequest')
    cy.wait('@sessionsNonAdmin')
    
    // Vérifier que le bouton Create n'est pas visible pour un non-admin
    cy.contains('button', 'Create').should('not.exist')
    
    // Vérifier que les boutons Edit ne sont pas visibles pour un non-admin
    cy.contains('button', 'Edit').should('not.exist')
    
    // Vérifier que les boutons Detail sont toujours visibles
    cy.contains('button', 'Detail').should('be.visible')
  })

  it('Navigation vers les détails d\'une session', () => {
    // Cliquer sur le bouton Detail de la première session
    cy.get('.items .item').first().within(() => {
      cy.contains('button', 'Detail').click()
    })
    
    // Vérifier qu'on est redirigé vers la page de détail
    cy.url().should('include', '/sessions/detail/')
    
    // Vérifier que les détails sont affichés
    // Utiliser une attente explicite pour s'assurer que la page est entièrement chargée
    cy.wait(500)
    
    // Vérifier que les informations de la session sont correctement affichées
    cy.get('h1').should('be.visible') // Le titre de la session existe
    cy.get('mat-card-content p').should('be.visible') // La description existe
    
    // Vérifier que le nom de l'enseignant est affiché, avec Margot DELAHAYE
    cy.contains('span', 'Margot DELAHAYE').should('be.visible')
    
    // Vérifier que le bouton Delete est visible pour un admin
    cy.contains('button', 'Delete').should('be.visible')
  })

  it('Création d\'une session', () => {
    // Cliquer sur le bouton Create pour créer une nouvelle session
    cy.contains('button', 'Create').click()

    // Vérifier qu'on est sur la page de création de session
    cy.url().should('include', '/sessions/create')

    // Remplir le formulaire avec des données valides
    cy.get('input[formControlName=name]').type('Nouvelle Session de Yoga')
    cy.get('input[formControlName=date]').type('2025-04-30')
    cy.get('textarea[formControlName=description]').type('Description de la nouvelle session')
    
    // Sélectionner un enseignant existant dans la base de données
    cy.get('mat-select[formControlName=teacher_id]').click()
    // On attend que les options soient chargées
    cy.get('mat-option').should('be.visible')
    // On sélectionne Margot DELAHAYE qui existe en BDD
    cy.contains('mat-option', 'Margot DELAHAYE').click()

    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()
    
    // Vérifier l'affichage du message de confirmation dans le snackbar
    cy.get('.mat-simple-snack-bar-content').should('contain', 'Session created')

    // Vérifier qu'on est redirigé vers la liste des sessions
    cy.url().should('include', '/sessions')
    
    // Vérifier que la nouvelle session apparaît dans la liste
    // On attend que la page se charge
    cy.contains('Rentals available').should('be.visible')
    // On vérifie que notre nouvelle session est visible
    cy.contains('Nouvelle Session de Yoga').should('be.visible')
  })

  it('Affichage d\'erreur en l\'absence d\'un champ obligatoire lors de la création', () => {
    // Aller sur la page de création
    cy.contains('button', 'Create').click()
    cy.url().should('include', '/sessions/create')

    // Attendre que la page soit chargée complètement
    cy.contains('Create session').should('be.visible')

    // Remplir le formulaire de manière incomplète (omettre des champs obligatoires)
    cy.get('input[formControlName=name]').type('Nouvelle Session Incomplète')
    // Remplir partiellement le formulaire (sans date qui est obligatoire)
    cy.get('input[formControlName=name]').type('Session sans date')
    cy.get('textarea[formControlName=description]').type('Description incomplète')
    
    // Sélectionner Margot DELAHAYE qui existe en BDD
    cy.get('mat-select[formControlName=teacher_id]').click()
    cy.contains('mat-option', 'Margot DELAHAYE').click()

    // Vérifier que le bouton de soumission est désactivé
    cy.get('button[type="submit"]').should('be.disabled')

    // Pas besoin d'essayer de soumettre le formulaire manuellement puisque le bouton est désactivé
    // Vérifier que l'attribut 'disabled' est bien présent sur le bouton
    cy.get('button[type="submit"]').should('have.attr', 'disabled')

    // Vérifier qu'on reste sur la page de création (pas de redirection)
    cy.url().should('include', '/sessions/create')

    // Vérifier que le formulaire reste invalide
    cy.wait(500) // Attendre que la validation du formulaire se fasse
    
    // Vérifier que le bouton de soumission reste désactivé
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Vérifier visuellement que le champ date est marqué comme invalide (bordure rouge)
    cy.get('input[formControlName=date]').should('have.class', 'ng-invalid')
  })

  it('Suppression d\'une session', () => {
    // Se connecter en tant qu'admin
    cy.intercept('POST', '/api/auth/login').as('loginAdminRequest')
    cy.intercept('GET', '/api/session').as('sessionsAdmin')
    
    cy.visit('/login')
    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type="submit"]').click()
    
    // Attendre que les requêtes soient terminées
    cy.wait('@loginAdminRequest')
    cy.wait('@sessionsAdmin')
    
    // Étape 1: Compter les sessions avant la suppression
    cy.get('.items .item').its('length').then((initialCount) => {
      // Étape 2: Intercepter la requête de suppression
      cy.intercept('DELETE', '/api/session/*').as('deleteSession')
      
      // Étape 3: D'abord accéder aux détails de la session
      // Note: Nous utilisons first() pour sélectionner la première session
      cy.get('.items .item').first().within(() => {
        cy.contains('button', 'Detail').click()
      })
      
      // Étape 3 bis: Attendre que la page de détail soit chargée
      cy.url().should('include', '/sessions/detail/')
      
      // Étape 3 ter: Cliquer sur le bouton Delete dans la page de détail
      cy.contains('button', 'Delete').click()
      
      // Étape 4: Confirmer la suppression dans le dialogue
      // Le dialogue de confirmation utilise un sélecteur différent (visible sur la capture d'écran)
      cy.get('.mat-snack-bar-container').should('be.visible')
      cy.get('.mat-snack-bar-container').within(() => {
        cy.contains('div', 'Session deleted').click()
      })
      
      // Étape 5: Attendre que la requête de suppression soit terminée
      cy.wait('@deleteSession')
      
      // Étape 6: Vérifier le message de confirmation dans le snackbar
      cy.get('.mat-snack-bar-container').should('be.visible')
      cy.get('.mat-snack-bar-container').should('contain', 'Session deleted')
      
      // Étape 7: Vérifier que le nombre de sessions a diminué
      cy.get('.items .item').its('length').should('eq', initialCount - 1)
    })
  })

  it('Modification d\'une session', () => {
    // Intercepter les requêtes
    cy.intercept('GET', '/api/session/*').as('getSessionDetails')
    cy.intercept('PUT', '/api/session/*').as('updateSession')
    
    // Accéder à la première session pour la modifier
    cy.get('.items .item').first().within(() => {
      cy.contains('button', 'Edit').click()
    })
    
    // Vérifier qu'on est sur la page d'édition
    cy.url().should('include', '/sessions/update/')
    
    // Attendre que les détails de la session soient chargés
    cy.wait('@getSessionDetails')
    cy.wait(500) // Attendre que le formulaire soit rempli avec les données existantes
    
    // Modifier les champs du formulaire
    // D'abord effacer les valeurs existantes
    cy.get('input[formControlName=name]').clear()
    cy.get('textarea[formControlName=description]').clear()
    
    // Puis entrer les nouvelles valeurs
    const nouveauNom = 'Session Modifiée ' + new Date().getTime();
    cy.get('input[formControlName=name]').type(nouveauNom)
    cy.get('textarea[formControlName=description]').type('Description mise à jour via test Cypress')
    
    // Mettre à jour la date
    cy.get('input[formControlName=date]').clear()
    cy.get('input[formControlName=date]').type('2025-05-15')
    
    // Soumettre le formulaire
    cy.get('button[type="submit"]').click()
    
    // Vérifier que la requête de mise à jour a été envoyée
    cy.wait('@updateSession')
    
    // Vérifier l'affichage du message de confirmation
    cy.get('.mat-simple-snack-bar-content').should('be.visible')
    cy.get('.mat-simple-snack-bar-content').should('contain', 'Session updated')
    
    // Vérifier qu'on est redirigé vers la liste des sessions
    cy.url().should('include', '/sessions')
    
    // Vérifier que la session modifiée apparaît dans la liste
    cy.contains(nouveauNom).should('be.visible')
  })

  it('Affichage d\'erreur en l\'absence d\'un champ obligatoire lors de la modification', () => {
    // Intercepter les requêtes
    cy.intercept('GET', '/api/session/*').as('getSessionDetails')
    
    // Accéder à la première session pour la modifier
    cy.get('.items .item').first().within(() => {
      cy.contains('button', 'Edit').click()
    })
    
    // Vérifier qu'on est sur la page d'édition
    cy.url().should('include', '/sessions/update/')
    
    // Attendre que les détails de la session soient chargés
    cy.wait('@getSessionDetails')
    cy.wait(500) // Attendre que le formulaire soit rempli avec les données existantes
    
    // Effacer un champ obligatoire (le nom)
    cy.get('input[formControlName=name]').clear()
    
    // Vérifier que le bouton de soumission est désactivé
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Vérifier visuellement que le champ nom est marqué comme invalide
    cy.get('input[formControlName=name]').should('have.class', 'ng-invalid')
    
    // Essayer maintenant avec le champ date
    cy.get('input[formControlName=name]').type('Session avec date manquante')
    cy.get('input[formControlName=date]').clear()
    
    // Vérifier que le bouton de soumission est toujours désactivé
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Vérifier que le champ date est marqué comme invalide
    cy.get('input[formControlName=date]').should('have.class', 'ng-invalid')
    
    // Vérifier qu'on reste sur la page d'édition (pas de redirection)
    cy.url().should('include', '/sessions/update/')
  })
});
