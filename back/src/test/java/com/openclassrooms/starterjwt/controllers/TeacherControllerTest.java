package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests pour TeacherController
 */
public class TeacherControllerTest {

    /**
     * Tests unitaires pour TeacherController
     */
    @Nested
    @DisplayName("Tests unitaires")
    class UnitTests {
        @Mock
        private TeacherService teacherService;

        @Mock
        private TeacherMapper teacherMapper;

        @InjectMocks
        private TeacherController teacherController;

        private Teacher testTeacher;
        private TeacherDto testTeacherDto;
        private List<Teacher> testTeachers;
        private List<TeacherDto> testTeacherDtos;

        @BeforeEach
        void setUp() {
            MockitoAnnotations.openMocks(this);

            // Création des objets de test
            testTeacher = new Teacher();
            testTeacher.setId(1L);
            testTeacher.setLastName("Dupont");
            testTeacher.setFirstName("Jean");
            testTeacher.setCreatedAt(LocalDateTime.now());
            testTeacher.setUpdatedAt(LocalDateTime.now());

            testTeacherDto = new TeacherDto();
            testTeacherDto.setId(1L);
            testTeacherDto.setLastName("Dupont");
            testTeacherDto.setFirstName("Jean");
            testTeacherDto.setCreatedAt(testTeacher.getCreatedAt());
            testTeacherDto.setUpdatedAt(testTeacher.getUpdatedAt());

            // Préparation des listes pour les tests findAll
            Teacher teacher2 = new Teacher();
            teacher2.setId(2L);
            teacher2.setLastName("Martin");
            teacher2.setFirstName("Marie");
            teacher2.setCreatedAt(LocalDateTime.now());
            teacher2.setUpdatedAt(LocalDateTime.now());

            TeacherDto teacherDto2 = new TeacherDto();
            teacherDto2.setId(2L);
            teacherDto2.setLastName("Martin");
            teacherDto2.setFirstName("Marie");
            teacherDto2.setCreatedAt(teacher2.getCreatedAt());
            teacherDto2.setUpdatedAt(teacher2.getUpdatedAt());

            testTeachers = Arrays.asList(testTeacher, teacher2);
            testTeacherDtos = Arrays.asList(testTeacherDto, teacherDto2);
        }

        @Test
        @DisplayName("findById - Doit retourner le professeur lorsqu'il existe")
        void findById_ShouldReturnTeacher_WhenTeacherExists() {
            // Préparation
            when(teacherService.findById(1L)).thenReturn(testTeacher);
            when(teacherMapper.toDto(testTeacher)).thenReturn(testTeacherDto);

            // Exécution
            ResponseEntity<?> response = teacherController.findById("1");

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testTeacherDto, response.getBody());
            verify(teacherService).findById(1L);
            verify(teacherMapper).toDto(testTeacher);
        }

        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand le professeur n'existe pas")
        void findById_ShouldReturnNotFound_WhenTeacherDoesNotExist() {
            // Préparation
            when(teacherService.findById(1L)).thenReturn(null);

            // Exécution
            ResponseEntity<?> response = teacherController.findById("1");

            // Vérification
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
            assertNull(response.getBody());
            verify(teacherService).findById(1L);
            verify(teacherMapper, never()).toDto(any(Teacher.class));
        }

        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() {
            // Exécution
            ResponseEntity<?> response = teacherController.findById("invalidId");

            // Vérification
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNull(response.getBody());
            verify(teacherService, never()).findById(anyLong());
            verify(teacherMapper, never()).toDto(any(Teacher.class));
        }

        @Test
        @DisplayName("findAll - Doit retourner tous les professeurs")
        void findAll_ShouldReturnAllTeachers() {
            // Préparation
            when(teacherService.findAll()).thenReturn(testTeachers);
            when(teacherMapper.toDto(testTeachers)).thenReturn(testTeacherDtos);

            // Exécution
            ResponseEntity<?> response = teacherController.findAll();

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(testTeacherDtos, response.getBody());
            verify(teacherService).findAll();
            verify(teacherMapper).toDto(testTeachers);
        }

        @Test
        @DisplayName("findAll - Doit retourner une liste vide quand aucun professeur n'existe")
        void findAll_ShouldReturnEmptyList_WhenNoTeachersExist() {
            // Préparation
            List<Teacher> emptyTeacherList = List.of();
            List<TeacherDto> emptyTeacherDtoList = List.of();
            
            when(teacherService.findAll()).thenReturn(emptyTeacherList);
            when(teacherMapper.toDto(emptyTeacherList)).thenReturn(emptyTeacherDtoList);

            // Exécution
            ResponseEntity<?> response = teacherController.findAll();

            // Vérification
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(emptyTeacherDtoList, response.getBody());
            verify(teacherService).findAll();
            verify(teacherMapper).toDto(emptyTeacherList);
        }
    }
    
    /**
     * Tests d'intégration pour TeacherController
     */
    @Nested
    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("Tests d'intégration pour TeacherController")
    class IntegrationTests {
        @Autowired
        private MockMvc mockMvc;
        
        @Autowired
        private TeacherRepository teacherRepository;
        
        private Teacher testTeacher;
        
        @BeforeEach
        void setUp() {
            // Création d'un professeur de test en base de données
            testTeacher = new Teacher();
            testTeacher.setLastName("Dubois");
            testTeacher.setFirstName("Pierre");
            testTeacher.setCreatedAt(LocalDateTime.now());
            testTeacher.setUpdatedAt(LocalDateTime.now());
            
            testTeacher = teacherRepository.save(testTeacher);
        }
        
        @Test
        @DisplayName("findById - Doit retourner le professeur lorsqu'il existe")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnTeacher_WhenTeacherExists() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/teacher/{id}", testTeacher.getId()))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(testTeacher.getId()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value(testTeacher.getLastName()))
                    .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value(testTeacher.getFirstName()));
        }
        
        @Test
        @DisplayName("findById - Doit retourner NOT_FOUND quand le professeur n'existe pas")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnNotFound_WhenTeacherDoesNotExist() throws Exception {
            // Exécution et vérification avec un ID qui n'existe pas
            mockMvc.perform(MockMvcRequestBuilders.get("/api/teacher/{id}", 999L))
                    .andExpect(MockMvcResultMatchers.status().isNotFound());
        }
        
        @Test
        @DisplayName("findById - Doit retourner BAD_REQUEST quand l'ID n'est pas un nombre")
        @WithMockUser(username = "user@test.com")
        void findById_ShouldReturnBadRequest_WhenIdIsNotANumber() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/teacher/{id}", "invalidId"))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest());
        }
        
        @Test
        @DisplayName("findAll - Doit retourner tous les professeurs")
        @WithMockUser(username = "user@test.com")
        void findAll_ShouldReturnAllTeachers() throws Exception {
            // Exécution et vérification
            mockMvc.perform(MockMvcRequestBuilders.get("/api/teacher"))
                    .andExpect(MockMvcResultMatchers.status().isOk())
                    .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").exists())
                    .andExpect(MockMvcResultMatchers.jsonPath("$[0].lastName").exists())
                    .andExpect(MockMvcResultMatchers.jsonPath("$[0].firstName").exists());
        }
    }
}
