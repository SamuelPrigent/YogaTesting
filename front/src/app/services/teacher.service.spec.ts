import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { Teacher } from '../interfaces/teacher.interface';

import { TeacherService } from './teacher.service';

// ======== Test unitaire ========
describe('TeacherService - Test unitaire', () => {
  // Instance du service à tester
  let teacherService: TeacherService;
  // Mock pour les requêtes HTTP
  let httpMock: HttpTestingController;

  // Données de test
  const mockTeachers: Teacher[] = [
    { 
      id: 1, 
      lastName: 'Doe', 
      firstName: 'John', 
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 2, 
      lastName: 'Smith', 
      firstName: 'Jane', 
      createdAt: new Date(), 
      updatedAt: new Date()
    }
  ];

  const mockTeacher: Teacher = mockTeachers[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });

    // Injecte Services et Mock-HTTP
    teacherService = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Check si requêtes en attente
    httpMock.verify();
  });

  it('should be created', () => {
    expect(teacherService).toBeTruthy();
  });

  // Test de la méthode all()
  describe('all', () => {
    it('should return all teachers', () => {
      // Act - appeler la méthode du service
      teacherService.all().subscribe(teachers => {
        // Assert - vérifier les données retournées
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
      });

      // Configurer la réponse mock pour la requête HTTP
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });
  });

  // Test de la méthode detail()
  describe('detail', () => {
    it('should return a teacher by id', () => {
      // Arrange - ID du teacher à récupérer
      const teacherId = '1';
      
      // Act - appeler la méthode du service
      teacherService.detail(teacherId).subscribe(teacher => {
        // Assert - vérifier les données retournées
        expect(teacher).toEqual(mockTeacher);
      });

      // Configurer la réponse mock pour la requête HTTP
      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should handle error when teacher not found', () => {
      // Arrange - ID d'un teacher inexistant
      const nonExistentId = '999';
      
      // Act - appeler la méthode du service
      const subscription = teacherService.detail(nonExistentId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          // Assert - vérifier l'erreur
          expect(error.status).toBe(404);
        }
      });

      // Configurer la réponse d'erreur pour la requête HTTP
      const req = httpMock.expectOne(`api/teacher/${nonExistentId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
