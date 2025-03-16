package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Tests pour JwtUtils
 * Contient à la fois des tests unitaires (tout est mocké) et des tests d'intégration (utilisation du contexte Spring)
 */
class JwtUtilsTest {

    // ========= TESTS UNITAIRES =========
    @Nested
    @ExtendWith(MockitoExtension.class)
    class UnitTests {

        @InjectMocks
        private JwtUtils jwtUtils;

        @Mock
        private Authentication authentication;

        @Mock
        private UserDetailsImpl userDetails;

        private final String testSecret = "testSecretKeyWithMinimum512BitsRequiredForHS512Algorithm0123456789";
        private final int testExpirationMs = 60000; // 1 minute
        private final String username = "test@test.com";

        @BeforeEach
        void setUp() {
            // Injecter nos valeurs de test dans JwtUtils
            ReflectionTestUtils.setField(jwtUtils, "jwtSecret", testSecret);
            ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);
            
            // Pas de configuration des mocks ici pour éviter UnnecessaryStubbingException
            // Les mocks seront configurés spécifiquement dans les tests qui en ont besoin
        }

        @Nested
        @DisplayName("Tests de génération de token JWT")
        class GenerateJwtTokenTests {
            
            @Test
            @DisplayName("Doit générer un token JWT valide avec le bon username")
            void shouldGenerateValidToken() {
                // Configuration spécifique des mocks nécessaires pour ce test
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userDetails.getUsername()).thenReturn(username);
                
                // Exécution
                String token = jwtUtils.generateJwtToken(authentication);
                
