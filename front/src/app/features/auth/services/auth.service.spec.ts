import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';

import { AuthService } from './auth.service';

// ======== Test unitaire ========
describe('AuthService - Test unitaire', () => {
  // Instance du service à tester
  let authService: AuthService;
  // Mock pour les requêtes HTTP
  let httpMock: HttpTestingController;

  // Données de test
  const mockRegisterRequest: RegisterRequest = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123'
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockSessionInformation: SessionInformation = {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    // Injecte Services et Mock-HTTP
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Check si requêtes en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  // Test de la méthode register()
  describe('register', () => {
    it('should send register request and return void', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      authService.register(mockRegisterRequest).subscribe(response => {
        // Assert --- (Step 4) Vérifie la réponse (après le flush)
        expect(response).toBeUndefined();
      });

      // --- (Step 2) Récupère la requête HTTP envoyée à l'URL
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      // --- (Step 3) Simule une réponse HTTP et déclenche l'exécution du callback
      req.flush(null); // Simuler une réponse vide (void)
    });

    it('should handle registration error', () => {
      // Arrange - Préparer un message d'erreur pour le test
      const errorMessage = { message: 'Email already exists' };
      
      // Act --- (Step 1) Déclenche requête HTTP + callback erreur
      authService.register(mockRegisterRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          // Assert --- (Step 4) Vérifie l'erreur (après le flush)
          expect(error.status).toBe(400);
          expect(error.error).toEqual(errorMessage);
        }
      });

      // --- (Step 2) Récupère la requête HTTP envoyée à l'URL
      const req = httpMock.expectOne('api/auth/register');
      // --- (Step 3) Simule une erreur HTTP et déclenche callback error
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  // Test de la méthode login()
  describe('login', () => {
    it('should send login request and return session information', () => {
      // Act --- (Step 1) Déclenche requête HTTP
      authService.login(mockLoginRequest).subscribe(response => {
        // Assert --- (Step 4) Vérifie la réponse (après le flush)
        expect(response).toEqual(mockSessionInformation);
      });

      // --- (Step 2) Récupère la requête HTTP envoyée à l'URL
      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      // --- (Step 3) Simule une réponse HTTP et déclenche le callback
      req.flush(mockSessionInformation);
    });

    it('should handle login error with invalid credentials', () => {
      // Arrange - Préparer un message d'erreur pour le test
      const errorMessage = { message: 'Invalid credentials' };
      
      // Act --- (Step 1) Déclenche requête HTTP + callback erreur
      authService.login(mockLoginRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          // Assert --- (Step 4) Vérifie l'erreur (après le flush)
          expect(error.status).toBe(401);
          expect(error.error).toEqual(errorMessage);
        }
      });

      // --- (Step 2) Récupère la requête HTTP envoyée à l'URL
      const req = httpMock.expectOne('api/auth/login');
      // --- (Step 3) Simule une erreur HTTP et déclenche callback error
      req.flush(errorMessage, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
