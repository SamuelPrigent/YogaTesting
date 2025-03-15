package com.openclassrooms.starterjwt.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.AuthenticationException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests pour AuthEntryPointJwt
 * Contient à la fois des tests unitaires (tout est mocké) et des tests d'intégration (composants réels)
 */
public class AuthEntryPointJwtTest {

    // ========= TESTS UNITAIRES =========
    @Nested
    @ExtendWith(MockitoExtension.class)
    class UnitTests {

        @Mock
        private HttpServletRequest request;

        @Mock
        private HttpServletResponse response;

        @Mock
        private AuthenticationException authException;

        @Mock
        private ServletOutputStream outputStream;

        @InjectMocks
        private AuthEntryPointJwt authEntryPointJwt;

        @BeforeEach
        void setUp() throws IOException {
            // Configuration des mocks pour les tests
            when(authException.getMessage()).thenReturn("Unauthorized test message");
            when(request.getServletPath()).thenReturn("/api/test");
            when(response.getOutputStream()).thenReturn(outputStream);
        }

        @Test
        @DisplayName("Doit configurer correctement la réponse HTTP pour une erreur d'authentification")
        void shouldConfigureResponseCorrectly() throws ServletException, IOException {
            // Exécution de la méthode à tester
            authEntryPointJwt.commence(request, response, authException);

            // Vérification que la réponse est correctement configurée
            verify(response).setContentType(MediaType.APPLICATION_JSON_VALUE);
            verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
        
        @Test
        @DisplayName("Doit envoyer des données JSON avec les informations d'erreur correctes")
        void shouldSendJsonWithCorrectErrorInfo() throws ServletException, IOException {
            // Créer un ByteArrayOutputStream pour capturer les données
            ByteArrayOutputStream capturedOutput = new ByteArrayOutputStream();
            when(response.getOutputStream()).thenReturn(new ServletOutputStream() {
                @Override
                public void write(int b) throws IOException {
                    capturedOutput.write(b);
                }
                
                @Override
                public boolean isReady() {
                    return true;
                }
                
                @Override
                public void setWriteListener(javax.servlet.WriteListener writeListener) {
                    // Non utilisé dans ce test
                }
            });
            
            // Exécution de la méthode commence
            authEntryPointJwt.commence(request, response, authException);
            
            // Récupérer et vérifier les données écrites
            String outputJson = capturedOutput.toString();
            Map<String, Object> errorMap = new ObjectMapper().readValue(outputJson, 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            
            // Vérification du contenu du Map
            assertEquals(HttpServletResponse.SC_UNAUTHORIZED, errorMap.get("status"));
            assertEquals("Unauthorized", errorMap.get("error"));
            assertEquals("Unauthorized test message", errorMap.get("message"));
            assertEquals("/api/test", errorMap.get("path"));
        }
        
        @Test
        @DisplayName("Doit gérer correctement les exceptions lors de l'écriture JSON")
        void shouldHandleJsonWriteException() throws ServletException, IOException {
            // Préparation - Configuration pour simuler une exception lors de l'écriture
            doThrow(new IOException("Test JSON write error"))
                .when(outputStream).write(any(byte[].class), anyInt(), anyInt());
            
            // Exécution et vérification que l'exception est propagée
            assertThrows(IOException.class, () -> 
                authEntryPointJwt.commence(request, response, authException));
        }
    }

    // ========= TESTS D'INTÉGRATION =========
    @Nested
    @SpringBootTest(classes = {AuthEntryPointJwt.class})
    class IntegrationTests {

        @Autowired
        private AuthEntryPointJwt authEntryPointJwt;

        private MockHttpServletRequest request;
        private MockHttpServletResponse response;
        private AuthenticationException authException;

        @BeforeEach
        void setUp() {
            // Création d'objets réels pour les tests
            request = new MockHttpServletRequest();
            response = new MockHttpServletResponse();
            authException = mock(AuthenticationException.class);

            // Configuration de la requête et de l'exception
            request.setServletPath("/api/test");
            when(authException.getMessage()).thenReturn("Unauthorized test message");
        }

        @Test
        @DisplayName("Doit générer une réponse JSON complète avec le statut 401")
        void shouldGenerateCompleteJsonResponse() throws ServletException, IOException {
            // Exécution de la méthode à tester
            authEntryPointJwt.commence(request, response, authException);

            // Vérification du statut HTTP et du type de contenu
            assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
            assertEquals(MediaType.APPLICATION_JSON_VALUE, response.getContentType());

            // Vérification du contenu JSON généré
            String responseBody = response.getContentAsString();
            ObjectMapper mapper = new ObjectMapper();
            // Utilisation de TypeReference pour une désérialisation correctement typée
            Map<String, Object> jsonResponse = mapper.readValue(responseBody, 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});

            // Vérification des champs du corps JSON
            assertEquals(HttpServletResponse.SC_UNAUTHORIZED, jsonResponse.get("status"));
            assertEquals("Unauthorized", jsonResponse.get("error"));
            assertEquals("Unauthorized test message", jsonResponse.get("message"));
            assertEquals("/api/test", jsonResponse.get("path"));
        }

        @Test
        @DisplayName("Doit traiter correctement un chemin de servlet différent")
        void shouldHandleDifferentServletPath() throws ServletException, IOException {
            // Configuration d'un chemin de servlet différent
            request.setServletPath("/api/auth/signin");

            // Exécution de la méthode à tester
            authEntryPointJwt.commence(request, response, authException);

            // Vérification du contenu JSON généré
            String responseBody = response.getContentAsString();
            ObjectMapper mapper = new ObjectMapper();
            // Utilisation de TypeReference pour une désérialisation correctement typée
            Map<String, Object> jsonResponse = mapper.readValue(responseBody, 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});

            // Vérification du chemin dans la réponse
            assertEquals("/api/auth/signin", jsonResponse.get("path"));
        }

        @Test
        @DisplayName("Doit traiter correctement un message d'erreur vide")
        void shouldHandleEmptyErrorMessage() throws ServletException, IOException {
            // Configuration d'un message d'erreur vide
            when(authException.getMessage()).thenReturn("");

            // Exécution de la méthode à tester
            authEntryPointJwt.commence(request, response, authException);

            // Vérification du contenu JSON généré
            String responseBody = response.getContentAsString();
            ObjectMapper mapper = new ObjectMapper();
            // Utilisation de TypeReference pour une désérialisation correctement typée
            Map<String, Object> jsonResponse = mapper.readValue(responseBody, 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});

            // Vérification que le message est vide
            assertEquals("", jsonResponse.get("message"));
        }
    }
}