                // Vérifications
                assertNotNull(token);
                assertFalse(token.isEmpty());
                assertEquals(username, jwtUtils.getUserNameFromJwtToken(token));
                assertTrue(jwtUtils.validateJwtToken(token));
            }
        }

        @Nested
        @DisplayName("Tests d'extraction du nom d'utilisateur depuis le token")
        class GetUserNameFromJwtTokenTests {
            
            @Test
            @DisplayName("Doit extraire le bon nom d'utilisateur du token")
            void shouldExtractCorrectUsername() {
                // Configuration spécifique des mocks nécessaires pour ce test
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userDetails.getUsername()).thenReturn(username);
                
                // Préparation
                String token = jwtUtils.generateJwtToken(authentication);
                
                // Exécution
                String extractedUsername = jwtUtils.getUserNameFromJwtToken(token);
                
                // Vérification
                assertEquals(username, extractedUsername);
            }
        }

        @Nested
        @DisplayName("Tests de validation de token JWT")
        class ValidateJwtTokenTests {
            
            @Test
            @DisplayName("Doit valider un token JWT correctement généré")
            void shouldValidateCorrectToken() {
                // Configuration spécifique des mocks nécessaires pour ce test
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userDetails.getUsername()).thenReturn(username);
                
                // Préparation
                String token = jwtUtils.generateJwtToken(authentication);
                
                // Exécution et vérification
                assertTrue(jwtUtils.validateJwtToken(token));
            }
            
            @Test
            @DisplayName("Doit rejeter un token JWT mal formé")
            void shouldRejectMalformedToken() {
                // Préparation
                String malformedToken = "malformed.jwt.token";
                
                // Exécution et vérification
                assertFalse(jwtUtils.validateJwtToken(malformedToken));
            }
            
            @Test
            @DisplayName("Doit rejeter un token JWT avec signature invalide")
            void shouldRejectTokenWithInvalidSignature() {
                // Configuration spécifique des mocks nécessaires pour ce test
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userDetails.getUsername()).thenReturn(username);
                
                // Préparation
                String token = jwtUtils.generateJwtToken(authentication);
                
                // Note: On modifie carrément le payload pour être sûr que la signature ne puisse plus correspondre
                // Format JWT: header.payload.signature
                String[] parts = token.split("\\.");
                if (parts.length >= 3) { // Vérification que le token a bien les 3 parties attendues
                    // Modification du payload (partie centrale) pour invalider la signature
                    parts[1] = parts[1].substring(0, parts[1].length() - 5) + "XXXXX";
                    String tamperedToken = parts[0] + "." + parts[1] + "." + parts[2];
                    
                    // Exécution et vérification : le token falsifié doit être rejeté
                    assertFalse(jwtUtils.validateJwtToken(tamperedToken));
                } else {
                    fail("Le token JWT généré n'a pas le format attendu (header.payload.signature)");
                }
            }
            
            @Test
            @DisplayName("Doit rejeter un token JWT expiré")
            void shouldRejectExpiredToken() throws Exception {
                // Configuration spécifique des mocks nécessaires pour ce test
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userDetails.getUsername()).thenReturn(username);
                
                // Préparation - définir une expiration négative pour créer un token déjà expiré
                ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -60000); // -1 minute
                String expiredToken = jwtUtils.generateJwtToken(authentication);
                
                // Remettre l'expiration à la valeur de test normale
                ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);
                
                // Exécution et vérification
                assertFalse(jwtUtils.validateJwtToken(expiredToken));
            }
            
            @Test
            @DisplayName("Doit rejeter un token JWT vide")
            void shouldRejectEmptyToken() {
                // Exécution et vérification
                assertFalse(jwtUtils.validateJwtToken(""));
            }
            
            @Test
            @DisplayName("Doit rejeter un token JWT null")
            void shouldRejectNullToken() {
                // Exécution et vérification
                assertFalse(jwtUtils.validateJwtToken(null));
            }

            /**
             * Note sur la couverture de test :
             * Le cas de UnsupportedJwtException n'est pas testé car l'algorithme 
             * de validation JWT provient d'une bibliothèque externe et pas de notre code.
             * Cette exception est gérée par la bibliothèque JWT elle-même dans des 
             * circonstances très spécifiques qui sortent du cadre de nos tests unitaires.
             */
        }
    }

    // ========= TESTS D'INTÉGRATION =========
    @Nested
    @SpringBootTest(properties = {
        "jwt.secret=testSecretKeyWithMinimum512BitsRequiredForHS512Algorithm0123456789",
        "jwt.expirationMs=60000"
    })
    @ActiveProfiles("test") // Assure l'utilisation du profil de test
    class IntegrationTests {
    
        @Autowired
        private JwtUtils jwtUtils;
        
        private Authentication authentication;
        private final String email = "test@example.com";
        
        @BeforeEach
        void setUp() {
            // Création d'un vrai objet UserDetails (pas de mock)
            UserDetailsImpl userDetails = UserDetailsImpl.builder()
                    .id(1L)
                    .username(email)
                    .firstName("Test")
                    .lastName("User")
                    .password("password")
                    .admin(false)
                    .build();
                    
            // Création d'un vrai objet Authentication
            authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, new ArrayList<>());
        }
        
        @Test
        @DisplayName("Test d'intégration - Génération et validation de token")
        void testIntegration_GenerateAndValidateToken() {
            // Exécution - Génération d'un token JWT avec un vrai JwtUtils (contexte Spring)
            String token = jwtUtils.generateJwtToken(authentication);
            
            // Vérifications
            assertNotNull(token);
            assertFalse(token.isEmpty());
            
            // Extraction du username avec un vrai JwtUtils (contexte Spring)
            String extractedUsername = jwtUtils.getUserNameFromJwtToken(token);
            assertEquals(email, extractedUsername);
            
            // Validation du token avec un vrai JwtUtils (contexte Spring)
            assertTrue(jwtUtils.validateJwtToken(token));
        }
        
        @Test
        @DisplayName("Test d'intégration - Rejet de token invalide")
        void testIntegration_RejectInvalidToken() {
            // Préparation - Token mal formé
            String malformedToken = "invalid.jwt.token";
            
            // Exécution et vérification
            assertFalse(jwtUtils.validateJwtToken(malformedToken));
        }
        
        @Test
        @DisplayName("Test d'intégration - Rejet de token expiré")
        void testIntegration_RejectExpiredToken() {
            // Préparation - Réduire temporairement l'expiration pour créer un token expiré
            Integer originalExpirationMs = (Integer) ReflectionTestUtils.getField(jwtUtils, "jwtExpirationMs");
            ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -60000); // -1 minute
            
            // Génération d'un token expiré
            String expiredToken = jwtUtils.generateJwtToken(authentication);
            
            // Restauration de la valeur d'expiration d'origine
            ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", originalExpirationMs);
            
            // Exécution et vérification
            assertFalse(jwtUtils.validateJwtToken(expiredToken));
        }
    }
}
