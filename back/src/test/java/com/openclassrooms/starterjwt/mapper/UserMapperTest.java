package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests pour UserMapper (unitaires et d'intégration)
 */
public class UserMapperTest {

    // ======= Tests Unitaires =======
    @Nested
    @SpringBootTest
    class UnitTests {
        @Autowired
        private UserMapper userMapper;
    
        @Test
        @DisplayName("Doit convertir un User en UserDto")
        void shouldMapEntityToDto() {
            // Préparation
            LocalDateTime now = LocalDateTime.now();
            User user = new User();
            user.setId(1L);
            user.setEmail("user@test.com");
            user.setLastName("Dupont");
            user.setFirstName("Jean");
            user.setPassword("password123");
            user.setAdmin(false);
            user.setCreatedAt(now);
            user.setUpdatedAt(now);
            
            // Exécution
            UserDto dto = userMapper.toDto(user);
            
            // Vérification
            assertNotNull(dto);
            assertEquals(user.getId(), dto.getId());
            assertEquals(user.getEmail(), dto.getEmail());
            assertEquals(user.getLastName(), dto.getLastName());
            assertEquals(user.getFirstName(), dto.getFirstName());
            assertEquals(user.getPassword(), dto.getPassword());
            assertEquals(user.getAdmin(), dto.getAdmin());
            assertEquals(user.getCreatedAt(), dto.getCreatedAt());
            assertEquals(user.getUpdatedAt(), dto.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Doit convertir un UserDto en User")
        void shouldMapDtoToEntity() {
            // Préparation
            LocalDateTime now = LocalDateTime.now();
            UserDto dto = new UserDto();
            dto.setId(1L);
            dto.setEmail("user@test.com");
            dto.setLastName("Dupont");
            dto.setFirstName("Jean");
            dto.setPassword("password123");
            dto.setAdmin(false);
            dto.setCreatedAt(now);
            dto.setUpdatedAt(now);
            
            // Exécution
            User entity = userMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(entity);
            assertEquals(dto.getId(), entity.getId());
            assertEquals(dto.getEmail(), entity.getEmail());
            assertEquals(dto.getLastName(), entity.getLastName());
            assertEquals(dto.getFirstName(), entity.getFirstName());
            assertEquals(dto.getPassword(), entity.getPassword());
            assertEquals(dto.getAdmin(), entity.getAdmin());
            assertEquals(dto.getCreatedAt(), entity.getCreatedAt());
            assertEquals(dto.getUpdatedAt(), entity.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Doit retourner null quand l'entité est null")
        void shouldReturnNullWhenEntityIsNull() {
            // Exécution
            UserDto result = userMapper.toDto((User) null);
            
            // Vérification
            assertNull(result);
        }
        
        @Test
        @DisplayName("Doit retourner null quand le DTO est null")
        void shouldReturnNullWhenDtoIsNull() {
            // Exécution
            User result = userMapper.toEntity((UserDto) null);
            
            // Vérification
            assertNull(result);
        }
        
        @Test
        @DisplayName("Doit convertir une liste de User en liste de UserDto")
        void shouldMapEntityListToDtoList() {
            // Préparation
            LocalDateTime now = LocalDateTime.now();
            
            User user1 = new User();
            user1.setId(1L);
            user1.setEmail("user1@test.com");
            user1.setLastName("Dupont");
            user1.setFirstName("Jean");
            user1.setPassword("password123");
            user1.setAdmin(false);
            user1.setCreatedAt(now);
            user1.setUpdatedAt(now);
            
            User user2 = new User();
            user2.setId(2L);
            user2.setEmail("user2@test.com");
            user2.setLastName("Martin");
            user2.setFirstName("Marie");
            user2.setPassword("password456");
            user2.setAdmin(true);
            user2.setCreatedAt(now);
            user2.setUpdatedAt(now);
            
            List<User> entities = Arrays.asList(user1, user2);
            
            // Exécution
            List<UserDto> dtos = userMapper.toDto(entities);
            
            // Vérification
            assertNotNull(dtos);
            assertEquals(2, dtos.size());
            assertEquals(user1.getId(), dtos.get(0).getId());
            assertEquals(user1.getEmail(), dtos.get(0).getEmail());
            assertEquals(user1.getLastName(), dtos.get(0).getLastName());
            assertEquals(user1.getFirstName(), dtos.get(0).getFirstName());
            assertEquals(user2.getId(), dtos.get(1).getId());
            assertEquals(user2.getEmail(), dtos.get(1).getEmail());
            assertEquals(user2.getLastName(), dtos.get(1).getLastName());
            assertEquals(user2.getFirstName(), dtos.get(1).getFirstName());
        }
        
        @Test
        @DisplayName("Doit convertir une liste de UserDto en liste de User")
        void shouldMapDtoListToEntityList() {
            // Préparation
            LocalDateTime now = LocalDateTime.now();
            
            UserDto dto1 = new UserDto();
            dto1.setId(1L);
            dto1.setEmail("user1@test.com");
            dto1.setLastName("Dupont");
            dto1.setFirstName("Jean");
            dto1.setPassword("password123");
            dto1.setAdmin(false);
            dto1.setCreatedAt(now);
            dto1.setUpdatedAt(now);
            
            UserDto dto2 = new UserDto();
            dto2.setId(2L);
            dto2.setEmail("user2@test.com");
            dto2.setLastName("Martin");
            dto2.setFirstName("Marie");
            dto2.setPassword("password456");
            dto2.setAdmin(true);
            dto2.setCreatedAt(now);
            dto2.setUpdatedAt(now);
            
            List<UserDto> dtos = Arrays.asList(dto1, dto2);
            
            // Exécution
            List<User> entities = userMapper.toEntity(dtos);
            
            // Vérification
            assertNotNull(entities);
            assertEquals(2, entities.size());
            assertEquals(dto1.getId(), entities.get(0).getId());
            assertEquals(dto1.getEmail(), entities.get(0).getEmail());
            assertEquals(dto1.getLastName(), entities.get(0).getLastName());
            assertEquals(dto1.getFirstName(), entities.get(0).getFirstName());
            assertEquals(dto2.getId(), entities.get(1).getId());
            assertEquals(dto2.getEmail(), entities.get(1).getEmail());
            assertEquals(dto2.getLastName(), entities.get(1).getLastName());
            assertEquals(dto2.getFirstName(), entities.get(1).getFirstName());
        }
        
        @Test
        @DisplayName("Doit retourner null quand la liste d'entités est null")
        void shouldReturnNullWhenEntityListIsNull() {
            // Exécution
            List<UserDto> result = userMapper.toDto((List<User>) null);
            
            // Vérification
            assertNull(result);
        }
        
        @Test
        @DisplayName("Doit retourner null quand la liste de DTOs est null")
        void shouldReturnNullWhenDtoListIsNull() {
            // Exécution
            List<User> result = userMapper.toEntity((List<UserDto>) null);
            
            // Vérification
            assertNull(result);
        }
    }
    
    // ======= Tests d'Intégration =======
    @Nested
    @SpringBootTest
    class IntegrationTests {
        @Autowired
        private UserMapper userMapper;
        
        @Autowired
        private UserRepository userRepository;
        
        @BeforeEach
        void setUp() {
            // Assurons-nous que la BD est vide avant chaque test
            userRepository.deleteAll();
        }
        
        @AfterEach
        void tearDown() {
            // Nettoyage des données de test
            userRepository.deleteAll();
        }
        
        @Test
        @DisplayName("Doit convertir un User persisté en DTO")
        @Transactional
        void shouldMapPersistedEntityToDto() {
            // Préparation
            User user = new User();
            user.setEmail("user@test.com");
            user.setLastName("Dupont");
            user.setFirstName("Jean");
            user.setPassword("password123");
            user.setAdmin(false);
            
            User savedUser = userRepository.save(user);
            
            // Exécution
            UserDto dto = userMapper.toDto(savedUser);
            
            // Vérification
            assertNotNull(dto);
            assertEquals(savedUser.getId(), dto.getId());
            assertEquals(savedUser.getEmail(), dto.getEmail());
            assertEquals(savedUser.getLastName(), dto.getLastName());
            assertEquals(savedUser.getFirstName(), dto.getFirstName());
            assertEquals(savedUser.getPassword(), dto.getPassword());
            assertEquals(savedUser.getAdmin(), dto.getAdmin());
            assertNotNull(dto.getCreatedAt());
            assertNotNull(dto.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Doit convertir un UserDto en User et le persister")
        @Transactional
        void shouldMapDtoToEntityAndPersist() {
            // Préparation
            UserDto dto = new UserDto();
            dto.setEmail("user@test.com");
            dto.setLastName("Dupont");
            dto.setFirstName("Jean");
            dto.setPassword("password123");
            dto.setAdmin(false);
            
            // Exécution
            User entity = userMapper.toEntity(dto);
            User savedEntity = userRepository.save(entity);
            
            // Vérification
            assertNotNull(savedEntity.getId());
            assertEquals(dto.getEmail(), savedEntity.getEmail());
            assertEquals(dto.getLastName(), savedEntity.getLastName());
            assertEquals(dto.getFirstName(), savedEntity.getFirstName());
            assertEquals(dto.getPassword(), savedEntity.getPassword());
            assertEquals(dto.getAdmin(), savedEntity.getAdmin());
        }
        
        @Test
        @DisplayName("Doit effectuer un cycle complet de conversion (entité→DTO→entité) avec persistance")
        @Transactional
        void shouldCompleteMappingCycle() {
            // Préparation initiale
            User originalUser = new User();
            originalUser.setEmail("user@test.com");
            originalUser.setLastName("Dupont");
            originalUser.setFirstName("Jean");
            originalUser.setPassword("password123");
            originalUser.setAdmin(false);
            
            User savedUser = userRepository.save(originalUser);
            
            // Premier mapping: User → DTO
            UserDto dto = userMapper.toDto(savedUser);
            
            // Second mapping: DTO → User
            User reconvertedUser = userMapper.toEntity(dto);
            
            // Vérification
            assertNotNull(reconvertedUser);
            assertEquals(savedUser.getId(), reconvertedUser.getId());
            assertEquals(savedUser.getEmail(), reconvertedUser.getEmail());
            assertEquals(savedUser.getLastName(), reconvertedUser.getLastName());
            assertEquals(savedUser.getFirstName(), reconvertedUser.getFirstName());
            assertEquals(savedUser.getPassword(), reconvertedUser.getPassword());
            assertEquals(savedUser.getAdmin(), reconvertedUser.getAdmin());
        }
        
        @Test
        @DisplayName("Doit convertir une liste de Users en liste de DTOs avec persistance")
        @Transactional
        void shouldMapEntityListToDtoList() {
            // Préparation
            User user1 = new User();
            user1.setEmail("user1@test.com");
            user1.setLastName("Dupont");
            user1.setFirstName("Jean");
            user1.setPassword("password123");
            user1.setAdmin(false);
            
            User user2 = new User();
            user2.setEmail("user2@test.com");
            user2.setLastName("Martin");
            user2.setFirstName("Marie");
            user2.setPassword("password456");
            user2.setAdmin(true);
            
            // Sauvegarde des entités
            User savedUser1 = userRepository.save(user1);
            User savedUser2 = userRepository.save(user2);
            List<User> users = Arrays.asList(savedUser1, savedUser2);
            
            // Exécution
            List<UserDto> dtos = userMapper.toDto(users);
            
            // Vérification
            assertNotNull(dtos);
            assertEquals(2, dtos.size());
            assertEquals(savedUser1.getId(), dtos.get(0).getId());
            assertEquals(savedUser1.getEmail(), dtos.get(0).getEmail());
            assertEquals(savedUser1.getLastName(), dtos.get(0).getLastName());
            assertEquals(savedUser1.getFirstName(), dtos.get(0).getFirstName());
            assertEquals(savedUser2.getId(), dtos.get(1).getId());
            assertEquals(savedUser2.getEmail(), dtos.get(1).getEmail());
            assertEquals(savedUser2.getLastName(), dtos.get(1).getLastName());
            assertEquals(savedUser2.getFirstName(), dtos.get(1).getFirstName());
        }
    }
}
