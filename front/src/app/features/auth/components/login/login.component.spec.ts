import { HttpClientModule } from '@angular/common/http';
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
import { SessionService } from 'src/app/services/session.service';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

// Mocks complets pour éviter les avertissements et uniformiser l'approche
class MockRouter {
  navigate = jest.fn().mockImplementation(() => Promise.resolve(true));
}

// Mock du SessionService
class MockSessionService {
  isLogged = false;
  sessionInformation = undefined;
  logIn = jest.fn();
  logOut = jest.fn();
  $isLogged = jest.fn().mockReturnValue(of(false));
}

// Mock du AuthService
class MockAuthService {
  login = jest.fn();
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        {
          provide: SessionService,
          useClass: MockSessionService // Mock du SessionService
        },
        {
          provide: AuthService,
          useClass: MockAuthService // Mock du service Auth
        },
        {
          provide: Router,
          useClass: MockRouter // Utilisation de useClass pour le Router aussi
        }
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent); // création du composant
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
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

    it('should require password', () => {
      // Arrange
      const passwordControl = component.form.get('password');
      // Assert - not valid
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
      // Act
      passwordControl?.setValue('test-password!99');
      // Assert - is valid
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should mark form as valid when all fields are correctly filled', () => {
      // Arrange 
      component.form.setValue({
        email: 'test@test.com',
        password: 'test-password!99'
      });
      // Act : automatic validation by angular
      // Assert - form is valid
      expect(component.form.valid).toBeTruthy();
    });
  });

  // Test 2: Méthode submit()
  describe('submit method', () => {
    it('authService.login should have been called with form values', () => {
    // Arrange - mock la réponse du login
      jest.spyOn(authService, 'login').mockReturnValue(of({ token: 'fake-token', type: 'Bearer', id: 1, username: 'testuser', firstName: 'Test', lastName: 'User', admin: false }));
      component.form.setValue({
        email: 'test@test.com',
        password: 'test-password!99'
      });
      // Act
      component.submit();
      // Assert
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'test-password!99'
      });
    });

    it('should set onError to true when login fails', () => {
      // Arrange
      jest.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Login failed')));
      component.form.setValue({
        email: 'test@test.com',
        password: 'test-password!99'
      });
      // Act
      component.submit();
      // Assert
      expect(component.onError).toBeTruthy();
    });
  });

  // Test 3: Interaction avec les services
  describe('service interactions', () => {
    it('should call sessionService.logIn and navigate to /sessions on successful login', () => {  
    // Arrange
    const sessionInfo = { token: 'fake-token', type: 'Bearer', id: 1, username: 'testuser', firstName: 'Test', lastName: 'User', admin: false };
    jest.spyOn(authService, 'login').mockReturnValue(of(sessionInfo));
      component.form.setValue({
        email: 'test@test.com',
        password: 'test-password!99'
      });
      // Act
      component.submit();
      // Assert - session est bien call avec la bonne value
      expect(sessionService.logIn).toHaveBeenCalledWith(sessionInfo);
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });
  });

  // Test 4: Interface utilisateur
  describe('user interface', () => {
    it('should toggle password visibility when hide property changes', () => {
      // Arrange & Assert initial state
      expect(component.hide).toBeTruthy();
      // Act - toogle hide
      component.hide = !component.hide;
      // Assert
      expect(component.hide).toBeFalsy();
    });
  });
});
