package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

public class UserDetailsImplTest {

    private UserDetailsImpl userDetails;
    private UserDetailsImpl sameUserDetails;
    private UserDetailsImpl differentUserDetails;

    @BeforeEach
    void setUp() {
        // Configuration des objets pour les tests
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("user@test.com")
                .firstName("Jean")
                .lastName("Dupont")
                .password("password123")
                .admin(false)
                .build();

        // Même ID que userDetails pour tester equals
        sameUserDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("different@test.com") // différent username mais même ID
                .firstName("Pierre")
                .lastName("Martin")
                .password("differentpassword")
                .admin(true)
                .build();

        // ID différent pour tester equals
        differentUserDetails = UserDetailsImpl.builder()
                .id(2L)
                .username("user@test.com") // même username mais ID différent
                .firstName("Jean")
                .lastName("Dupont")
                .password("password123")
                .admin(false)
                .build();
    }

    // Test de la méthode equals() lorsque c'est le même objet
    @Test
    void testEquals_SameObject() {
        // Arrange - Utilisation de la même instance
        // Act & Assert
        // Vérification que l'objet est égal à lui-même
        assertTrue(userDetails.equals(userDetails));
    }

    // Test de la méthode equals() avec null
    @Test
    void testEquals_Null() {
        // Arrange - Comparaison avec null
        // Act & Assert
        // Vérification que l'objet n'est pas égal à null
        assertFalse(userDetails.equals(null));
    }

    // Test de la méthode equals() avec un type différent
    @Test
    void testEquals_DifferentType() {
        // Arrange - Comparaison avec un objet de type différent
        // Act & Assert
        // Vérification que l'objet n'est pas égal à un objet d'un autre type
        assertFalse(userDetails.equals(new Object()));
    }

    // Test de la méthode equals() avec un objet ayant uniquement le même ID en commun
    @Test
    void testEquals_SameId() {
        // Arrange - Deux objets différents mais même ID
        // Act & Assert
        // Vérification que deux objets avec le même ID sont considérés comme égaux
        assertTrue(userDetails.equals(sameUserDetails));
    }

    // Test de la méthode equals() avec un objet ayant un ID différent
    @Test
    void testEquals_DifferentId() {
        // Arrange - Deux objets avec IDs différents
        // Act & Assert
        // Vérification que deux objets avec des IDs différents ne sont pas égaux
        assertFalse(userDetails.equals(differentUserDetails));
    }

    // Test de la méthode getAuthorities()
    @Test
    void testGetAuthorities() {
        // Arrange - Déjà fait dans setUp()
        // Act
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        // Assert
        // Vérification que la collection des autorités est vide
        assertNotNull(authorities);
        assertTrue(authorities.isEmpty());
    }

    // Test de la méthode isAccountNonExpired()
    @Test
    void testIsAccountNonExpired() {
        // Arrange - Déjà fait dans setUp()
        // Act & Assert
        // Vérification que le compte n'est jamais expiré (renvoie toujours true)
        assertTrue(userDetails.isAccountNonExpired());
    }

    // Test de la méthode isAccountNonLocked()
    @Test
    void testIsAccountNonLocked() {
        // Arrange - Déjà fait dans setUp()
        // Act & Assert
        // Vérification que le compte n'est jamais verrouillé (renvoie toujours true)
        assertTrue(userDetails.isAccountNonLocked());
    }

    // Test de la méthode isCredentialsNonExpired()
    @Test
    void testIsCredentialsNonExpired() {
        // Arrange - Déjà fait dans setUp()
        // Act & Assert
        // Vérification que les credentials ne sont jamais expirés (renvoie toujours true)
        assertTrue(userDetails.isCredentialsNonExpired());
    }

    // Test de la méthode isEnabled()
    @Test
    void testIsEnabled() {
        // Arrange - Déjà fait dans setUp()
        // Act & Assert
        // Vérification que le compte est toujours activé (renvoie toujours true)
        assertTrue(userDetails.isEnabled());
    }
}
