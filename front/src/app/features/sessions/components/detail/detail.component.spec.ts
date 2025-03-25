import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { of } from 'rxjs';
import { Session } from '../../interfaces/session.interface';
import { Teacher } from '../../../../interfaces/teacher.interface';
import { SessionApiService } from '../../services/session-api.service';

import { DetailComponent } from './detail.component';

// Mocks pour les tests d'intégration
class MockRouter {
  navigate = jest.fn();
}

class MockActivatedRoute {
  snapshot = {
    paramMap: convertToParamMap({
      id: '1',
    }),
  };
}

class MockSessionService {
  sessionInformation = {
    admin: true,
    id: 1,
    token: 'fake-token',
    type: 'Bearer',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  };
}

const MOCK_SESSION: Session = {
  id: 1,
  name: 'Test Session',
  description: 'Test Description',
  date: new Date('2025-03-07'),
  teacher_id: 2,
  users: [1, 3], // L'utilisateur courant (id=1) participe déjà
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_TEACHER: Teacher = {
  id: 2,
  lastName: 'Doe',
  firstName: 'John',
  createdAt: new Date(),
  updatedAt: new Date(),
};

class MockSessionApiService {
  detail = jest.fn().mockReturnValue(of(MOCK_SESSION));
  delete = jest.fn().mockReturnValue(of({}));
  participate = jest.fn().mockReturnValue(of(undefined));
  unParticipate = jest.fn().mockReturnValue(of(undefined));
}

class MockTeacherService {
  detail = jest.fn().mockReturnValue(of(MOCK_TEACHER));
}

class MockMatSnackBar {
  open = jest.fn();
}

// ============ Tests unitaires de base ============
describe('DetailComponent - Test Unitaire', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>; 
  let service: SessionService;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule
      ],
      declarations: [DetailComponent], 
      providers: [{ provide: SessionService, useValue: mockSessionService }],
    })
      .compileComponents();
      service = TestBed.inject(SessionService);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// ============ Tests d'intégration ============
describe("DetailComponent - Tests d'intégration", () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  
  // Déclaration des services mockés
  let mockSessionService: MockSessionService;
  let mockSessionApiService: MockSessionApiService;
  let mockTeacherService: MockTeacherService;
  let mockRouter: MockRouter;
  let mockMatSnackBar: MockMatSnackBar;
  
  // Configuration des tests avec les mocks
  beforeEach(async () => {
    // Initialisation des mocks
    mockSessionService = new MockSessionService();
    mockSessionApiService = new MockSessionApiService();
    mockTeacherService = new MockTeacherService();
    mockRouter = new MockRouter();
    mockMatSnackBar = new MockMatSnackBar();
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, // Nécessaire pour FormBuilder
        MatCardModule,      // Nécessaire pour mat-card et ses composants
        MatIconModule,      // Nécessaire pour mat-icon
        MatSnackBarModule   // Pour MatSnackBar
      ],
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: ActivatedRoute, useValue: new MockActivatedRoute() }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });
  
  it('should fetch session and teacher data on init', () => {
    // Act - Initialise le composant, ce qui déclenche ngOnInit et fetchSession
    fixture.detectChanges();
    // Assert - Vérifie que les services ont été appelés et que les données sont correctement assignées
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
    expect(mockTeacherService.detail).toHaveBeenCalledWith('2');
    expect(component.session).toEqual(MOCK_SESSION);
    expect(component.teacher).toEqual(MOCK_TEACHER);
    expect(component.isParticipate).toBe(true); // L'utilisateur (id=1) est dans les participants
  });
  
  it('should delete session and navigate to sessions list', () => {
    // Arrange - Initialise le composant
    fixture.detectChanges();
    // Act - Appelle la méthode delete
    component.delete();
    // Assert - Vérifie que le service a été appelé et que les actions attendues ont été effectuées
    expect(mockSessionApiService.delete).toHaveBeenCalledWith('1');
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });
  
  it('should call participate and refresh data', () => {
    // Arrange - Setup spécial pour ce test : l'utilisateur ne participe pas encore
    const nonParticipatingSession = { ...MOCK_SESSION, users: [3, 4] };
    mockSessionApiService.detail.mockReturnValueOnce(of(nonParticipatingSession));
    mockSessionApiService.detail.mockReturnValueOnce(of(MOCK_SESSION)); // Pour le rafraîchissement
    // Initialise le composant
    fixture.detectChanges();
    expect(component.isParticipate).toBe(false);
    // Act - Appelle la méthode participate
    component.participate();
    // Assert - Vérifie que le service a été appelé et que fetchSession a été appelé à nouveau
    expect(mockSessionApiService.participate).toHaveBeenCalledWith('1', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2);
    expect(component.isParticipate).toBe(true);
  });
  
  it('should call unParticipate and refresh data', () => {
    // Arrange - Initialise le composant (l'utilisateur participe déjà)
    fixture.detectChanges();
    expect(component.isParticipate).toBe(true);
    // Préparation pour fetchSession qui sera rappelé après unParticipate
    const afterUnparticipatingSession = { ...MOCK_SESSION, users: [3] };
    mockSessionApiService.detail.mockReturnValueOnce(of(afterUnparticipatingSession));
    // Act - Appelle la méthode unParticipate
    component.unParticipate();
    // Assert - Vérifie que le service a été appelé et que fetchSession a été appelé à nouveau
    expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2);
    expect(component.isParticipate).toBe(false);
  });
  
  it('should call window.history.back when back method is called', () => {
    // Arrange - Mock pour window.history.back
    const originalBack = window.history.back;
    const mockBack = jest.fn();
    window.history.back = mockBack;
    // Act - Appelle la méthode back
    component.back();
    // Assert - Vérifie que window.history.back a été appelé
    expect(mockBack).toHaveBeenCalled();
    // Restaure la fonction originale
    window.history.back = originalBack;
  });
});

