import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

// Mocks communs pour les tests unitaires et d'intégration
class MockRouter {
  navigate = jest.fn().mockImplementation(() => Promise.resolve(true));
}

// ======== Test unitaire ========
describe('RegisterComponent - Test unitaire', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  // Mock du AuthService (uniquement pour les tests unitaires)
  class MockAuthService {
    register = jest.fn();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,  
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 1: Validation du formulaire
  describe('Form validation', () => {
    it('should mark form as invalid when empty', () => {
      // Assert - form is not valid
      expect(component.form.valid).toBeFalsy();
    });

    it('should validate email format', () => {
      // Arrange
      const emailControl = component.form.get('email');
      // Act
      emailControl?.setValue('invalid-email');
      // Assert - email is not valid
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeTruthy();
      // Act
      emailControl?.setValue('valid@email.com');
      // Assert - email is valid
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should require firstName and lastName', () => {
      // Arrange
      const firstNameControl = component.form.get('firstName');
      const lastNameControl = component.form.get('lastName');
      // Assert - required fields
      expect(firstNameControl?.valid).toBeFalsy();
      expect(lastNameControl?.valid).toBeFalsy();
      expect(firstNameControl?.hasError('required')).toBeTruthy();
      expect(lastNameControl?.hasError('required')).toBeTruthy();
      // Act
      firstNameControl?.setValue('John');
      lastNameControl?.setValue('Doe');
      // Assert - valid after setting values
      expect(firstNameControl?.valid).toBeTruthy();
      expect(lastNameControl?.valid).toBeTruthy();
    });

    it('should require password', () => {
      // Arrange
      const passwordControl = component.form.get('password');
      // Assert - not valid
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
      // Act
      passwordControl?.setValue('password123');
      // Assert - is valid
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      // Arrange 
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Act : automatic validation by angular
      // Assert - form is valid
      expect(component.form.valid).toBeTruthy();
    });
  });

  // Test 2: Méthode submit()
  describe('submit method', () => {
    beforeEach(() => {
      // Réinitialiser tous les mocks avant chaque test
      jest.clearAllMocks();
      // Réinitialiser explicitement les mocks
      (authService as any).register.mockReset();
      (router as any).navigate.mockReset();
    });
    
    it('should call authService.register with form values', () => {
      // Arrange - mock la réponse du register
      (authService as any).register.mockReturnValue(of(undefined));
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Act
      component.submit();
      // Assert
      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
    });
    it('should navigate to /login on successful registration', () => {
      // Arrange
      (authService as any).register.mockReturnValue(of(undefined));
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Act
      component.submit();
      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set onError to true when registration fails', () => {
      // Arrange
      (authService as any).register.mockReturnValue(throwError(() => new Error('Registration failed')));
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Vérifier que le mock router est bien réinitialisé
      expect(router.navigate).not.toHaveBeenCalled();
      // Act
      component.submit();
      // Assert
      expect(component.onError).toBeTruthy();
      // Vérifier que la navigation n'a pas été déclenchée en cas d'erreur
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});

// ======== Test d'intégration ========
// Import nécessaire uniquement pour les tests d'intégration
import { HttpTestingController } from '@angular/common/http/testing';

describe("RegisterComponent - Tests d'intégration", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  
  // Service réel pour l'intégration
  let authService: AuthService;
  // Mocks (uniquement pour le Router)
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        // On utilise le vrai AuthService mais on mock le Router
        { provide: Router, useClass: MockRouter }
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule, 
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService); // Injection explicite du vrai AuthService
    router = TestBed.inject(Router); // Injection du Router mock
  });

  afterEach(() => {
    httpMock.verify(); // Check si pas de requêtes HTTP en attente
    jest.clearAllMocks(); // Réinitialise les spyOn
  });

  // Test principal: Méthode submit() avec HttpTestingController et service réel
  describe('submit method with HTTP mock', () => {
    it('should send register request to API and handle successful response', () => {
      // Initialiser le composant
      fixture.detectChanges();
      // Arrange - préparer les données de formulaire
      component.form.setValue({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Espionner la méthode register de l'AuthService réel pour vérifier son appel
      const authServiceSpy = jest.spyOn(authService, 'register');
      // Act - Soumettre le formulaire
      component.submit();
      // Assert - Vérifier que le vrai AuthService a été appelé avec les bons paramètres
      expect(authServiceSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Intercepter et vérifier la requête HTTP générée par le vrai AuthService
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      // Simuler une réponse positive du serveur
      req.flush(null); // L'API retourne normalement void, mais on utilise null pour le mock
      // Vérifier les interactions après réponse asynchrone
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBeFalsy();
    });

    it('should handle API error correctly', () => {
      // Initialiser le composant
      fixture.detectChanges();
      
      // Arrange - préparer les données de formulaire
      component.form.setValue({
        email: 'existing@example.com', // Email qui existe déjà
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });
      
      // Espionner la méthode register de l'AuthService réel
      const authServiceSpy = jest.spyOn(authService, 'register');
      // Act - Soumettre le formulaire
      component.submit();
      // Assert - Vérifier que le vrai AuthService a été appelé
      expect(authServiceSpy).toHaveBeenCalled();
      // Intercepter et vérifier la requête HTTP générée par le vrai AuthService
      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      // Simuler une erreur du serveur
      req.error(new ProgressEvent('Network error'));
      // Vérifier que onError est défini sur true après réponse asynchrone
      expect(component.onError).toBeTruthy();
      // Pas de navigation
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle conflict error when email already exists', () => {
      // Initialiser le composant
      fixture.detectChanges();
      
      // Arrange - préparer les données de formulaire
      component.form.setValue({
        email: 'existing@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      });

      // Act - Soumettre le formulaire
      component.submit();
      // Intercepter la requête HTTP
      const req = httpMock.expectOne('api/auth/register');
      // Simuler une erreur 409 Conflict
      req.flush(
        { message: 'Email already exists' },
        { status: 409, statusText: 'Conflict' }
      );
      // Vérifier que onError est défini sur true après réponse asynchrone
      expect(component.onError).toBeTruthy();
    });
  });

  describe('form validation with proper error messages', () => {
    it('should show validation errors when form is invalid', () => {
      // Initialiser le composant
      fixture.detectChanges();
      
      // Arrange - préparer des données invalides
      component.form.setValue({
        email: 'invalid-email',
        firstName: 'T',
        lastName: 'U',
        password: 'pwd'
      });

      // Act - forcer la validation
      component.form.markAllAsTouched();
      fixture.detectChanges();
      // Assert - Vérifier les états d'invalidité
      expect(component.form.get('email')?.invalid).toBeTruthy();
      expect(component.form.get('firstName')?.valid).toBeTruthy(); 
      expect(component.form.get('lastName')?.valid).toBeTruthy(); 
      expect(component.form.get('password')?.valid).toBeTruthy();
    });
  });
});
