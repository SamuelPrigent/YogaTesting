package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests pour SessionController
 */
public class SessionControllerTest {
    
    /**
     * Tests unitaires pour SessionController
     */
    @Nested
    @DisplayName("Tests unitaires")
    class UnitTests {
        @Mock
        private SessionService sessionService;
        
        @Mock
        private SessionMapper sessionMapper;
        
        @InjectMocks
        private SessionController sessionController;
        
        private Session testSession;
        private SessionDto testSessionDto;
        private List<Session> testSessions;
        private List<SessionDto> testSessionDtos;
        private User testUser;
        private Long testUserId = 5L;
        private Teacher testTeacher;
        
        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);
            
            // Création des objets de test
            // Création d'un Teacher d'abord
            testTeacher = new Teacher();
            testTeacher.setId(1L);
            testTeacher.setLastName("Durant");
            testTeacher.setFirstName("Jean");
            testTeacher.setCreatedAt(LocalDateTime.now());
            testTeacher.setUpdatedAt(LocalDateTime.now());
            
            testSession = new Session();
            testSession.setId(1L);
            testSession.setName("Séance de yoga pour débutants");
            testSession.setDescription("Une séance pour les débutants");
            testSession.setDate(new Date());
            testSession.setTeacher(testTeacher);
            testSession.setUsers(new ArrayList<>());
            testSession.setCreatedAt(LocalDateTime.now());
            testSession.setUpdatedAt(LocalDateTime.now());
            
            testSessionDto = new SessionDto();
            testSessionDto.setId(1L);
            testSessionDto.setName("Séance de yoga pour débutants");
            testSessionDto.setDescription("Une séance pour les débutants");
            testSessionDto.setDate(testSession.getDate());
            testSessionDto.setTeacher_id(testTeacher.getId()); // Utilisation de l'ID du teacher créé
            testSessionDto.setUsers(new ArrayList<>());
            testSessionDto.setCreatedAt(testSession.getCreatedAt());
            testSessionDto.setUpdatedAt(testSession.getUpdatedAt());
            
            // Préparation des listes pour les tests findAll
            Session session2 = new Session();
            session2.setId(2L);
            session2.setName("Séance de yoga avancé");
            session2.setDescription("Une séance pour les yogis avancés");
            session2.setDate(new Date());
            // Création d'un autre Teacher
            Teacher teacher2 = new Teacher();
            teacher2.setId(2L);
            teacher2.setLastName("Martin");
            teacher2.setFirstName("Sophie");
            teacher2.setCreatedAt(LocalDateTime.now());
            teacher2.setUpdatedAt(LocalDateTime.now());
            
            session2.setTeacher(teacher2);
            session2.setUsers(new ArrayList<>());
            session2.setCreatedAt(LocalDateTime.now());
            session2.setUpdatedAt(LocalDateTime.now());
            
            SessionDto sessionDto2 = new SessionDto();
            sessionDto2.setId(2L);
            sessionDto2.setName("Séance de yoga avancé");
            sessionDto2.setDescription("Une séance pour les yogis avancés");
            sessionDto2.setDate(session2.getDate());
            sessionDto2.setTeacher_id(teacher2.getId()); // Utilisation de l'ID du second teacher
            sessionDto2.setUsers(new ArrayList<>());
            sessionDto2.setCreatedAt(session2.getCreatedAt());
            sessionDto2.setUpdatedAt(session2.getUpdatedAt());
            
            testSessions = Arrays.asList(testSession, session2);
            testSessionDtos = Arrays.asList(testSessionDto, sessionDto2);
            
