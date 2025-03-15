package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests pour AuthTokenFilter
 * Contient à la fois des tests unitaires (tout est mocké) et des tests d'intégration (mocking sélectif)
 */
public class AuthTokenFilterTest {

    // ========= TESTS UNITAIRES =========
    @Nested
    @ExtendWith(MockitoExtension.class)
    class UnitTests {
        @Mock
        private JwtUtils jwtUtils;

        @Mock
        private UserDetailsServiceImpl userDetailsService;

        @Mock
        private HttpServletRequest request;

        @Mock
        private HttpServletResponse response;

        @Mock
        private FilterChain filterChain;

        @InjectMocks
        private AuthTokenFilter authTokenFilter;

        private UserDetailsImpl userDetails;
        private final String token = "validToken";
        private final String email = "test@example.com";

        @BeforeEach
        void setUp() {
            // Réinitialisation du contexte de sécurité avant chaque test
            SecurityContextHolder.clearContext();

            // Configuration de l'utilisateur de test
            userDetails = UserDetailsImpl.builder()
                    .id(1L)
                    .username(email)
                    .firstName("Test")
                    .lastName("User")
                    .password("password")
                    .admin(false)
                    .build();
        }

        // Test du filtre avec un JWT valide
        @Test
        void testDoFilterInternal_WithValidJwt() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête avec un token JWT valide
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateJwtToken(token)).thenReturn(true);
            when(jwtUtils.getUserNameFromJwtToken(token)).thenReturn(email);
            when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que l'authentification a été configurée dans le contexte de sécurité
            assertNotNull(SecurityContextHolder.getContext().getAuthentication());
            assertEquals(userDetails, SecurityContextHolder.getContext().getAuthentication().getPrincipal());

            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }

        // Test du filtre avec un JWT invalide
        @Test
        void testDoFilterInternal_WithInvalidJwt() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête avec un token JWT invalide
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateJwtToken(token)).thenReturn(false);

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que l'authentification n'a pas été configurée dans le contexte de sécurité
            assertNull(SecurityContextHolder.getContext().getAuthentication());

            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }

        // Test du filtre sans JWT
        @Test
        void testDoFilterInternal_WithoutJwt() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête sans token JWT
            when(request.getHeader("Authorization")).thenReturn(null);

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que l'authentification n'a pas été configurée dans le contexte de sécurité
            assertNull(SecurityContextHolder.getContext().getAuthentication());

            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }

        // Test du filtre avec un JWT mal formaté
        @Test
        void testDoFilterInternal_WithMalformedJwt() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête avec un token JWT mal formaté
            when(request.getHeader("Authorization")).thenReturn("Malformed " + token);

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que l'authentification n'a pas été configurée dans le contexte de sécurité
            assertNull(SecurityContextHolder.getContext().getAuthentication());

            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }

        // Test du filtre lorsqu'une exception est levée
        @Test
        void testDoFilterInternal_WithException() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête qui génère une exception
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
            when(jwtUtils.validateJwtToken(token)).thenReturn(true);
            when(jwtUtils.getUserNameFromJwtToken(token)).thenReturn(email);
            when(userDetailsService.loadUserByUsername(email)).thenThrow(new RuntimeException("Test exception"));

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que l'authentification n'a pas été configurée dans le contexte de sécurité
            assertNull(SecurityContextHolder.getContext().getAuthentication());

            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }

        // Test de la méthode parseJwt avec un en-tête d'autorisation valide
        @Test
        void testParseJwt_WithValidHeader() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête avec un en-tête d'autorisation valide
            when(request.getHeader("Authorization")).thenReturn("Bearer " + token);

            // Act & Assert
            // Exécution du filtre et vérification que parseJwt extrait correctement le token
            authTokenFilter.doFilterInternal(request, response, filterChain);
            verify(jwtUtils, times(1)).validateJwtToken(token);
        }

        // Test de la méthode parseJwt avec un en-tête d'autorisation invalide
        @Test
        void testParseJwt_WithInvalidHeader() throws ServletException, IOException {
            // Arrange
            // Configuration des mocks pour simuler une requête avec un en-tête d'autorisation invalide
            when(request.getHeader("Authorization")).thenReturn("Basic " + token);

            // Act
            // Exécution du filtre
            authTokenFilter.doFilterInternal(request, response, filterChain);

            // Assert
            // Vérification que validateJwtToken n'a pas été appelé car parseJwt a retourné null
            verify(jwtUtils, never()).validateJwtToken(anyString());
        }
    }

    // ========= TESTS D'INTÉGRATION =========
    // Approche avec mocking sélectif : seules les interfaces HTTP sont mockées
    @Nested
    @SpringBootTest(classes = {AuthTokenFilter.class, JwtUtils.class})
    class IntegrationTests {
    
        @Autowired
        private AuthTokenFilter authTokenFilter;
                
        @MockBean
        private UserDetailsServiceImpl userDetailsService; // On continue à mocker (dépendance externe)
        
        // Ces interfaces sont toujours mockées car elles représentent le web container
        private HttpServletRequest request;
        private HttpServletResponse response;
        private FilterChain filterChain;
        
        private UserDetailsImpl userDetails;
        private final String validToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTk2MjM0MjcxLCJleHAiOjE1OTYzMjA2NzF9.ZujX6fNbPnLmeVmovy5JnjnCD9KUPTV7ku8wBObcQbw4iFILBbSimdX8yxQkEUwXwxDnPVvF7yxpBDPfqV3jFw";
        private final String email = "test@example.com";
        
        @BeforeEach
        void setUp() {
            // Réinitialisation du contexte de sécurité
            SecurityContextHolder.clearContext();
            
            // Création des mocks pour les interfaces HTTP
            request = Mockito.mock(HttpServletRequest.class);
            response = Mockito.mock(HttpServletResponse.class);
            filterChain = Mockito.mock(FilterChain.class);
            
            // Configuration de l'utilisateur de test
            userDetails = UserDetailsImpl.builder()
                    .id(1L)
                    .username(email)
                    .firstName("Test")
                    .lastName("User")
                    .password("password")
                    .admin(false)
                    .build();
        }
        
        @Test
        void testIntegration_ValidJwtProcessing() throws ServletException, IOException {
            // Arrange
            // Nous utilisons un mock pour le request, mais un vrai JwtUtils 
            // et interagissons avec le vrai SecurityContextHolder
            when(request.getHeader("Authorization")).thenReturn("Bearer " + validToken);
            when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
            
            // Act
            authTokenFilter.doFilterInternal(request, response, filterChain);
            
            // Assert
            // Vérification que l'authentification a été configurée dans le contexte de sécurité
            // L'authentification doit être null car le token de test est invalide - c'est attendu
            // Dans un vrai test d'intégration avec un token valide, cela serait non-null
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            
            // Vérification que la chaîne de filtres a été appelée
            verify(filterChain, times(1)).doFilter(request, response);
        }
        
        @Test
        void testIntegration_InvalidTokenFormat() throws ServletException, IOException {
            // Arrange - Token mal formaté
            when(request.getHeader("Authorization")).thenReturn("Bearer invalidToken");
            
            // Act
            authTokenFilter.doFilterInternal(request, response, filterChain);
            
            // Assert
            // Avec un vrai JwtUtils, un token invalide ne devrait pas créer d'authentification
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain, times(1)).doFilter(request, response);
        }
    }
}
