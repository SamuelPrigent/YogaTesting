import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { of, NEVER } from 'rxjs';
import { Session } from '../../interfaces/session.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

import { FormComponent } from './form.component';

// Type guard pour vérifier la conformité d'un objet avec l'interface Session
function isSession(obj: any): obj is Session {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    // Date peut être string en entrée de formulaire mais doit être compatible avec Date
    (typeof obj.date === 'string' || obj.date instanceof Date) &&
    typeof obj.teacher_id === 'number' &&
    // users[] est optionnel dans le formulaire car il est géré séparément
    (!('users' in obj) || Array.isArray(obj.users))
  );
}

// Mocks complets pour éviter les avertissements et uniformiser l'approche
class MockRouter {
  url = '/sessions/create';
  navigate = jest.fn();
}

// Mock du SessionService
class MockSessionService {
  sessionInformation: SessionInformation = {
    admin: true,
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
  };
}

// Données de test réutilisables
const MOCK_SESSION: Session = {
  id: 1,
  name: 'Test Session',
  description: 'Test Description',
  date: new Date('2025-03-07'),
  teacher_id: 1,
  users: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock du SessionApiService
class MockSessionApiService {
  create = jest.fn().mockReturnValue(of(MOCK_SESSION));
  update = jest.fn().mockReturnValue(of(MOCK_SESSION));
  detail = jest.fn().mockReturnValue(of(MOCK_SESSION));
}

// Données de test pour les professeurs
const MOCK_TEACHERS = [
  {
    id: 1,
    lastName: 'Doe',
    firstName: 'John',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    lastName: 'Smith',
    firstName: 'Jane',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock du TeacherService
class MockTeacherService {
  all = jest.fn().mockReturnValue(of(MOCK_TEACHERS));
}

// Mock du MatSnackBar
class MockMatSnackBar {
  open = jest.fn();
}

// Mock Activated Route
class MockActivatedRoute {
  snapshot = {
    paramMap: convertToParamMap({
      id: '1',
    }),
  };
}

// ============ Test unitaire ============
describe('FormComponent - Test unitaires', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let sessionApiService: SessionApiService;
  let teacherService: TeacherService;
  let matSnackBar: MatSnackBar;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: SessionService, useClass: MockSessionService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: SessionApiService, useClass: MockSessionApiService },
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: MatSnackBar, useClass: MockMatSnackBar },
      ],
      declarations: [FormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    sessionApiService = TestBed.inject(SessionApiService);
    teacherService = TestBed.inject(TeacherService);
    matSnackBar = TestBed.inject(MatSnackBar);
    sessionService = TestBed.inject(SessionService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      (sessionService as MockSessionService).sessionInformation = {
        admin: true,
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };
    });

    it('should redirect to /sessions when "!admin" condition is true (L34)', () => {
      // Arrange - set admin to false
      (sessionService as MockSessionService).sessionInformation = {
        admin: false,
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      };
      // Act - init
      component.ngOnInit();
      // Assert -
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should initialize form for create mode', () => {
      // Arrange - set proper URL
      Object.defineProperty(router, 'url', { value: '/sessions/create' });
      // Act - detect url
      fixture.detectChanges();
      // Assert
      expect(component.onUpdate).toBeFalsy(); // form set to create
      expect(component.sessionForm).toBeDefined(); // nécessaire
    });

    it('should initialize form with session data for update mode', () => {
      // Arrange --- set url
      Object.defineProperty(router, 'url', { value: '/sessions/update/1' });
      // Act
      fixture.detectChanges();
      // Assert
      expect(component.onUpdate).toBeTruthy(); // --- set to update
      expect(sessionApiService.detail).toHaveBeenCalledWith('1'); // --- récup les info du post avec le bon id
      // --- check value des champs
      expect(component.sessionForm?.get('name')?.value).toBe(MOCK_SESSION.name);
      expect(component.sessionForm?.get('date')?.value).toBe(
        MOCK_SESSION.date.toISOString().split('T')[0]
      );
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(
        MOCK_SESSION.teacher_id
      );
      expect(component.sessionForm?.get('description')?.value).toBe(
        MOCK_SESSION.description
      );
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.sessionForm?.setValue({
        name: 'Test Session',
        date: new Date('2025-03-07').toISOString().split('T')[0],
        teacher_id: 1,
        description: 'Test Description',
      });
    });

    it('should call create when onUpdate is false', () => {
      // Arrange --- mode création ?
      component.onUpdate = false;
      // Act --- submit
      component.submit();
      // Assert
      // --- create appelé
      expect(sessionApiService.create).toHaveBeenCalled();
      // --- message de confirmation 'Session created !'
      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Session created !',
        'Close',
        { duration: 3000 }
      );
      // --- retour page d'accueil (sessions)
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should call update when onUpdate is true', () => {
      // Arrange
      component.onUpdate = true;
      (component as any).id = 1;
      // Act - submit
      component.submit();
      // Assert
      // --- Call methode update
      expect(sessionApiService.update).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
      // --- Toast de confirmation
      expect(matSnackBar.open).toHaveBeenCalledWith(
        'Session updated !',
        'Close',
        { duration: 3000 }
      );
      // --- Redirection
      expect(router.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('Should convert data to the type : Session', () => {
      // Arrange - pour vérifier les données transmises
      const sessionApiServiceSpy = jest.spyOn(sessionApiService, 'create');
      component.sessionForm?.setValue({
        name: 'Test Session',
        date: '2025-03-08', // Chaîne de caractères (format ISO)
        teacher_id: 42,
        description: 'Test Description'
      });
      // Act - Soumettre le formulaire
      component.submit();
      // Assert - Vérifier que les données sont correctement castées au type Session
      expect(sessionApiServiceSpy).toHaveBeenCalled();
      const passedObject = sessionApiServiceSpy.mock.calls[0][0]; // L'objet qui a été passé au service
      expect(isSession(passedObject)).toBe(true); // est de type session
      // valeurs correctes
      expect(passedObject).toEqual({
        name: 'Test Session',
        date: '2025-03-08',
        teacher_id: 42,
        description: 'Test Description'
      });
    });

    it('Should manage an undefined : sessionForm?.value', () => {
      // Arrange
      component.sessionForm = undefined;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const createSpy = jest.spyOn(sessionApiService, 'create')
                           .mockImplementation((session) => {
        // --- Observable (qui ne se termine jamais) si undefined est passé
        if (session === undefined) {
          return NEVER; 
        }
        // --- Observable normal
        return of({} as Session);
      });
      // --- Reset compteur
      jest.clearAllMocks(); 
      // Act --- submit() with undefined
      component.submit();
      // Assert --- Check si create est call with 'undefined' sans err
      expect(sessionApiService.create).toHaveBeenCalledWith(undefined);
      // La navigation ne devrait pas être déclenchée car l'Observable ne se termine jamais
      expect(router.navigate).not.toHaveBeenCalled();
      // Nettoyage
      consoleSpy.mockRestore();
      createSpy.mockRestore();
    });
  });
});

