import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Session } from '../interfaces/session.interface';

import { SessionApiService } from './session-api.service';

describe('SessionsService - test unitaire', () => {
  // Instance du service à tester
  let sessionApiService: SessionApiService;
  // Mock pour les requêtes HTTP
  let httpMock: HttpTestingController;

  // Données de test
  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga débutant',
      description: 'Séance pour débutants',
      date: new Date('2025-04-10'),
      teacher_id: 1,
      users: [1, 2],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Yoga intermédiaire',
      description: 'Séance niveau intermédiaire',
      date: new Date('2025-04-15'),
      teacher_id: 2,
      users: [3],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const mockSession: Session = mockSessions[0];
  const newSession: Session = {
    name: 'Yoga avancé',
    description: 'Séance pour experts',
    date: new Date('2025-04-20'),
    teacher_id: 1,
    users: []
  };
  const updatedSession: Session = {
    ...mockSession,
    name: 'Yoga débutant modifié',
    description: 'Description mise à jour'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });

    // Injecte Services et Mock-HTTP
    sessionApiService = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Check si requêtes en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sessionApiService).toBeTruthy();
  });

  // Test de la méthode all()
  describe('all', () => {
    it('should return all sessions', () => {
      // Act --- (Step 1) Déclenche requête HTTP 
      sessionApiService.all().subscribe(sessions => {
          // Assert --- (Step 4) + prépare callback pour le flush()
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
      });

      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      // --- (Step 3) Déclenche l'exécution du callback en simulant une réponse HTTP avec le mock
      req.flush(mockSessions);
    });

    it('should handle error when fetching all sessions fails', () => {
      // Act --- (Step 1) Déclenche requête HTTP + callback erreur
      sessionApiService.all().subscribe({
        next: () => fail('should have failed with server error'),
        error: (error) => {
          // Assert --- (Step 4) Vérifie l'erreur
          expect(error.status).toBe(500);
        }
      });
      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session');
      // --- (Step 3) Simule erreur HTTP 500 et déclenche callback error
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // Test de la méthode detail()
  describe('detail', () => {
    it('should return a session by id', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      sessionApiService.detail('1').subscribe(session => {
        // Assert --- (Step 4) Vérifie données reçues
        expect(session).toEqual(mockSession);
        expect(session.id).toBe(1);
      });
      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('GET');
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush(mockSession);
    });

    it('should handle error when session not found', () => {
      // Act --- (Step 1) Déclenche requête HTTP + callback erreur
      sessionApiService.detail('999').subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert --- (Step 4) Vérifie l'erreur
          expect(error.status).toBe(404);
        }
      });
      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/999');
      // --- (Step 3) Simule erreur HTTP 404 et déclenche callback
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // Test de la méthode delete()
  describe('delete', () => {
    it('should delete a session by id', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      sessionApiService.delete('1').subscribe(response => {
        // Assert --- (Step 4) Vérifie la réponse
        expect(response).toBeDefined();
      });
      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('DELETE');
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush({});
    });
  });

  // Test de la méthode create()
  describe('create', () => {
    it('should create a new session', () => {
      const createdSession = {...newSession, id: 3, createdAt: new Date(), updatedAt: new Date()};
      
      // Act --- (Step 1) Déclenche requête HTTP avec données
      sessionApiService.create(newSession).subscribe(session => {
        // Assert --- (Step 4) Vérifie la réponse
        expect(session).toEqual(createdSession);
        expect(session.id).toBe(3);
      });

      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession); // Vérifie données envoyées
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush(createdSession);
    });
  });

  // Test de la méthode update()
  describe('update', () => {
    it('should update an existing session', () => {
      // Act --- (Step 1) Déclenche requête HTTP avec données
      sessionApiService.update('1', updatedSession).subscribe(session => {
        // Assert --- (Step 4) Vérifie la réponse
        expect(session).toEqual(updatedSession);
        expect(session.name).toBe('Yoga débutant modifié');
      });

      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSession); // Vérifie données envoyées
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush(updatedSession);
    });
  });

  // Test de la méthode participate()
  describe('participate', () => {
    it('should add a user to a session', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      sessionApiService.participate('1', '5').subscribe(response => {
        // Assert --- (Step 4) Vérifie void
        expect(response).toBeUndefined(); // Méthode retourne void
      });

      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/1/participate/5');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull(); // Vérifie pas de body
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush(null);
    });
  });

  // Test de la méthode unParticipate()
  describe('unParticipate', () => {
    it('should remove a user from a session', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      sessionApiService.unParticipate('1', '2').subscribe(response => {
        // Assert --- (Step 4) Vérifie void
        expect(response).toBeUndefined(); // Méthode retourne void
      });

      // --- (Step 2) Je récupère les req passé à cet URL
      const req = httpMock.expectOne('api/session/1/participate/2');
      expect(req.request.method).toBe('DELETE');
      // --- (Step 3) Simule réponse HTTP et déclenche callback
      req.flush(null);
    });
  });
});
