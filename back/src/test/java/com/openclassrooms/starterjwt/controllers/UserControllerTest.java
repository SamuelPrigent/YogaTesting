package com.openclassrooms.starterjwt.controllers;


import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour UserController
 */
public class UserControllerTest {

    @Nested
    class UnitTests {
        @Mock
        private UserService userService;

        @Mock
        private UserMapper userMapper;

        @Mock
        private SecurityContext securityContext;

        @Mock
        private Authentication authentication;

        @Mock
        private UserDetails userDetails;

        @InjectMocks
        private UserController userController;

        private User testUser;
        private UserDto testUserDto;

        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);

            // Configuration de la sécurité
            SecurityContextHolder.setContext(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(userDetails);

            // Création des objets de test
            testUser = new User();
            testUser.setId(1L);
            testUser.setEmail("user@test.com");
            testUser.setLastName("Nom");
            testUser.setFirstName("Prénom");
            testUser.setPassword("password");
            testUser.setAdmin(false);
            testUser.setCreatedAt(LocalDateTime.now());
            testUser.setUpdatedAt(LocalDateTime.now());

            testUserDto = new UserDto();
            testUserDto.setId(1L);
            testUserDto.setEmail("user@test.com");
            testUserDto.setLastName("Nom");
            testUserDto.setFirstName("Prénom");
            testUserDto.setPassword("password");
            testUserDto.setAdmin(false);
            testUserDto.setCreatedAt(testUser.getCreatedAt());
            testUserDto.setUpdatedAt(testUser.getUpdatedAt());
        }

        @Test
        @DisplayName("findById - Doit retourner l'utilisateur lorsqu'il existe")
        void findById_ShouldReturnUser_WhenUserExists() {
            // Préparation
            when(userService.findById(1L)).thenReturn(testUser);
            when(userMapper.toDto(testUser)).thenReturn(testUserDto);

            // Exécution
            ResponseEntity<?> response = userController.findById("1");

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testUserDto, response.getBody());
            verify(userService).findById(1L);
            verify(userMapper).toDto(testUser);
        }

        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand l'utilisateur n'existe pas")
        void findById_ShouldReturnNotFound_WhenUserDoesNotExist() {
            // Préparation
            when(userService.findById(1L)).thenReturn(null);

            // Exécution
            ResponseEntity<?> response = userController.findById("1");

            // Vérification
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNull(response.getBody());
            verify(userService).findById(1L);
            verify(userMapper, never()).toDto(any(User.class));
        }

        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = userController.findById("invalidId");

            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNull(response.getBody());
            verify(userService, never()).findById(anyLong());
            verify(userMapper, never()).toDto(any(User.class));
        }

        @Test
        @DisplayName("delete - Doit supprimer l'utilisateur et retourner OK quand l'utilisateur existe et est authentifié")
        void delete_ShouldDeleteUserAndReturnOk_WhenUserExistsAndIsAuthenticated() {
            // Préparation
            when(userDetails.getUsername()).thenReturn("user@test.com");
            when(userService.findById(1L)).thenReturn(testUser);

            // Exécution
            ResponseEntity<?> response = userController.save("1");

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(userService).findById(1L);
            verify(userService).delete(1L);
            verify(userDetails).getUsername();
        }

        @Test
        @DisplayName("delete - Doit retourner NOT_FOUND quand l'utilisateur n'existe pas")
        void delete_ShouldReturnNotFound_WhenUserDoesNotExist() {
            // Préparation
            when(userService.findById(1L)).thenReturn(null);

            // Exécution
            ResponseEntity<?> response = userController.save("1");

            // Vérification
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            verify(userService).findById(1L);
            verify(userService, never()).delete(anyLong());
        }

        @Test
        @DisplayName("delete - Doit retourner UNAUTHORIZED quand l'utilisateur n'est pas le même que l'utilisateur authentifié")
        void delete_ShouldReturnUnauthorized_WhenUserIsNotTheSameAsAuthenticatedUser() {
            // Préparation
            when(userDetails.getUsername()).thenReturn("different@test.com");
            when(userService.findById(1L)).thenReturn(testUser);

            // Exécution
            ResponseEntity<?> response = userController.save("1");

            // Vérification
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
            verify(userService).findById(1L);
            verify(userService, never()).delete(anyLong());
            verify(userDetails).getUsername();
        }

        @Test
        @DisplayName("delete - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void delete_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = userController.save("invalidId");

            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            verify(userService, never()).findById(anyLong());
            verify(userService, never()).delete(anyLong());
        }
    }


    /**
     * Tests d'intégration pour UserController
     */    
    @Nested
    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("Tests d'intégration pour UserController")
    class IntegrationTests {
        @Autowired
        private MockMvc mockMvc;
        
        @Autowired
        private UserRepository userRepository;
        
        private User testUser;
        
        @BeforeEach
        void setUp() {
            // Nettoyage des données avant chaque test
            userRepository.deleteAll();
            
            // Création d'un utilisateur de test
            testUser = new User();
            testUser.setEmail("user@test.com");
            testUser.setLastName("Nom");
            testUser.setFirstName("Prénom");
            testUser.setPassword("password");
            testUser.setAdmin(false);
            
            testUser = userRepository.save(testUser);
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage après chaque test
            userRepository.deleteAll();
        }
        
        @Test
        @DisplayName("findById - Doit retourner l'utilisateur lorsqu'il existe")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnUser_WhenUserExists() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/user/{id}", testUser.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(testUser.getId()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.email").value(testUser.getEmail()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value(testUser.getLastName()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value(testUser.getFirstName()));
        }
        
        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand l'utilisateur n'existe pas")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/user/{id}", 999L))
                    .andExpect(MockMvcResultMatchers.status().isNotFound());
        }
        
        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/user/{id}", "invalidId"))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest());
        }
        
        @Test
        @DisplayName("delete - Doit supprimer l'utilisateur et retourner OK quand l'utilisateur existe et est authentifié")
        @WithMockUser(username = "user@test.com")
        @Transactional
        void delete_ShouldDeleteUserAndReturnOk_WhenUserExistsAndIsAuthenticated() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/user/{id}", testUser.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk());
            
            // Vérification que l'utilisateur a bien été supprimé
            assertFalse(userRepository.findById(testUser.getId()).isPresent());
        }
        
        @Test
        @DisplayName("delete - Doit retourner NOT_FOUND quand l'utilisateur n'existe pas")
        @WithMockUser(username = "user@test.com")
        void delete_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/user/{id}", 999L))
                    .andExpect(MockMvcResultMatchers.status().isNotFound());
        }
        
        @Test
        @DisplayName("delete - Doit retourner UNAUTHORIZED quand l'utilisateur n'est pas le même que l'utilisateur authentifié")
        @WithMockUser(username = "different@test.com")
        void delete_ShouldReturnUnauthorized_WhenUserIsNotTheSameAsAuthenticatedUser() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/user/{id}", testUser.getId()))
                    .andExpect(MockMvcResultMatchers.status().isUnauthorized());
            
            // Vérification que l'utilisateur n'a pas été supprimé
            assertTrue(userRepository.findById(testUser.getId()).isPresent());
        }
        
        @Test
        @DisplayName("delete - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        @WithMockUser(username = "user@test.com")
        void delete_ShouldReturnBadRequest_WhenIdIsNotANumber() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.delete("/api/user/{id}", "invalidId"))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest());
        }
    }
}
