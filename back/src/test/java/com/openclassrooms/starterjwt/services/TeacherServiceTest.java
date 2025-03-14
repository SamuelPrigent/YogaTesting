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

    // Check si l'appel est fait avec bon arguments
    @Test
    void testFindAll() {
        // Arrange
        List<Teacher> teachers = Arrays.asList(teacher);
        when(teacherRepository.findAll()).thenReturn(teachers);
        // Act
        List<Teacher> result = teacherService.findAll();
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(teacher.getId(), result.get(0).getId());
        assertEquals(teacher.getFirstName(), result.get(0).getFirstName());
        assertEquals(teacher.getLastName(), result.get(0).getLastName());
        verify(teacherRepository, times(1)).findAll();
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testFindById_Found() {
        // Arrange
        // Mock d'une réponse avec un teacher valide
        when(teacherRepository.findById(2L)).thenReturn(Optional.of(teacher));
        // Act
        Teacher result = teacherService.findById(2L);
        // Assert
        assertNotNull(result);
        assertEquals(teacher.getId(), result.getId());
        assertEquals(teacher.getFirstName(), result.getFirstName());
        assertEquals(teacher.getLastName(), result.getLastName());
        verify(teacherRepository, times(1)).findById(2L);
    }

    // Check si l'appel est fait avec bon arguments
    @Test
    void testFindById_NotFound() {
        // Arrange
        // Mock d'une réponse où aucun teacher n'est trouvé
        when(teacherRepository.findById(999L)).thenReturn(Optional.empty());
        // Act
        Teacher result = teacherService.findById(999L);
        // Assert
        assertNull(result);
        verify(teacherRepository, times(1)).findById(999L);
    }
}
