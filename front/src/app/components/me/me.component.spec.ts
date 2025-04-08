import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';

import { MeComponent } from './me.component';

// Mocks communs pour les tests unitaires et d'intégration
class MockRouter {
  navigate = jest.fn().mockImplementation(() => Promise.resolve(true));
}

class MockMatSnackBar {
  open = jest.fn();
}

class MockSessionService {
  sessionInformation = {
    admin: true,
    id: 1,
  };
  logOut = jest.fn();
}

// ======== Test unitaire ========
describe('MeComponent - Tests unitaires', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userService: UserService;
  let sessionService: SessionService;
  let snackBar: MatSnackBar;
  let router: Router;

  // Mock du UserService (uniquement pour les tests unitaires)
  class MockUserService {
    getById = jest.fn();
    delete = jest.fn();
  }

  // Spy sur window.history.back
  let historyBackSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Spy sur window.history.back
    historyBackSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});

    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        HttpClientTestingModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: SessionService, useClass: MockSessionService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    sessionService = TestBed.inject(SessionService);
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
    historyBackSpy.mockRestore();
  });

  it('should create', () => {
    // Réinitialiser avant le test pour éviter les appels d'autres tests
    (userService as any).getById.mockReset();
    (userService as any).getById.mockReturnValue(of({}));

    fixture.detectChanges(); // Déclenche ngOnInit
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call userService.getById with the current user id', () => {
      // Arrange
      const mockUser: User = {
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false,
        password: 'password123',
        createdAt: new Date(),
      };
      (userService as any).getById.mockReturnValue(of(mockUser));
      // Act
      fixture.detectChanges(); // Déclenche ngOnInit
      // Assert
      expect(userService.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(mockUser);
    });
  });

  describe('back method', () => {
    it('should call window.history.back', () => {
      // Act
      component.back();
      // Assert
      expect(historyBackSpy).toHaveBeenCalled();
    });
  });

  describe('delete method', () => {
    it('should call userService.delete with current user id', () => {
      // Arrange
      (userService as any).delete.mockReturnValue(of(undefined));
      // Act
      component.delete();
      // Assert
      expect(userService.delete).toHaveBeenCalledWith('1');
    });

    it('should display snackbar, log out and navigate to home on successful deletion', () => {
      // Arrange
      (userService as any).delete.mockReturnValue(of(undefined));
      // Act
      component.delete();
      // Assert
      expect(snackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(sessionService.logOut).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not log out or navigate if deletion fails', () => {
      // Arrange
      (userService as any).delete.mockReturnValue(
        throwError(() => new Error('Failed to delete'))
      );
      // Act
      component.delete();
      // Assert
      expect(sessionService.logOut).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});

// ======== Test d'intégration ========
describe("MeComponent - Tests d'intégration", () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  // Service réel pour l'intégration
  let userService: UserService;

  // Mocks
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let snackBar: MatSnackBar;
  let router: Router;

  // Spy sur window.history.back
  let historyBackSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Spy sur window.history.back
    historyBackSpy = jest
      .spyOn(window.history, 'back')
      .mockImplementation(() => {});

    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      providers: [
        { provide: SessionService, useClass: MockSessionService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
        { provide: Router, useClass: MockRouter },
      ],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService); // Injection explicite du vrai UserService
    sessionService = TestBed.inject(SessionService);
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
    historyBackSpy.mockRestore();
  });

  describe('ngOnInit', () => {
    it('should fetch user data on initialization', () => {
      // Arrange - Définir l'utilisateur mock
      const mockUser: User = {
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false,
        password: 'password123',
        createdAt: new Date(),
      };
      // Act - Déclencher ngOnInit
      fixture.detectChanges();
      // Intercepter la requête HTTP
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      // Simuler une réponse du serveur
      req.flush(mockUser);
      // Assert - Vérifier que les données utilisateur sont mises à jour
      expect(component.user).toEqual(mockUser);
    });
  });

  describe('delete method', () => {
    it('should delete user account and handle successful response', () => {
      // Arrange - S'assurer que le composant est initialisé
      fixture.detectChanges();
      httpMock.expectOne('api/user/1').flush({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false,
        password: 'password123',
        createdAt: new Date().toISOString(),
      });
      // Act - Appeler la méthode delete
      component.delete();
      // Intercepter la requête DELETE
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      // Simuler une réponse positive du serveur
      req.flush(null);
      // Assert - Vérifier les interactions après réponse
      expect(snackBar.open).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(sessionService.logOut).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when deleting account fails', () => {
      // Arrange - S'assurer que le composant est initialisé
      fixture.detectChanges();
      httpMock.expectOne('api/user/1').flush({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false,
        password: 'password123',
        createdAt: new Date().toISOString(),
      });
      // Espionner console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      // Act - Appeler la méthode delete
      component.delete();
      // Intercepter la requête DELETE
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      // Simuler une erreur du serveur
      req.error(new ProgressEvent('Network error'));
      // Assert - Vérifier qu'aucune action de succès n'est effectuée
      expect(sessionService.logOut).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      // Nettoyer le spy
      consoleErrorSpy.mockRestore();
    });
  });

  describe('back method', () => {
    it('should navigate back in browser history', () => {
      // Act
      component.back();
      // Assert
      expect(historyBackSpy).toHaveBeenCalled();
    });
  });
});
