package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User user;

    @BeforeEach
    void setUp() {
        // Configuration d'un objet user pour les tests
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setFirstName("Jean");
        user.setLastName("Dupont");
        user.setPassword("password123");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }

    // Test si la méthode loadUserByUsername retourne correctement un UserDetails lorsque l'utilisateur existe
    @Test
    void testLoadUserByUsername_Success() {
        // Arrange
        // Mock d'une réponse avec un utilisateur valide pour l'email indiqué
        // On s'attend à ce que la méthode loadUserByUsername() retourne un UserDetailsImpl avec les mêmes infos que l'utilisateur
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        
        // Act
        UserDetails result = userDetailsService.loadUserByUsername("user@test.com");
        
        // Assert
        // Vérification que le résultat n'est pas null et qu'il s'agit bien d'un UserDetailsImpl
        assertNotNull(result);
        assertTrue(result instanceof UserDetailsImpl);
        
        // Conversion en UserDetailsImpl pour vérifier les propriétés
        UserDetailsImpl userDetails = (UserDetailsImpl) result;
        
        // Vérification que les propriétés de l'userDetails correspondent à celles de l'utilisateur
        assertEquals(user.getId(), userDetails.getId());
        assertEquals(user.getEmail(), userDetails.getUsername());
        assertEquals(user.getFirstName(), userDetails.getFirstName());
        assertEquals(user.getLastName(), userDetails.getLastName());
        assertEquals(user.getPassword(), userDetails.getPassword());
        
        // Vérification que la méthode findByEmail du repository a été appelée exactement une fois
        verify(userRepository, times(1)).findByEmail("user@test.com");
    }

    // Test si la méthode loadUserByUsername lance l'exception appropriée lorsque l'utilisateur n'est pas trouvé
    @Test
    void testLoadUserByUsername_UserNotFound() {
        // Arrange
        // Mock d'une réponse où aucun utilisateur n'est trouvé pour l'email indiqué
        // Le repository renvoie Optional.empty() et on s'attend à ce que la méthode lance une exception
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        
        // Act & Assert
        // Vérification que la méthode lance bien une exception UsernameNotFoundException
        Exception exception = assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername("unknown@test.com");
        });
        
        // Vérification du message d'erreur
        String expectedMessage = "User Not Found with email: unknown@test.com";
        String actualMessage = exception.getMessage();
        assertTrue(actualMessage.contains(expectedMessage));
        
        // Vérification que la méthode findByEmail du repository a été appelée exactement une fois
        verify(userRepository, times(1)).findByEmail("unknown@test.com");
    }
}