            // Création d'un utilisateur de test pour les fonctionnalités de participation
            testUser = new User();
            testUser.setId(testUserId);
            testUser.setEmail("test@example.com");
            testUser.setFirstName("Test");
            testUser.setLastName("User");
            testUser.setPassword("password");
            testUser.setAdmin(false);
        }
        
        @Test
        @DisplayName("findById - Doit retourner la séance lorsqu'elle existe")
        void findById_ShouldReturnSession_WhenSessionExists() {
            // Préparation
            when(sessionService.getById(1L)).thenReturn(testSession);
            when(sessionMapper.toDto(testSession)).thenReturn(testSessionDto);
            
            // Exécution
            ResponseEntity<?> response = sessionController.findById("1");
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testSessionDto, response.getBody());
            verify(sessionService).getById(1L);
            verify(sessionMapper).toDto(testSession);
        }
        
        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand la séance n'existe pas")
        void findById_ShouldReturnNotFound_WhenSessionDoesNotExist() {
            // Préparation
            when(sessionService.getById(1L)).thenReturn(null);
            
            // Exécution
            ResponseEntity<?> response = sessionController.findById("1");
            
            // Vérification
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNull(response.getBody());
            verify(sessionService).getById(1L);
            verify(sessionMapper, never()).toDto(any(Session.class));
        }
        
        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.findById("invalidId");
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNull(response.getBody());
            verify(sessionService, never()).getById(anyLong());
            verify(sessionMapper, never()).toDto(any(Session.class));
        }
        
        @Test
        @DisplayName("findAll - Doit retourner toutes les séances")
        void findAll_ShouldReturnAllSessions() {
            // Préparation
            when(sessionService.findAll()).thenReturn(testSessions);
            when(sessionMapper.toDto(testSessions)).thenReturn(testSessionDtos);
            
            // Exécution
            ResponseEntity<?> response = sessionController.findAll();
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testSessionDtos, response.getBody());
            verify(sessionService).findAll();
            verify(sessionMapper).toDto(testSessions);
        }
        
        @Test
        @DisplayName("create - Doit créer une nouvelle séance")
        void create_ShouldCreateNewSession() {
            // Préparation
            when(sessionMapper.toEntity(testSessionDto)).thenReturn(testSession);
            when(sessionService.create(testSession)).thenReturn(testSession);
            when(sessionMapper.toDto(testSession)).thenReturn(testSessionDto);
            
            // Exécution
            ResponseEntity<?> response = sessionController.create(testSessionDto);
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testSessionDto, response.getBody());
            verify(sessionMapper).toEntity(testSessionDto);
            verify(sessionService).create(testSession);
            verify(sessionMapper).toDto(testSession);
        }
        
        @Test
        @DisplayName("update - Doit mettre à jour une séance existante")
        void update_ShouldUpdateExistingSession() {
            // Préparation
            when(sessionMapper.toEntity(testSessionDto)).thenReturn(testSession);
            when(sessionService.update(1L, testSession)).thenReturn(testSession);
            when(sessionMapper.toDto(testSession)).thenReturn(testSessionDto);
            
            // Exécution
            ResponseEntity<?> response = sessionController.update("1", testSessionDto);
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testSessionDto, response.getBody());
            verify(sessionMapper).toEntity(testSessionDto);
            verify(sessionService).update(1L, testSession);
            verify(sessionMapper).toDto(testSession);
        }
        
        @Test
        @DisplayName("update - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void update_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.update("invalidId", testSessionDto);
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNull(response.getBody());
            verify(sessionService, never()).update(anyLong(), any(Session.class));
        }
        
        @Test
        @DisplayName("delete - Doit supprimer une séance existante")
        void delete_ShouldDeleteExistingSession() {
            // Préparation
            when(sessionService.getById(1L)).thenReturn(testSession);
            
            // Exécution
            ResponseEntity<?> response = sessionController.save("1");
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(sessionService).getById(1L);
            verify(sessionService).delete(1L);
        }
        
        @Test
        @DisplayName("delete - Doit retourner NOT_FOUND quand la séance n'existe pas")
        void delete_ShouldReturnNotFound_WhenSessionDoesNotExist() {
            // Préparation
            when(sessionService.getById(1L)).thenReturn(null);
            
            // Exécution
            ResponseEntity<?> response = sessionController.save("1");
            
            // Vérification
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            verify(sessionService).getById(1L);
            verify(sessionService, never()).delete(anyLong());
        }
        
        @Test
        @DisplayName("delete - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void delete_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.save("invalidId");
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(sessionService, never()).getById(anyLong());
            verify(sessionService, never()).delete(anyLong());
        }
        
        @Test
        @DisplayName("participate - Doit ajouter un utilisateur à une séance")
        void participate_ShouldAddUserToSession() {
            // Exécution
            ResponseEntity<?> response = sessionController.participate("1", testUserId.toString());
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(sessionService).participate(1L, testUserId);
        }
        
        @Test
        @DisplayName("participate - Doit retourner BAD_REQUEST quand l'ID de séance n'est pas un nombre")
        void participate_ShouldReturnBadRequest_WhenSessionIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.participate("invalidId", testUserId.toString());
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(sessionService, never()).participate(anyLong(), anyLong());
        }
        
        @Test
        @DisplayName("participate - Doit retourner BAD_REQUEST quand l'ID d'utilisateur n'est pas un nombre")
        void participate_ShouldReturnBadRequest_WhenUserIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.participate("1", "invalidId");
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(sessionService, never()).participate(anyLong(), anyLong());
        }
        
        @Test
        @DisplayName("noLongerParticipate - Doit retirer un utilisateur d'une séance")
        void noLongerParticipate_ShouldRemoveUserFromSession() {
            // Exécution
            ResponseEntity<?> response = sessionController.noLongerParticipate("1", testUserId.toString());
            
            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(sessionService).noLongerParticipate(1L, testUserId);
        }
        
        @Test
        @DisplayName("noLongerParticipate - Doit retourner BAD_REQUEST quand l'ID de séance n'est pas un nombre")
        void noLongerParticipate_ShouldReturnBadRequest_WhenSessionIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.noLongerParticipate("invalidId", testUserId.toString());
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
        }
        
        @Test
        @DisplayName("noLongerParticipate - Doit retourner BAD_REQUEST quand l'ID d'utilisateur n'est pas un nombre")
        void noLongerParticipate_ShouldReturnBadRequest_WhenUserIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = sessionController.noLongerParticipate("1", "invalidId");
            
            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(sessionService, never()).noLongerParticipate(anyLong(), anyLong());
        }
    }
    
    /**
     * Tests d'intégration pour SessionController
     */
    @Nested
    @SpringBootTest
    @AutoConfigureMockMvc
    @Transactional
    @DisplayName("Tests d'intégration pour SessionController")
    class IntegrationTests {
        @Autowired
        private MockMvc mockMvc;
        
        @Autowired
        private com.openclassrooms.starterjwt.repository.SessionRepository sessionRepository;
        
        @Autowired
        private com.openclassrooms.starterjwt.repository.TeacherRepository teacherRepository;
        
        @Autowired
        private com.openclassrooms.starterjwt.repository.UserRepository userRepository;
        
        private Session testSession;
        private Teacher testTeacher;
        private User testUser;
        
        @BeforeEach
        void setUp() {
            // Création d'un professeur de test en base de données
            testTeacher = new Teacher();
            testTeacher.setLastName("Dubois");
            testTeacher.setFirstName("Pierre");
            testTeacher.setCreatedAt(LocalDateTime.now());
            testTeacher.setUpdatedAt(LocalDateTime.now());
            
            testTeacher = teacherRepository.save(testTeacher);
            
            // Création d'un utilisateur de test
            testUser = new User();
            testUser.setEmail("test-integration@example.com");
            testUser.setFirstName("Test");
            testUser.setLastName("Utilisateur");
            testUser.setPassword("password");
            testUser.setAdmin(false);
            
            testUser = userRepository.save(testUser);
            
            // Création d'une séance de test en base de données
            testSession = new Session();
            testSession.setName("Séance de test d'intégration");
            testSession.setDescription("Description pour les tests d'intégration");
            testSession.setDate(new Date());
            testSession.setTeacher(testTeacher);
            testSession.setUsers(new ArrayList<>());
            testSession.setCreatedAt(LocalDateTime.now());
            testSession.setUpdatedAt(LocalDateTime.now());
            
            testSession = sessionRepository.save(testSession);
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage des données de test pour éviter des conflits entre les tests
            try {
                // Supprimer les relations utilisateur-session d'abord pour éviter les contraintes de clé étrangère
                if (testSession != null && sessionRepository.existsById(testSession.getId())) {
                    // Récupérer la session avec ses utilisateurs pour nettoyer correctement
                    Session session = sessionRepository.findById(testSession.getId()).orElse(null);
                    if (session != null) {
                        session.setUsers(new ArrayList<>());
                        sessionRepository.save(session);
                        sessionRepository.deleteById(testSession.getId());
                    }
                }
                
                if (testUser != null && userRepository.existsById(testUser.getId())) {
                    userRepository.deleteById(testUser.getId());
                }
                
                if (testTeacher != null && teacherRepository.existsById(testTeacher.getId())) {
                    teacherRepository.deleteById(testTeacher.getId());
                }
            } catch (Exception e) {
                // Logger l'erreur mais permettre aux tests de continuer
                System.err.println("Erreur lors du nettoyage des données de test: " + e.getMessage());
            }
        }
        
        @Test
        @DisplayName("findById - Doit retourner la séance lorsqu'elle existe")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnSession_WhenSessionExists() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/session/{id}", testSession.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(testSession.getId()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.name").value(testSession.getName()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(testSession.getDescription()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.teacher_id").value(testTeacher.getId()));
        }
        
        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand la séance n'existe pas")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnNotFound_WhenSessionDoesNotExist() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/session/{id}", 9999L))
                    .andExpect(MockMvcResultMatchers.status().isNotFound());
        }
        
        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/session/{id}", "invalidId"))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest());
        }
        
        @Test
        @DisplayName("findAll - Doit retourner toutes les séances")
        @WithMockUser(username = "user@test.com")
        void findAll_ShouldReturnAllSessions() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/session"))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                    // Vérifie qu'au moins un élément existe dans la réponse JSON
                    .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").exists());
        }
        
        @Test
        @DisplayName("create - Doit créer une nouvelle séance")
        @WithMockUser(username = "user@test.com")
        void create_ShouldCreateNewSession() throws Exception {
            // Préparation d'un DTO pour la création
            SessionDto newSessionDto = new SessionDto();
            newSessionDto.setName("Nouvelle séance de test");
            newSessionDto.setDescription("Nouvelle description pour test d'intégration");
            newSessionDto.setDate(new Date());
            newSessionDto.setTeacher_id(testTeacher.getId());
            newSessionDto.setUsers(new ArrayList<>());
            
            String jsonContent = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(newSessionDto);
            
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/session")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonContent))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.name").value(newSessionDto.getName()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(newSessionDto.getDescription()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.teacher_id").value(testTeacher.getId()));
        }
        
        @Test
        @DisplayName("update - Doit mettre à jour une séance existante")
        @WithMockUser(username = "user@test.com")
        void update_ShouldUpdateExistingSession() throws Exception {
            // Préparation d'un DTO pour la mise à jour
            SessionDto updateSessionDto = new SessionDto();
            updateSessionDto.setId(testSession.getId());
            updateSessionDto.setName("Séance mise à jour");
            updateSessionDto.setDescription("Description mise à jour pour test d'intégration");
            updateSessionDto.setDate(testSession.getDate());
            updateSessionDto.setTeacher_id(testTeacher.getId());
            updateSessionDto.setUsers(new ArrayList<>());
            
            String jsonContent = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(updateSessionDto);
            
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.put("/api/session/{id}", testSession.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonContent))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.name").value(updateSessionDto.getName()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(updateSessionDto.getDescription()));
        }
        
        @Test
        @DisplayName("delete - Doit supprimer une séance existante")
        @WithMockUser(username = "user@test.com")
        void delete_ShouldDeleteExistingSession() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/session/{id}", testSession.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk());
            
            // Vérification supplémentaire que la session a bien été supprimée
            mockMvc.perform(MockMvcRequestBuilders.get("/api/session/{id}", testSession.getId()))
                    .andExpect(MockMvcResultMatchers.status().isNotFound());
        }
        
        @Test
        @DisplayName("participate - Doit ajouter un utilisateur à une séance")
        @WithMockUser(username = "user@test.com")
        void participate_ShouldAddUserToSession() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/session/{id}/participate/{userId}", 
                    testSession.getId(), testUser.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk());
        }
        
        @Test
        @DisplayName("noLongerParticipate - Doit retirer un utilisateur d'une séance")
        @WithMockUser(username = "user@test.com")
        void noLongerParticipate_ShouldRemoveUserFromSession() throws Exception {
            // D'abord ajouter l'utilisateur pour pouvoir le retirer ensuite
            mockMvc.perform(MockMvcRequestBuilders.post("/api/session/{id}/participate/{userId}", 
                    testSession.getId(), testUser.getId()));
            
            // Exécution et vérification du retrait
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/session/{id}/participate/{userId}", 
                    testSession.getId(), testUser.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk());
        }
    }
}