// ============ Test d'intégrations ============

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe("FormComponent - Tests d'intégration", () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  
  // Déclaration des mocks comme variables au niveau du describe
  let teacherServiceMock: any;
  let sessionApiServiceMock: any;
  let routerMock: any;
  let matSnackBarMock: any;
  let sessionServiceMock: any;

  beforeEach(async () => {
    // Initialiser les mocks avec la logique nécessaire
    teacherServiceMock = {
      all: jest.fn().mockReturnValue(of(MOCK_TEACHERS))
    };
    
    sessionApiServiceMock = {
      create: jest.fn().mockReturnValue(of(MOCK_SESSION)),
      update: jest.fn().mockReturnValue(of(MOCK_SESSION)),
      detail: jest.fn().mockReturnValue(of(MOCK_SESSION))
    };
    
    matSnackBarMock = {
      open: jest.fn()
    };
    
    routerMock = {
      navigate: jest.fn(),
      url: '/sessions/create'
    };
    
    sessionServiceMock = {
      sessionInformation: {
        admin: true,
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'sessions', redirectTo: '' }]),
        HttpClientTestingModule, // Pour simuler les requêtes HTTP si nécessaire
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule,
      ],
      providers: [
        // Fournir les mocks directement comme valeurs
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: MatSnackBar, useValue: matSnackBarMock },
        { provide: Router, useValue: routerMock }
      ],
      declarations: [FormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
  });
  
  // Plus besoin de httpMock.verify() car nous n'utilisons pas de requêtes réelles mais des mocks

  it('should load teachers when component is initialized', () => {
    // Déclencher l'initialisation du composant
    fixture.detectChanges();

    // Vérifier que la méthode all() du TeacherService a été appelée
    expect(teacherServiceMock.all).toHaveBeenCalled();

    // Vérifier que les enseignants sont disponibles dans le composant
    component.teachers$.subscribe((teachers) => {
      expect(teachers).toEqual(MOCK_TEACHERS);
      expect(teachers.length).toBe(2);
    });
  });

  it('should load session data and populate form when in update mode', () => {
    // Simuler l'URL de mise à jour
    routerMock.url = '/sessions/update/1';

    // Initialiser le composant
    fixture.detectChanges();
    
    // Vérifier que detail a été appelé avec le bon ID
    expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');

    // Vérifier que le formulaire est correctement pré-rempli
    // (le mock SessionApiService renverra automatiquement MOCK_SESSION)
    expect(component.sessionForm?.get('name')?.value).toBe(MOCK_SESSION.name);
    expect(component.sessionForm?.get('description')?.value).toBe(
      MOCK_SESSION.description
    );

    // Vérifier que les données apparaissent dans le DOM
    const nameInput = fixture.debugElement.query(
      By.css('input[formControlName="name"]')
    );
    expect((nameInput.nativeElement as HTMLInputElement).value).toBe(
      MOCK_SESSION.name
    );
  });

  it('should send form data to API and redirect on submit', () => {
    // Initialiser le composant en mode création
    routerMock.url = '/sessions/create';
    
    // Réinitialiser les compteurs d'appels
    sessionApiServiceMock.create.mockClear();
    routerMock.navigate.mockClear();

    // Déclencher l'initialisation
    fixture.detectChanges();

    // Remplir le formulaire
    component.sessionForm?.setValue({
      name: 'New Test Session',
      date: new Date('2025-04-15').toISOString().split('T')[0],
      teacher_id: 2,
      description: 'Integration Test Description',
    });

    // Déclencher directement la soumission du formulaire
    component.submit();

    // Vérifier que create a été appelé avec les bonnes données
    expect(sessionApiServiceMock.create).toHaveBeenCalledWith({
      name: 'New Test Session',
      date: expect.any(String),
      teacher_id: 2,
      description: 'Integration Test Description',
    });

    // Vérifier la redirection
    expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should validate form fields properly', () => {
    // Initialiser le composant
    fixture.detectChanges();

    // Remplir le formulaire avec des données valides
    component.sessionForm?.setValue({
      name: 'Valid Session Name',
      date: new Date().toISOString().split('T')[0],
      teacher_id: 1,
      description: 'Valid Description',
    });

    // Vérifier que le formulaire est valide
    expect(component.sessionForm?.valid).toBeTruthy();

    // Modifier pour avoir un nom vide (invalide)
    component.sessionForm?.patchValue({ name: '' });

    // Vérifier que le formulaire est maintenant invalide
    expect(component.sessionForm?.valid).toBeFalsy();
    expect(component.sessionForm?.get('name')?.valid).toBeFalsy();
  });

  it('Should convert data to the type : Session and send it to API', () => {
    // Initialiser le composant en mode création
    routerMock.url = '/sessions/create';
    
    // Réinitialiser le mock pour ce test spécifique
    sessionApiServiceMock.create.mockClear();
    
    // Initialiser
    fixture.detectChanges();
    
    // Utiliser différents types de données dans le formulaire
    const testDate = new Date('2025-03-08').toISOString().split('T')[0];
    component.sessionForm?.setValue({
      name: 'Type Test Session',
      date: testDate,           // String (représentation ISO de date)
      teacher_id: 123,          // Number
      description: 'Testing data types and conversion'
    });
    
    // Soumettre
    component.submit();
    
    // Capturer l'objet transmis à l'API
    expect(sessionApiServiceMock.create).toHaveBeenCalled();
    const passedData = sessionApiServiceMock.create.mock.calls[0][0];
    // Vérifier qu'il s'agit bien d'un objet de type Session (via notre type guard)
    expect(isSession(passedData)).toBe(true);
    // Vérifier que les valeurs sont correctes
    expect(passedData).toEqual({
      name: 'Type Test Session',
      date: testDate,
      teacher_id: 123,
      description: 'Testing data types and conversion'
    });
    // Vérifier en plus que les valeurs sont du bon type primitif JavaScript
    expect(typeof passedData.name).toBe('string');
    expect(typeof passedData.date).toBe('string');
    expect(typeof passedData.teacher_id).toBe('number');
    expect(typeof passedData.description).toBe('string');
  });
});
