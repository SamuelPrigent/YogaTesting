package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        // Configuration des objets pour les tests
        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");

        session = new Session();
        session.setId(3L);
        session.setName("Test Session");
        session.setDescription("Test Description");
        session.setUsers(new ArrayList<>());
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testCreate() {
        // Arrange
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        // Act
        Session createdSession = sessionService.create(session);
        // Assert
        assertNotNull(createdSession);
        assertEquals(session, createdSession);
        verify(sessionRepository, times(1)).save(any(Session.class));
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testDelete() {
        // Act
        sessionService.delete(1L);
        // Assert
        verify(sessionRepository, times(1)).deleteById(1L);
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testFindAll() {
        // Arrange
        List<Session> sessions = Arrays.asList(session);
        when(sessionRepository.findAll()).thenReturn(sessions);
        // Act
        List<Session> result = sessionService.findAll();
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(sessionRepository, times(1)).findAll();
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testGetById_Found() {
        // Arrange
        when(sessionRepository.findById(3L)).thenReturn(Optional.of(session));
        // Act
        Session result = sessionService.getById(3L);
        // Assert
        assertNotNull(result);
        assertEquals(session.getId(), result.getId());
        verify(sessionRepository, times(1)).findById(3L);
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testGetById_NotFound() {
        // Arrange
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());
        // Act
        Session result = sessionService.getById(999L);
        // Assert
        assertNull(result);
        verify(sessionRepository, times(1)).findById(999L);
    }

    // Check appel + affectation ID
    @Test
    void testUpdate() {
        // Arrange
        Session updatedSession = new Session();
        updatedSession.setName("New session value");
        updatedSession.setDescription("New desc value");
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> {
            Session savedSession = invocation.getArgument(0);
            return savedSession;
        });
        // Act
        Session result = sessionService.update(3L, updatedSession);
        // Assert
        assertNotNull(result);
        assertEquals(3L, result.getId());
        assertEquals("New session value", result.getName());
        assertEquals("New desc value", result.getDescription());        
        verify(sessionRepository, times(1)).save(any(Session.class));
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testParticipate_Success() {
        // Arrange
        // Mock d'une réponse avec une session valide
        when(sessionRepository.findById(3L)).thenReturn(Optional.of(session));
        // Mock d'une réponse avec un utilisateur valide
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // Act
        sessionService.participate(3L, 1L);
        // Assert
        verify(sessionRepository, times(1)).findById(3L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
        assertEquals(1, session.getUsers().size());
        assertEquals(user.getId(), session.getUsers().get(0).getId());
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testParticipate_SessionNotFound() {
        // Arrange
        // Mock d'une réponse où aucune session n'est trouvée
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());
        // Mock d'une réponse où l'utilisateur est considéré comme valide
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            sessionService.participate(999L, 1L);
        });
        verify(sessionRepository, times(1)).findById(999L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testParticipate_UserNotFound() {
        // Arrange
        // Mock réponse object de session considéré comme valide
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.of(session));
        // Mock d'une réponse ou l'on ne trouve pas d'utilisateur on attend une erreur NotFoundException
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            // on ajoute un participant qui n'éxiste pas
            sessionService.participate(3L, 999L);
        });
        // check calls 
        verify(sessionRepository, times(1)).findById(3L);
        verify(userRepository, times(1)).findById(999L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Check appel + comportement logique métier (conditions) TODO
    @Test
    void testParticipate_AlreadyParticipating() {
        // Arrange
        // On ajoute l'utilisateur à la session pour simuler qu'il participe déjà
        session.getUsers().add(user);
        // Mock d'une réponse avec une session valide contenant déjà l'utilisateur
        when(sessionRepository.findById(3L)).thenReturn(Optional.of(session));
        // Mock d'une réponse avec un utilisateur valide
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            sessionService.participate(3L, 1L);
        });
        verify(sessionRepository, times(1)).findById(3L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testNoLongerParticipate_Success() {
        // Arrange
        // On ajoute l'utilisateur à la session pour simuler sa participation initiale
        session.getUsers().add(user);
        // Mock d'une réponse avec une session valide contenant l'utilisateur
        when(sessionRepository.findById(3L)).thenReturn(Optional.of(session));
        // Act
        sessionService.noLongerParticipate(3L, 1L);
        // Assert
        verify(sessionRepository, times(1)).findById(3L);
        verify(sessionRepository, times(1)).save(session);
        assertEquals(0, session.getUsers().size());
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testNoLongerParticipate_SessionNotFound() {
        // Arrange
        // Mock d'une réponse où aucune session n'est trouvée
        when(sessionRepository.findById(anyLong())).thenReturn(Optional.empty());
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            sessionService.noLongerParticipate(999L, 1L);
        });
        verify(sessionRepository, times(1)).findById(999L);
        verify(sessionRepository, never()).save(any(Session.class));
    }

    // Check appel + comportement logique métier (conditions)
    @Test
    void testNoLongerParticipate_NotParticipating() {
        // Arrange
        // Aucun utilisateur ne participe (on n'en a pas spécifié)
        // Mock d'une réponse avec une session valide sans l'utilisateur dedans
        when(sessionRepository.findById(3L)).thenReturn(Optional.of(session));
        // Act & Assert -- on essaye d'enlever le participant
        assertThrows(BadRequestException.class, () -> {
            sessionService.noLongerParticipate(3L, 1L);
        });
        verify(sessionRepository, times(1)).findById(3L);
        verify(sessionRepository, never()).save(any(Session.class));
    }
}
