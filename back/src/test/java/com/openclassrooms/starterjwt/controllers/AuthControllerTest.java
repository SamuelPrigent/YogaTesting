package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
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
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour AuthController
 */
public class AuthControllerTest {

    @Nested
    @DisplayName("Tests unitaires")
    class UnitTests {
        @Mock
        private AuthenticationManager authenticationManager;

        @Mock
        private JwtUtils jwtUtils;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private UserRepository userRepository;

        @Mock
        private Authentication authentication;

        @Mock
        private UserDetailsImpl userDetails;

        @InjectMocks
        private AuthController authController;

        private LoginRequest loginRequest;
        private SignupRequest signupRequest;
        private User testUser;

        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);

            // Préparation des requêtes de test
            loginRequest = new LoginRequest();
            loginRequest.setEmail("user@test.com");
            loginRequest.setPassword("password");

            signupRequest = new SignupRequest();
            signupRequest.setEmail("newuser@test.com");
            signupRequest.setFirstName("Prénom");
            signupRequest.setLastName("Nom");
            signupRequest.setPassword("password");

            testUser = new User();
            testUser.setId(1L);
            testUser.setEmail("user@test.com");
            testUser.setFirstName("Prénom");
            testUser.setLastName("Nom");
            testUser.setPassword("encodedPassword");
            testUser.setAdmin(false);
        }

        @Test
        @DisplayName("authenticateUser - Doit retourner un JWT lorsque l'authentification réussit")
        void authenticateUser_ShouldReturnJwt_WhenAuthenticationSucceeds() {
            // Préparation
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(userDetails);
            when(jwtUtils.generateJwtToken(authentication)).thenReturn("testJwtToken");
            when(userDetails.getId()).thenReturn(1L);
            when(userDetails.getUsername()).thenReturn("user@test.com");
            when(userDetails.getFirstName()).thenReturn("Prénom");
            when(userDetails.getLastName()).thenReturn("Nom");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));

            // Exécution
            ResponseEntity<?> response = authController.authenticateUser(loginRequest);

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody(), "La réponse ne devrait pas être null");
            assertTrue(response.getBody() instanceof JwtResponse, "La réponse devrait être une instance de JwtResponse");
            JwtResponse jwtResponse = (JwtResponse) response.getBody();
            assertNotNull(jwtResponse, "JwtResponse ne devrait pas être null");
            assertEquals("testJwtToken", jwtResponse.getToken());
            assertEquals(1L, jwtResponse.getId());
            assertEquals("user@test.com", jwtResponse.getUsername());
            assertEquals("Prénom", jwtResponse.getFirstName());
            assertEquals("Nom", jwtResponse.getLastName());
            assertEquals(false, jwtResponse.getAdmin());

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtUtils).generateJwtToken(authentication);
            verify(userRepository).findByEmail("user@test.com");
        }

        @Test
        @DisplayName("authenticateUser - Doit gérer le cas où l'utilisateur n'est pas trouvé après authentification")
        void authenticateUser_ShouldHandleUserNotFound_AfterAuthentication() {
            // Préparation
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authentication);
            when(authentication.getPrincipal()).thenReturn(userDetails);
            when(jwtUtils.generateJwtToken(authentication)).thenReturn("testJwtToken");
            when(userDetails.getId()).thenReturn(1L);
            when(userDetails.getUsername()).thenReturn("user@test.com");
            when(userDetails.getFirstName()).thenReturn("Prénom");
            when(userDetails.getLastName()).thenReturn("Nom");
            when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.empty());

            // Exécution
            ResponseEntity<?> response = authController.authenticateUser(loginRequest);

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody(), "La réponse ne devrait pas être null");
            assertTrue(response.getBody() instanceof JwtResponse, "La réponse devrait être une instance de JwtResponse");
            JwtResponse jwtResponse = (JwtResponse) response.getBody();
            assertNotNull(jwtResponse, "JwtResponse ne devrait pas être null");
            assertEquals("testJwtToken", jwtResponse.getToken());
            assertEquals(1L, jwtResponse.getId());
            assertEquals("user@test.com", jwtResponse.getUsername());
            assertEquals("Prénom", jwtResponse.getFirstName());
            assertEquals("Nom", jwtResponse.getLastName());
            assertEquals(false, jwtResponse.getAdmin()); // isAdmin devrait être false par défaut;
            assertEquals("Prénom", jwtResponse.getFirstName());
            assertEquals("Nom", jwtResponse.getLastName());
            assertEquals(false, jwtResponse.getAdmin()); // isAdmin devrait être false par défaut

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtUtils).generateJwtToken(authentication);
            verify(userRepository).findByEmail("user@test.com");
        }

        @Test
        @DisplayName("registerUser - Doit enregistrer un nouvel utilisateur lorsque l'email n'est pas pris")
        void registerUser_ShouldRegisterNewUser_WhenEmailIsNotTaken() {
            // Préparation
            when(userRepository.existsByEmail("newuser@test.com")).thenReturn(false);
            when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
            doAnswer(invocation -> {
                User savedUser = invocation.getArgument(0);
                savedUser.setId(1L);
                return savedUser;
            }).when(userRepository).save(any(User.class));

            // Exécution
            ResponseEntity<?> response = authController.registerUser(signupRequest);

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody(), "La réponse ne devrait pas être null");
            assertTrue(response.getBody() instanceof MessageResponse, "La réponse devrait être une instance de MessageResponse");
            MessageResponse messageResponse = (MessageResponse) response.getBody();
            assertNotNull(messageResponse, "MessageResponse ne devrait pas être null");
            assertEquals("User registered successfully!", messageResponse.getMessage());

            verify(userRepository).existsByEmail("newuser@test.com");
            verify(passwordEncoder).encode("password");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("registerUser - Doit retourner une erreur lorsque l'email est déjà pris")
        void registerUser_ShouldReturnError_WhenEmailIsAlreadyTaken() {
            // Préparation
            when(userRepository.existsByEmail("newuser@test.com")).thenReturn(true);

            // Exécution
            ResponseEntity<?> response = authController.registerUser(signupRequest);

            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody(), "La réponse ne devrait pas être null");
            assertTrue(response.getBody() instanceof MessageResponse, "La réponse devrait être une instance de MessageResponse");
            MessageResponse messageResponse = (MessageResponse) response.getBody();
            assertNotNull(messageResponse, "MessageResponse ne devrait pas être null");
            assertEquals("Error: Email is already taken!", messageResponse.getMessage());

            verify(userRepository).existsByEmail("newuser@test.com");
            verify(passwordEncoder, never()).encode(anyString());
            verify(userRepository, never()).save(any(User.class));
        }
    }
    
    @Nested
    @SpringBootTest
    @AutoConfigureMockMvc(addFilters = false) // Désactive les filtres de sécurité pour les tests d'intégration
    @Transactional
    @WithMockUser(username = "test@example.com", password = "password")
    @DisplayName("Tests d'intégration pour AuthController")
    class IntegrationTests {
        @Autowired
        private WebApplicationContext context;
        
        private MockMvc mockMvc;
        
        @Autowired
        private UserRepository userRepository;
        
        @Autowired
        private PasswordEncoder passwordEncoder;
        
        @Autowired
        private ObjectMapper objectMapper;
        
        private User testUser;
        private LoginRequest loginRequest;
        private SignupRequest signupRequest;
        
        @BeforeEach
        void setUp() {
            // Configuration de MockMvc avec la sécurité
            mockMvc = MockMvcBuilders
                    .webAppContextSetup(context)
                    .apply(SecurityMockMvcConfigurers.springSecurity())
                    .build();
                    
            // Préparation des données de test
            testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setFirstName("Test");
            testUser.setLastName("User");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setAdmin(false);
            
            // Sauvegarder l'utilisateur pour les tests de login
            if (!userRepository.existsByEmail(testUser.getEmail())) {
                testUser = userRepository.save(testUser);
            }
            
            // Préparer la requête de login
            loginRequest = new LoginRequest();
            loginRequest.setEmail("test@example.com");
            loginRequest.setPassword("password");
            
            // Préparer la requête d'inscription
            signupRequest = new SignupRequest();
            signupRequest.setEmail("newuser@example.com");
            signupRequest.setFirstName("New");
            signupRequest.setLastName("User");
            signupRequest.setPassword("password");
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage des données de test pour éviter des conflits entre les tests
            try {
                if (userRepository.existsByEmail("newuser@example.com")) {
                    User user = userRepository.findByEmail("newuser@example.com").orElse(null);
                    if (user != null) {
                        userRepository.deleteById(user.getId());
                    }
                }
            } catch (Exception e) {
                // Logger l'erreur mais permettre aux tests de continuer
                System.err.println("Erreur lors du nettoyage des données de test: " + e.getMessage());
            }
        }
        
        @Test
        @DisplayName("login - Doit retourner un JWT lorsque les informations d'identification sont correctes")
        void login_ShouldReturnJwt_WhenCredentialsAreCorrect() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.token").exists())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("test@example.com"))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Test"))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("User"));
        }
        
        @Test
        @DisplayName("login - Doit retourner 401 lorsque les informations d'identification sont incorrectes")
        void login_ShouldReturn401_WhenCredentialsAreIncorrect() throws Exception {
            // Préparation d'une requête avec mot de passe incorrect
            LoginRequest badRequest = new LoginRequest();
            badRequest.setEmail("test@example.com");
            badRequest.setPassword("wrongpassword");
            
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(badRequest)))
                    .andExpect(MockMvcResultMatchers.status().isUnauthorized());
        }
        
        @Test
        @DisplayName("register - Doit créer un nouvel utilisateur lorsque l'email n'est pas déjà utilisé")
        void register_ShouldCreateNewUser_WhenEmailIsNotInUse() throws Exception {
            // S'assurer que l'utilisateur n'existe pas avant le test
            if (userRepository.existsByEmail("newuser@example.com")) {
                User existingUser = userRepository.findByEmail("newuser@example.com").orElse(null);
                if (existingUser != null) {
                    userRepository.deleteById(existingUser.getId());
                }
            }
            
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signupRequest)))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("User registered successfully!"));
            
            // Vérifier que l'utilisateur existe maintenant dans la base de données
            assertTrue(userRepository.existsByEmail("newuser@example.com"));
        }
        
        @Test
        @DisplayName("register - Doit retourner une erreur lorsque l'email est déjà utilisé")
        void register_ShouldReturnError_WhenEmailIsAlreadyInUse() throws Exception {
            // Utiliser l'email d'un utilisateur existant
            signupRequest.setEmail("test@example.com");
            
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(signupRequest)))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest())
                    .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Error: Email is already taken!"));
        }
    }
}
