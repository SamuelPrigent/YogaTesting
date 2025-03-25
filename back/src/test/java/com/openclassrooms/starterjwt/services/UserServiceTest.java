package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        // Configuration d'un objet user pour les tests
        user = new User();
        user.setId(1L); // ID 1L pour l'utilisateur, différent de l'ID 2L pour teacher et 3L pour session
        user.setEmail("user@test.com");
        user.setFirstName("Pierre");
        user.setLastName("Dupont");
        user.setPassword("password123");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }

    // Check si l'appel est fait avec bon arguments et si l'utilisateur est correctement supprimé
    @Test
    void testDelete() {
        // Arrange
        // Aucune configuration de mock spécifique nécessaire pour cette méthode
        // On s'attend simplement à ce que la méthode deleteById() du repository soit appelée avec l'ID correct
        // Act
        userService.delete(1L);
        // Assert
        // Vérification que la méthode deleteById() du repository a été appelée exactement une fois avec l'ID 1L
        verify(userRepository, times(1)).deleteById(1L);
    }

    // Check si l'appel est fait avec bon arguments et si l'objet est correctement retourné quand trouvé
    @Test
    void testFindById_Found() {
        // Arrange
        // Mock d'une réponse avec un utilisateur valide pour l'ID 1L
        // On s'attend à ce que la méthode findById() du service retourne cet utilisateur
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // Act
        User result = userService.findById(1L);
        // Assert
        // Vérification que le résultat n'est pas null
        assertNotNull(result);
        // Vérification que les propriétés de l'utilisateur retourné correspondent à celles du mock
        assertEquals(user, result);
        // Vérification que la méthode findById() du repository a été appelée exactement une fois avec l'ID 1L
        verify(userRepository, times(1)).findById(1L);
    }

    // Check si l'appel est fait avec bon arguments et si null est retourné quand l'utilisateur n'existe pas
    @Test
    void testFindById_NotFound() {
        // Arrange
        // Mock d'une réponse où aucun utilisateur n'est trouvé pour l'ID 999L
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        // Act
        User result = userService.findById(999L);
        // Assert
        // Vérification que le résultat est null, ce qui indique que l'utilisateur n'a pas été trouvé
        assertNull(result);
        // Vérification que la méthode findById() du repository a été appelée exactement une fois avec l'ID 999L
        verify(userRepository, times(1)).findById(999L);
    }
}
