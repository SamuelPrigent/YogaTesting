import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';
import { SessionService } from './session.service';

// ======== Test unitaire ========
describe('SessionService - Test unitaire', () => {
  // Instance réelle du service testée
  let sessionService: SessionService;

  // Mock de SessionInformation
  const mockSessionInfo: SessionInformation = { 
    token: 'fake-token', 
    type: 'Bearer', 
    id: 1, 
    username: 'testuser', 
    firstName: 'Test', 
    lastName: 'User', 
    admin: false 
  };

  beforeEach(() => {
    // Configuration du module de test
    TestBed.configureTestingModule({
      // On fournit l'instance réelle du service pour les tests unitaires
      providers: [SessionService]
    });
    
    // Injection de l'instance réelle du service (pas un mock)
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(sessionService).toBeTruthy();
  });

  // Test de la méthode logIn
  describe('logIn', () => {
    it('should update session information and set isLogged to true', () => {
      // Arrange - Espionner la méthode privée next (sans modifier son comportement)
      const nextSpy = jest.spyOn<any, any>(sessionService, 'next');
      // Act - Appeler la vraie méthode du service avec des données de test
      sessionService.logIn(mockSessionInfo);
      // Assert - Vérifier le comportement réel du service
      expect(sessionService.sessionInformation).toEqual(mockSessionInfo);
      expect(sessionService.isLogged).toBeTruthy();
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  // Test de la méthode logOut
  describe('logOut', () => {
    it('should clear session information and set isLogged to false', () => {
      // Arrange - Préparer l'état initial
      sessionService.sessionInformation = mockSessionInfo;
      sessionService.isLogged = true;
      const nextSpy = jest.spyOn<any, any>(sessionService, 'next');
      
      // Act - Appeler la vraie méthode du service
      sessionService.logOut();
      
      // Assert - Vérifier le comportement réel
      expect(sessionService.sessionInformation).toBeUndefined();
      expect(sessionService.isLogged).toBeFalsy();
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  // Test de la méthode $isLogged
  describe('$isLogged', () => {
    it('should return observable of isLogged state', () => {
      // Arrange & Act - Obtenir l'observable depuis le vrai service
      const isLoggedObservable = sessionService.$isLogged();
      
      // Assert - Vérifier le comportement réel de l'observable
      isLoggedObservable.subscribe(isLogged => {
        expect(isLogged).toBeFalsy(); // Valeur par défaut
      });
    });

    it('should emit new value when isLogged changes', () => {
      // Arrange - Espionner la méthode next du BehaviorSubject réel
      const spy = jest.spyOn<any, any>(sessionService['isLoggedSubject'], 'next');
      
      // Act - Appeler la vraie méthode avec des données de test
      sessionService.logIn(mockSessionInfo);
      
      // Assert - Vérifier que la méthode next a été appelée avec la bonne valeur
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  // Test de la méthode privée next
  describe('next (private method)', () => {
    it('should call isLoggedSubject.next with current isLogged value', () => {
      // Arrange - Espionner la méthode next du BehaviorSubject réel
      const spy = jest.spyOn<any, any>(sessionService['isLoggedSubject'], 'next');
      
      // Act et Assert - Tester les appels indirects via logIn
      sessionService.isLogged = false;
      sessionService.logIn(mockSessionInfo);
      expect(spy).toHaveBeenCalledWith(true);
      
      // Act et Assert - Tester les appels indirects via logOut
      sessionService.logOut();
      expect(spy).toHaveBeenCalledWith(false);
    });
  });
});
