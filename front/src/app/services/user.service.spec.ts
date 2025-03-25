import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { User } from '../interfaces/user.interface';

import { UserService } from './user.service';

describe('UserService - Test unitaire', () => {
  // Instance du service à tester
  let userService: UserService;
  // Mock pour les requêtes HTTP
  let httpMock: HttpTestingController;

  // Données de test
  const mockUser: User = { 
    id: 1, 
    email: 'john.doe@example.com',
    lastName: 'Doe', 
    firstName: 'John',
    admin: false,
    password: 'hashedPassword123',
    createdAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    // Injecte Services et Mock-HTTP
    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Check si requêtes en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  // Test de la méthode getById
  describe('getById', () => {
    it('should return a user by id', () => {
      // Act - appeler la méthode du service
      userService.getById('1').subscribe(user => {
        // Assert - vérifier les données retournées
        expect(user).toEqual(mockUser);
        expect(user.id).toBe(1);
      });

      // Configurer la réponse mock pour la requête HTTP
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when user not found', () => {
      // Act - appeler la méthode du service
      userService.getById('999').subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert - vérifier l'erreur
          expect(error.status).toBe(404);
        }
      });

      // Configurer la réponse d'erreur pour la requête HTTP
      const req = httpMock.expectOne('api/user/999');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // Test de la méthode delete
  describe('delete', () => {
    it('should delete a user by id', () => {
      // Act - appeler la méthode du service
      userService.delete('1').subscribe(response => {
        // Assert - vérifier la réponse (généralement vide pour une suppression)
        expect(response).toBeDefined();
      });

      // Configurer la réponse mock pour la requête HTTP
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle error when delete fails', () => {
      // Act - appeler la méthode du service
      userService.delete('999').subscribe({
        next: () => fail('should have failed with server error'),
        error: (error) => {
          // Assert - vérifier l'erreur
          expect(error.status).toBe(500);
        }
      });

      // Configurer la réponse d'erreur pour la requête HTTP
      const req = httpMock.expectOne('api/user/999');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
