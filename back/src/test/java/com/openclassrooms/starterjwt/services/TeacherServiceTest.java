package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        // Configuration d'un objet teacher pour les tests
        teacher = new Teacher();
        teacher.setId(2L); 
        teacher.setFirstName("Jean");
        teacher.setLastName("Dupont");
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());
    }

    // Check si l'appel est fait avec bon arguments et si la méthode retourne correctement les données
    @Test
    void testFindAll() {
        // Arrange
        // Mock d'une réponse qui renvoie une liste contenant un enseignant
        // On s'attend à ce que la méthode findAll() du service retourne cette même liste
        List<Teacher> teachers = Arrays.asList(teacher);
        when(teacherRepository.findAll()).thenReturn(teachers);
        // Act
        List<Teacher> result = teacherService.findAll();
        // Assert
        // Vérification que le résultat n'est pas null et contient 1 élément
        assertNotNull(result);
        assertEquals(1, result.size());
        // Vérification que les propriétés de l'enseignant retourné correspondent à celles du mock
        assertEquals(teacher.getId(), result.get(0).getId());
        assertEquals(teacher.getFirstName(), result.get(0).getFirstName());
        assertEquals(teacher.getLastName(), result.get(0).getLastName());
        // Vérification que la méthode findAll() du repository a été appelée exactement une fois
        verify(teacherRepository, times(1)).findAll();
    }

    // Check si l'appel est fait avec bon arguments et si l'objet est correctement retourné quand trouvé
    @Test
    void testFindById_Found() {
        // Arrange
        // Mock d'une réponse avec un teacher valide pour l'ID 2L
        // On s'attend à ce que la méthode findById() du service retourne cet enseignant
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(teacher));
        // Act
        Teacher result = teacherService.findById(2L);
        // Assert
        // Vérification que le résultat n'est pas null
        assertNotNull(result);
        // Vérification que les propriétés de l'enseignant retourné correspondent à celles du mock
        assertEquals(teacher.getId(), result.getId());
        assertEquals(teacher.getFirstName(), result.getFirstName());
        assertEquals(teacher.getLastName(), result.getLastName());
        // Vérification que la méthode findById() du repository a été appelée exactement une fois avec l'ID 2L
        verify(teacherRepository, times(1)).findById(2L);
    }

    // Check si l'appel est fait avec bon arguments et si null est retourné quand l'enseignant n'existe pas
    @Test
    void testFindById_NotFound() {
        // Arrange
        // Mock d'une réponse où aucun teacher n'est trouvé pour l'ID 999L
        // On s'attend à ce que la méthode findById() du service retourne null
        when(teacherRepository.findById(999L)).thenReturn(Optional.empty());
        // Act
        Teacher result = teacherService.findById(999L);
        // Assert
        // Vérification que le résultat est null, ce qui indique que l'enseignant n'a pas été trouvé
        assertNull(result);
        // Vérification que la méthode findById() du repository a été appelée exactement une fois avec l'ID 999L
        verify(teacherRepository, times(1)).findById(999L);
    }
}
