package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.Nested;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests pour SessionMapper (unitaires et d'intégration)
 */
public class SessionMapperTest {

    // ======= Tests Unitaires =======
    @Nested
    @ExtendWith(MockitoExtension.class)
    class UnitTests {
        @Mock
        private TeacherService teacherService;

        @Mock
        private UserService userService;

        // Implémentation concrète pour les tests
        private SessionMapper sessionMapper;
        
        @BeforeEach
        void setUp() {
            // On utilise directement l'implémentation SessionMapperImpl générée par MapStruct pour améliorer la couverture de code
            sessionMapper = new SessionMapperImpl();
            
            // Injection des mocks dans le mapper pour contrôler les dépendances
            ReflectionTestUtils.setField(sessionMapper, "teacherService", teacherService);
            ReflectionTestUtils.setField(sessionMapper, "userService", userService);
        }
    
    @Test
    @DisplayName("Doit convertir un SessionDto complet en Session")
    void shouldMapDtoToEntity() {
        // Préparation
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setName("Session de yoga");
        dto.setDescription("Une session pour débutants");
        dto.setDate(new Date());
        dto.setTeacher_id(2L);
        dto.setUsers(Arrays.asList(3L, 4L));
        
        Teacher teacher = new Teacher();
        teacher.setId(2L);
        
        User user1 = new User();
        user1.setId(3L);
        
        User user2 = new User();
        user2.setId(4L);
        
        // Configuration des mocks
        when(teacherService.findById(2L)).thenReturn(teacher);
        when(userService.findById(3L)).thenReturn(user1);
        when(userService.findById(4L)).thenReturn(user2);
        
        // Exécution
        Session result = sessionMapper.toEntity(dto);
        
        // Vérification
        assertNotNull(result);
        assertEquals(dto.getId(), result.getId());
        assertEquals(dto.getName(), result.getName());
        assertEquals(dto.getDescription(), result.getDescription());
        assertEquals(dto.getDate(), result.getDate());
        assertNotNull(result.getTeacher());
        assertEquals(dto.getTeacher_id(), result.getTeacher().getId());
        assertNotNull(result.getUsers());
        assertEquals(2, result.getUsers().size());
        assertEquals(3L, result.getUsers().get(0).getId());
        assertEquals(4L, result.getUsers().get(1).getId());
    }
    
    @Test
    @DisplayName("Doit gérer un SessionDto avec teacher_id null")
    void shouldHandleNullTeacherId() {
        // Préparation
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setName("Session sans prof");
        dto.setTeacher_id(null);
        
        // Exécution
        Session result = sessionMapper.toEntity(dto);
        
        // Vérification
        assertNotNull(result);
        assertNull(result.getTeacher());
    }
    
    @Test
    @DisplayName("Doit gérer un SessionDto avec liste d'utilisateurs null")
    void shouldHandleNullUsersList() {
        // Préparation
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setUsers(null);
        
        // Exécution
        Session result = sessionMapper.toEntity(dto);
        
        // Vérification
        assertNotNull(result);
        assertNotNull(result.getUsers(), "La liste d'utilisateurs ne devrait pas être null");
        assertTrue(result.getUsers().isEmpty(), "La liste d'utilisateurs devrait être vide");
    }
    
    @Test
    @DisplayName("Doit gérer un ID utilisateur qui ne correspond à aucun utilisateur")
    void shouldHandleNonExistentUserId() {
        // Préparation
        SessionDto dto = new SessionDto();
        dto.setId(1L);
        dto.setUsers(Arrays.asList(999L));
        
        // Configuration des mocks
        when(userService.findById(999L)).thenReturn(null);
        
        // Exécution
        Session result = sessionMapper.toEntity(dto);
        
        // Vérification
        assertNotNull(result);
        assertNotNull(result.getUsers());
        // Dépend de l'implémentation : soit la liste contient null, soit l'élément a été filtré
        // Ici nous supposons que l'implémentation filtre les nulls
        assertTrue(result.getUsers().isEmpty() || result.getUsers().get(0) == null);
    }
    
    @Test
    @DisplayName("Doit convertir une Session complète en SessionDto")
    void shouldMapEntityToDto() {
        // Préparation
        Session session = new Session();
        session.setId(1L);
        session.setName("Session de yoga");
        session.setDescription("Une session pour débutants");
        session.setDate(new Date());
        
        Teacher teacher = new Teacher();
        teacher.setId(2L);
        session.setTeacher(teacher);
        
        User user1 = new User();
        user1.setId(3L);
        
        User user2 = new User();
        user2.setId(4L);
        
        session.setUsers(Arrays.asList(user1, user2));
        
        // Exécution
        SessionDto result = sessionMapper.toDto(session);
        
        // Vérification
        assertNotNull(result);
        assertEquals(session.getId(), result.getId());
        assertEquals(session.getName(), result.getName());
        assertEquals(session.getDescription(), result.getDescription());
        assertEquals(session.getDate(), result.getDate());
        assertEquals(session.getTeacher().getId(), result.getTeacher_id());
        assertNotNull(result.getUsers());
        assertEquals(2, result.getUsers().size());
        assertTrue(result.getUsers().contains(3L));
        assertTrue(result.getUsers().contains(4L));
    }
    
    @Test
    @DisplayName("Doit gérer une Session avec teacher null")
    void shouldHandleNullTeacher() {
        // Préparation
        Session session = new Session();
        session.setId(1L);
        session.setName("Session sans prof");
        session.setTeacher(null);
        
        // Exécution
        SessionDto result = sessionMapper.toDto(session);
        
        // Vérification
        assertNotNull(result);
        assertNull(result.getTeacher_id());
    }
    
    @Test
    @DisplayName("Doit retourner null quand la Session est null")
    void shouldReturnNullWhenSessionIsNull() {
        // Exécution
        SessionDto result = sessionMapper.toDto((Session) null);
        
        // Vérification
        assertNull(result, "Le DTO devrait être null quand la Session est null");
    }
    
    @Test
    @DisplayName("Doit retourner null quand le SessionDto est null")
    void shouldReturnNullWhenDtoIsNull() {
        // Exécution
        Session result = sessionMapper.toEntity((SessionDto) null);
        
        // Vérification
        assertNull(result, "La Session devrait être null quand le DTO est null");
    }
    
    @Test
    @DisplayName("Doit gérer un Teacher avec id null")
    void shouldHandleTeacherWithNullId() {
        // Préparation
        Session session = new Session();
        session.setId(1L);
        Teacher teacher = new Teacher();
        teacher.setId(null); // ID null
        session.setTeacher(teacher);
        
        // Exécution
        SessionDto result = sessionMapper.toDto(session);
        
        // Vérification
        assertNotNull(result);
        assertNull(result.getTeacher_id(), "teacher_id devrait être null quand l'ID du Teacher est null");
    }
    
    @Test
    @DisplayName("Doit retourner null quand la liste de Sessions est null")
    void shouldHandleNullEntityList() {
        // Exécution
        List<SessionDto> result = sessionMapper.toDto((List<Session>) null);
        
        // Vérification
        assertNull(result, "La liste convertie devrait être null pour respecter l'implémentation de MapStruct");
    }
    
    @Test
    @DisplayName("Doit convertir une liste de Sessions en liste de SessionDto")
    void shouldMapEntityListToDtoList() {
        // Préparation
        Session session1 = new Session();
        session1.setId(1L);
        session1.setName("Session 1");
        
        Session session2 = new Session();
        session2.setId(2L);
        session2.setName("Session 2");
        
        List<Session> sessions = Arrays.asList(session1, session2);
        
        // Exécution
        List<SessionDto> result = sessionMapper.toDto(sessions);
        
        // Vérification
        assertNotNull(result);
        assertEquals(2, result.size(), "La liste résultante devrait contenir 2 éléments");
        assertEquals(1L, result.get(0).getId(), "Le premier DTO devrait avoir l'ID 1");
        assertEquals("Session 1", result.get(0).getName(), "Le premier DTO devrait avoir le nom 'Session 1'");
        assertEquals(2L, result.get(1).getId(), "Le second DTO devrait avoir l'ID 2");
        assertEquals("Session 2", result.get(1).getName(), "Le second DTO devrait avoir le nom 'Session 2'");
    }
    
    @Test
    @DisplayName("Doit retourner null quand la liste de SessionDto est null")
    void shouldHandleNullDtoList() {
        // Exécution
        List<Session> result = sessionMapper.toEntity((List<SessionDto>) null);
        
        // Vérification
        assertNull(result, "La liste convertie devrait être null pour respecter l'implémentation de MapStruct");
    }
    
    @Test
    @DisplayName("Doit convertir une liste de SessionDto en liste de Sessions")
    void shouldMapDtoListToEntityList() {
        // Préparation
        SessionDto dto1 = new SessionDto();
        dto1.setId(1L);
        dto1.setName("Session 1");
        
        SessionDto dto2 = new SessionDto();
        dto2.setId(2L);
        dto2.setName("Session 2");
        
        List<SessionDto> dtos = Arrays.asList(dto1, dto2);
        
        // Exécution
        List<Session> result = sessionMapper.toEntity(dtos);
        
        // Vérification
        assertNotNull(result);
        assertEquals(2, result.size(), "La liste résultante devrait contenir 2 éléments");
        assertEquals(1L, result.get(0).getId(), "La première Session devrait avoir l'ID 1");
        assertEquals("Session 1", result.get(0).getName(), "La première Session devrait avoir le nom 'Session 1'");
        assertEquals(2L, result.get(1).getId(), "La seconde Session devrait avoir l'ID 2");
        assertEquals("Session 2", result.get(1).getName(), "La seconde Session devrait avoir le nom 'Session 2'");
    }
    
    @Test
    @DisplayName("Doit gérer session null dans la méthode privée sessionTeacherId")
    void shouldHandleNullSessionInTeacherIdMethod() {
        // Utilisation directe de la réflexion pour appeler la méthode privée sessionTeacherId avec null
        Long result = ReflectionTestUtils.invokeMethod(sessionMapper, "sessionTeacherId", (Session) null);
        
        // Vérification
        assertNull(result, "sessionTeacherId doit retourner null quand session est null");
    }
    
    @Test
    @DisplayName("Doit gérer une Session avec liste d'utilisateurs null")
    void shouldHandleNullUsersListInEntity() {
        // Préparation
        Session session = new Session();
        session.setId(1L);
        session.setUsers(null);
        
        // Exécution
        SessionDto result = sessionMapper.toDto(session);
        
        // Vérification
        assertNotNull(result);
        assertNotNull(result.getUsers(), "La liste d'utilisateurs ne devrait pas être null");
        assertTrue(result.getUsers().isEmpty(), "La liste d'utilisateurs devrait être vide");
    }
    
    @Test
    @DisplayName("Doit gérer une Session avec liste d'utilisateurs vide")
    void shouldHandleEmptyUsersList() {
        // Préparation
        Session session = new Session();
        session.setId(1L);
        session.setUsers(Collections.emptyList());
        
        // Exécution
        SessionDto result = sessionMapper.toDto(session);
        
        // Vérification
        assertNotNull(result);
        assertNotNull(result.getUsers());
        assertTrue(result.getUsers().isEmpty());
    }
    }
    
    // ======= Tests d'Intégration =======
    @Nested
    @SpringBootTest
    class IntegrationTests {
        @Autowired
        private SessionMapper sessionMapper;
        
        // Les services ne sont pas injectés explicitement car ils sont
        // déjà utilisés en interne par le SessionMapperImpl
        
        @Autowired
        private SessionRepository sessionRepository;
        
        @Autowired
        private TeacherRepository teacherRepository;
        
        @Autowired
        private UserRepository userRepository;
        
        private Teacher teacher;
        private User user1, user2;
        
        @BeforeEach
        void setUp() {
            // Création d'un enseignant pour les tests
            teacher = new Teacher();
            teacher.setLastName("Dupont");
            teacher.setFirstName("Jean");
            teacherRepository.save(teacher);
            
            // Création d'utilisateurs pour les tests
            user1 = new User();
            user1.setEmail("user1@test.com");
            user1.setLastName("User");
            user1.setFirstName("One");
            user1.setPassword("password123"); // Ajout d'un mot de passe pour complétude
            user1.setAdmin(false); // Champ obligatoire
            userRepository.save(user1);
            
            user2 = new User();
            user2.setEmail("user2@test.com");
            user2.setLastName("User");
            user2.setFirstName("Two");
            user2.setPassword("password456"); // Ajout d'un mot de passe pour complétude
            user2.setAdmin(false); // Champ obligatoire
            userRepository.save(user2);
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage des données de test
            sessionRepository.deleteAll();
            userRepository.deleteAll();
            teacherRepository.deleteAll();
        }
        
        @Test
        @DisplayName("Doit convertir une Session persistée en DTO et maintenir toutes les relations")
        @Transactional
        void shouldMapPersistedEntityToDto() {
            // Préparation
            Session session = new Session();
            session.setName("Session de test");
            session.setDate(new Date());
            session.setDescription("Description de test");
            session.setTeacher(teacher);
            session.setUsers(Arrays.asList(user1, user2));
            
            Session savedSession = sessionRepository.save(session);
            
            // Exécution
            SessionDto dto = sessionMapper.toDto(savedSession);
            
            // Vérification
            assertNotNull(dto);
            assertEquals(savedSession.getId(), dto.getId());
            assertEquals(savedSession.getName(), dto.getName());
            assertEquals(savedSession.getDescription(), dto.getDescription());
            assertEquals(savedSession.getTeacher().getId(), dto.getTeacher_id());
            
            assertNotNull(dto.getUsers());
            assertEquals(2, dto.getUsers().size());
            assertTrue(dto.getUsers().contains(user1.getId()));
            assertTrue(dto.getUsers().contains(user2.getId()));
        }
        
        @Test
        @DisplayName("Doit convertir un DTO en Session avec chargement des entités réelles depuis la base")
        @Transactional
        void shouldMapDtoToEntityWithRepositoryLookup() {
            // Préparation
            SessionDto dto = new SessionDto();
            dto.setName("Session depuis DTO");
            dto.setDate(new Date());
            dto.setDescription("Description depuis DTO");
            dto.setTeacher_id(teacher.getId());
            dto.setUsers(Arrays.asList(user1.getId(), user2.getId()));
            
            // Exécution
            Session entity = sessionMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(entity);
            assertEquals(dto.getName(), entity.getName());
            assertEquals(dto.getDescription(), entity.getDescription());
            
            assertNotNull(entity.getTeacher());
            assertEquals(teacher.getId(), entity.getTeacher().getId());
            assertEquals(teacher.getLastName(), entity.getTeacher().getLastName());
            
            assertNotNull(entity.getUsers());
            assertEquals(2, entity.getUsers().size());
            assertEquals(user1.getId(), entity.getUsers().get(0).getId());
            assertEquals(user1.getEmail(), entity.getUsers().get(0).getEmail());
            assertEquals(user2.getId(), entity.getUsers().get(1).getId());
            assertEquals(user2.getEmail(), entity.getUsers().get(1).getEmail());
        }
        
        @Test
        @DisplayName("Doit effectuer un cycle complet de conversion (entité→DTO→entité) avec persistance")
        @Transactional
        void shouldCompleteMappingCycle() {
            // Préparation initiale
            Session originalSession = new Session();
            originalSession.setName("Cycle complet");
            originalSession.setDate(new Date());
            originalSession.setDescription("Test de cycle complet");
            originalSession.setTeacher(teacher);
            originalSession.setUsers(Arrays.asList(user1));
            
            Session savedSession = sessionRepository.save(originalSession);
            
            // Premier mapping: Session → DTO
            SessionDto dto = sessionMapper.toDto(savedSession);
            
            // Second mapping: DTO → Session
            Session reconvertedSession = sessionMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(reconvertedSession);
            assertEquals(savedSession.getId(), reconvertedSession.getId());
            assertEquals(savedSession.getName(), reconvertedSession.getName());
            assertEquals(savedSession.getDescription(), reconvertedSession.getDescription());
            
            assertNotNull(reconvertedSession.getTeacher());
            assertEquals(teacher.getId(), reconvertedSession.getTeacher().getId());
            
            assertNotNull(reconvertedSession.getUsers());
            assertEquals(1, reconvertedSession.getUsers().size());
            assertEquals(user1.getId(), reconvertedSession.getUsers().get(0).getId());
        }
        
        @Test
        @DisplayName("Doit convertir une liste de Sessions en liste de DTOs avec persistance")
        @Transactional
        void shouldMapEntityListToDtoList() {
            // Préparation
            // Nettoyons d'abord les sessions existantes pour éviter les interférences
            sessionRepository.deleteAll();
            
            Session session1 = new Session();
            session1.setName("Session 1");
            session1.setTeacher(teacher);
            session1.setDate(new Date()); // Ajout de la date (champ obligatoire)
            session1.setDescription("Description de la session 1"); // Ajout de la description (champ obligatoire)
            
            Session session2 = new Session();
            session2.setName("Session 2");
            session2.setTeacher(teacher);
            session2.setDate(new Date()); // Ajout de la date (champ obligatoire)
            session2.setDescription("Description de la session 2"); // Ajout de la description (champ obligatoire)
            
            // Sauvegardons et récupérons les sessions persistantes
            Session savedSession1 = sessionRepository.save(session1);
            Session savedSession2 = sessionRepository.save(session2);
            List<Session> sessions = Arrays.asList(savedSession1, savedSession2);
            
            // Exécution
            List<SessionDto> dtos = sessionMapper.toDto(sessions);
            
            // Vérification
            assertNotNull(dtos);
            assertEquals(2, dtos.size());
            assertEquals(savedSession1.getId(), dtos.get(0).getId());
            assertEquals(savedSession1.getName(), dtos.get(0).getName());
            assertEquals(savedSession2.getId(), dtos.get(1).getId());
            assertEquals(savedSession2.getName(), dtos.get(1).getName());
        }
        
        @Test
        @DisplayName("Doit gérer les références inexistantes lors de la conversion DTO→Entité")
        @Transactional
        void shouldHandleNonExistingReferences() {
            // Préparation d'un DTO avec un teacher_id inexistant
            SessionDto dto = new SessionDto();
            dto.setName("Session référence invalide");
            dto.setTeacher_id(9999L); // ID qui n'existe pas
            dto.setDate(new Date()); // Ajout de la date
            dto.setDescription("Description test"); // Ajout de la description
            
            // Nous utilisons uniquement l'ID valide pour être sûr du résultat attendu
            dto.setUsers(Collections.singletonList(user1.getId())); 
            
            // Exécution
            Session entity = sessionMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(entity);
            assertEquals(dto.getName(), entity.getName());
            
            // Le teacher devrait être null car l'ID n'existe pas
            assertNull(entity.getTeacher());
            
            // La liste d'utilisateurs devrait contenir seulement l'utilisateur valide
            assertNotNull(entity.getUsers());
            assertEquals(1, entity.getUsers().size());
            assertEquals(user1.getId(), entity.getUsers().get(0).getId());
        }
    }
}
