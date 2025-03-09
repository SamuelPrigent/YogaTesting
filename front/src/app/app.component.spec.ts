import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { expect } from '@jest/globals';

import { AuthService } from './features/auth/services/auth.service';
import { SessionService } from './services/session.service';
import { AppComponent } from './app.component';

// Mocks communs pour les tests unitaires et d'intégration
class MockRouter {
  navigate = jest.fn().mockImplementation(() => Promise.resolve(true));
}

class MockSessionService {
  isLogged = false;
  sessionInformation = undefined;
  $isLogged = jest.fn().mockReturnValue(of(false));
  logOut = jest.fn();
}

// ======== Test unitaire ========
describe('AppComponent - Tests unitaires', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

  // Mock du AuthService (uniquement pour les tests unitaires)
  class MockAuthService {
    login = jest.fn();
    register = jest.fn();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatToolbarModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: SessionService, useClass: MockSessionService },
        { provide: Router, useClass: MockRouter }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('$isLogged method', () => {
    it('should call sessionService.$isLogged', () => {
      // Act
      component.$isLogged();
      // Assert
      expect(sessionService.$isLogged).toHaveBeenCalled();
    });

    it('should return the observable from sessionService.$isLogged', () => {
      // Arrange
      const mockObservable = of(true);
      (sessionService.$isLogged as jest.Mock).mockReturnValue(mockObservable);
      // Act
      const result = component.$isLogged();
      // Assert
      expect(result).toBe(mockObservable);
    });
  });

  describe('logout method', () => {
    it('should call sessionService.logOut', () => {
      // Act
      component.logout();
      // Assert
      expect(sessionService.logOut).toHaveBeenCalled();
    });

    it('should navigate to home page after logout', () => {
      // Act
      component.logout();
      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });
});

// ======== Test d'intégration ========
describe("AppComponent - Tests d'intégration", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  // Service réel pour l'intégration
  let authService: AuthService;

  // Mocks
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatToolbarModule
      ],
      providers: [
        { provide: SessionService, useClass: MockSessionService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isLogged observable', () => {
    it('should subscribe to session service isLogged subject', (done) => {
      // Arrange - Modifier la valeur du mock pour renvoyer true
      (sessionService.$isLogged as jest.Mock).mockReturnValue(of(true));
      
      // Act - S'abonner à l'observable
      component.$isLogged().subscribe(isLogged => {
        // Assert - Vérifier que la valeur reçue est celle attendue
        expect(isLogged).toBe(true);
        done();
      });
    });
  });
  
  describe('logout method', () => {
    it('should log out and navigate to home', () => {
      // Act - Appeler logout
      component.logout();
      
      // Assert - Vérifier les interactions
      expect(sessionService.logOut).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });
});
