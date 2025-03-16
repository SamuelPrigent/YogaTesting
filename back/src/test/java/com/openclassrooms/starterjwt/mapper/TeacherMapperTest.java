package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests pour TeacherMapper (unitaires et d'intégration)
 */
public class TeacherMapperTest {

    // ======= Tests Unitaires =======
    @Nested
    @SpringBootTest
    class UnitTests {
        @Autowired
        private TeacherMapper teacherMapper;
    
    @Test
    @DisplayName("Doit convertir un Teacher en TeacherDto")
    void shouldMapEntityToDto() {
        // Préparation
        LocalDateTime now = LocalDateTime.now();
        Teacher teacher = new Teacher();
        teacher.setId(1L);
        teacher.setFirstName("Jean");
        teacher.setLastName("Dupont");
        teacher.setCreatedAt(now);
        teacher.setUpdatedAt(now);
        
        // Exécution
        TeacherDto dto = teacherMapper.toDto(teacher);
        
        // Vérification
        assertNotNull(dto);
        assertEquals(teacher.getId(), dto.getId());
        assertEquals(teacher.getFirstName(), dto.getFirstName());
        assertEquals(teacher.getLastName(), dto.getLastName());
        assertEquals(teacher.getCreatedAt(), dto.getCreatedAt());
        assertEquals(teacher.getUpdatedAt(), dto.getUpdatedAt());
    }
    
    @Test
    @DisplayName("Doit convertir un TeacherDto en Teacher")
    void shouldMapDtoToEntity() {
        // Préparation
        LocalDateTime now = LocalDateTime.now();
        TeacherDto dto = new TeacherDto();
        dto.setId(1L);
        dto.setFirstName("Jean");
        dto.setLastName("Dupont");
        dto.setCreatedAt(now);
        dto.setUpdatedAt(now);
        
        // Exécution
        Teacher entity = teacherMapper.toEntity(dto);
        
        // Vérification
        assertNotNull(entity);
        assertEquals(dto.getId(), entity.getId());
        assertEquals(dto.getFirstName(), entity.getFirstName());
        assertEquals(dto.getLastName(), entity.getLastName());
        assertEquals(dto.getCreatedAt(), entity.getCreatedAt());
        assertEquals(dto.getUpdatedAt(), entity.getUpdatedAt());
    }
    
    @Test
    @DisplayName("Doit retourner null quand l'entité est null")
    void shouldReturnNullWhenEntityIsNull() {
        // Exécution
        TeacherDto result = teacherMapper.toDto((Teacher) null);
        
        // Vérification
        assertNull(result);
    }
    
    @Test
    @DisplayName("Doit retourner null quand le DTO est null")
    void shouldReturnNullWhenDtoIsNull() {
        // Exécution
        Teacher result = teacherMapper.toEntity((TeacherDto) null);
        
        // Vérification
        assertNull(result);
    }
    
    @Test
    @DisplayName("Doit convertir une liste de Teacher en liste de TeacherDto")
    void shouldMapEntityListToDtoList() {
        // Préparation
        LocalDateTime now = LocalDateTime.now();
        
        Teacher teacher1 = new Teacher();
        teacher1.setId(1L);
        teacher1.setFirstName("Jean");
        teacher1.setLastName("Dupont");
        teacher1.setCreatedAt(now);
        teacher1.setUpdatedAt(now);
        
        Teacher teacher2 = new Teacher();
        teacher2.setId(2L);
        teacher2.setFirstName("Marie");
        teacher2.setLastName("Martin");
        teacher2.setCreatedAt(now);
        teacher2.setUpdatedAt(now);
        
        List<Teacher> entities = Arrays.asList(teacher1, teacher2);
        
        // Exécution
        List<TeacherDto> dtos = teacherMapper.toDto(entities);
        
        // Vérification
        assertNotNull(dtos);
        assertEquals(2, dtos.size());
        assertEquals(teacher1.getId(), dtos.get(0).getId());
        assertEquals(teacher1.getFirstName(), dtos.get(0).getFirstName());
        assertEquals(teacher1.getLastName(), dtos.get(0).getLastName());
        assertEquals(teacher2.getId(), dtos.get(1).getId());
        assertEquals(teacher2.getFirstName(), dtos.get(1).getFirstName());
        assertEquals(teacher2.getLastName(), dtos.get(1).getLastName());
    }
    
    @Test
    @DisplayName("Doit convertir une liste de TeacherDto en liste de Teacher")
    void shouldMapDtoListToEntityList() {
        // Préparation
        LocalDateTime now = LocalDateTime.now();
        
        TeacherDto dto1 = new TeacherDto();
        dto1.setId(1L);
        dto1.setFirstName("Jean");
        dto1.setLastName("Dupont");
        dto1.setCreatedAt(now);
        dto1.setUpdatedAt(now);
        
        TeacherDto dto2 = new TeacherDto();
        dto2.setId(2L);
        dto2.setFirstName("Marie");
        dto2.setLastName("Martin");
        dto2.setCreatedAt(now);
        dto2.setUpdatedAt(now);
        
        List<TeacherDto> dtos = Arrays.asList(dto1, dto2);
        
        // Exécution
        List<Teacher> entities = teacherMapper.toEntity(dtos);
        
        // Vérification
        assertNotNull(entities);
        assertEquals(2, entities.size());
        assertEquals(dto1.getId(), entities.get(0).getId());
        assertEquals(dto1.getFirstName(), entities.get(0).getFirstName());
        assertEquals(dto1.getLastName(), entities.get(0).getLastName());
        assertEquals(dto2.getId(), entities.get(1).getId());
        assertEquals(dto2.getFirstName(), entities.get(1).getFirstName());
        assertEquals(dto2.getLastName(), entities.get(1).getLastName());
    }
    
    @Test
    @DisplayName("Doit retourner null quand la liste d'entités est null")
    void shouldReturnNullWhenEntityListIsNull() {
        // Exécution
        List<TeacherDto> result = teacherMapper.toDto((List<Teacher>) null);
        
        // Vérification
        assertNull(result);
    }
    
    @Test
    @DisplayName("Doit retourner null quand la liste de DTOs est null")
    void shouldReturnNullWhenDtoListIsNull() {
        // Exécution
        List<Teacher> result = teacherMapper.toEntity((List<TeacherDto>) null);
        
        // Vérification
        assertNull(result);
    }
    }
    
    // ======= Tests d'Intégration =======
    @Nested
    @SpringBootTest
    class IntegrationTests {
        @Autowired
        private TeacherMapper teacherMapper;
        
        @Autowired
        private TeacherRepository teacherRepository;
        
        @Autowired
        private SessionRepository sessionRepository;
        
        @BeforeEach
        void setUp() {
            // Assurons-nous que la BD est vide avant chaque test
            sessionRepository.deleteAll();
            teacherRepository.deleteAll();
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage des données de test
            sessionRepository.deleteAll();
            teacherRepository.deleteAll();
        }
        
        @Test
        @DisplayName("Doit convertir un Teacher persisté en DTO")
        @Transactional
        void shouldMapPersistedEntityToDto() {
            // Préparation
            Teacher teacher = new Teacher();
            teacher.setFirstName("Jean");
            teacher.setLastName("Dupont");
            
            Teacher savedTeacher = teacherRepository.save(teacher);
            
            // Exécution
            TeacherDto dto = teacherMapper.toDto(savedTeacher);
            
            // Vérification
            assertNotNull(dto);
            assertEquals(savedTeacher.getId(), dto.getId());
            assertEquals(savedTeacher.getFirstName(), dto.getFirstName());
            assertEquals(savedTeacher.getLastName(), dto.getLastName());
            assertNotNull(dto.getCreatedAt());
            assertNotNull(dto.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Doit convertir un TeacherDto en Teacher et le persister")
        @Transactional
        void shouldMapDtoToEntityAndPersist() {
            // Préparation
            TeacherDto dto = new TeacherDto();
            dto.setFirstName("Marie");
            dto.setLastName("Martin");
            
            // Exécution
            Teacher entity = teacherMapper.toEntity(dto);
            Teacher savedEntity = teacherRepository.save(entity);
            
            // Vérification
            assertNotNull(savedEntity.getId());
            assertEquals(dto.getFirstName(), savedEntity.getFirstName());
            assertEquals(dto.getLastName(), savedEntity.getLastName());
        }
        
        @Test
        @DisplayName("Doit effectuer un cycle complet de conversion (entité→DTO→entité) avec persistance")
        @Transactional
        void shouldCompleteMappingCycle() {
            // Préparation initiale
            Teacher originalTeacher = new Teacher();
            originalTeacher.setFirstName("Jean");
            originalTeacher.setLastName("Dupont");
            
            Teacher savedTeacher = teacherRepository.save(originalTeacher);
            
            // Premier mapping: Teacher → DTO
            TeacherDto dto = teacherMapper.toDto(savedTeacher);
            
            // Second mapping: DTO → Teacher
            Teacher reconvertedTeacher = teacherMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(reconvertedTeacher);
            assertEquals(savedTeacher.getId(), reconvertedTeacher.getId());
            assertEquals(savedTeacher.getFirstName(), reconvertedTeacher.getFirstName());
            assertEquals(savedTeacher.getLastName(), reconvertedTeacher.getLastName());
        }
        
        @Test
        @DisplayName("Doit convertir une liste de Teachers en liste de DTOs avec persistance")
        @Transactional
        void shouldMapEntityListToDtoList() {
            // Préparation
            Teacher teacher1 = new Teacher();
            teacher1.setFirstName("Jean");
            teacher1.setLastName("Dupont");
            
            Teacher teacher2 = new Teacher();
            teacher2.setFirstName("Marie");
            teacher2.setLastName("Martin");
            
            // Sauvegarde des entités
            Teacher savedTeacher1 = teacherRepository.save(teacher1);
            Teacher savedTeacher2 = teacherRepository.save(teacher2);
            List<Teacher> teachers = Arrays.asList(savedTeacher1, savedTeacher2);
            
            // Exécution
            List<TeacherDto> dtos = teacherMapper.toDto(teachers);
            
            // Vérification
            assertNotNull(dtos);
            assertEquals(2, dtos.size());
            assertEquals(savedTeacher1.getId(), dtos.get(0).getId());
            assertEquals(savedTeacher1.getFirstName(), dtos.get(0).getFirstName());
            assertEquals(savedTeacher1.getLastName(), dtos.get(0).getLastName());
            assertEquals(savedTeacher2.getId(), dtos.get(1).getId());
            assertEquals(savedTeacher2.getFirstName(), dtos.get(1).getFirstName());
            assertEquals(savedTeacher2.getLastName(), dtos.get(1).getLastName());
        }
        
        @Test
        @DisplayName("Test de suppression d'un enseignant sans sessions associées")
        @Transactional
        void shouldDeleteTeacherWithoutSessions() {
            // Préparation
            Teacher teacher = new Teacher();
            teacher.setFirstName("Jean");
            teacher.setLastName("Dupont");
            
            Teacher savedTeacher = teacherRepository.save(teacher);
            
            // Exécution - tentative de suppression
            teacherRepository.deleteById(savedTeacher.getId());
            
            // Vérification
            assertFalse(teacherRepository.existsById(savedTeacher.getId()));
        }
    }
}
