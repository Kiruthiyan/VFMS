package com.vfms.admin.service;

import com.vfms.admin.dto.CreateEmployeeRegistryRequest;
import com.vfms.common.exception.ValidationException;
import com.vfms.employee.entity.EmployeeRegistryRecord;
import com.vfms.employee.repository.EmployeeRegistryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminEmployeeRegistryService Unit Tests")
class AdminEmployeeRegistryServiceTest {

    @Mock
    private EmployeeRegistryRepository employeeRegistryRepository;

    @InjectMocks
    private AdminEmployeeRegistryService adminEmployeeRegistryService;

    @Test
    @DisplayName("createRecord should persist normalized registry details")
    void createRecord_shouldPersistNormalizedDetails() {
        CreateEmployeeRegistryRequest request = new CreateEmployeeRegistryRequest();
        request.setEmployeeId(" emp001 ");
        request.setFullName("Staff User");
        request.setEmail(" STAFF@VFMS.COM ");
        request.setPhone("077 123 4567");
        request.setNic("200012345678");
        request.setDepartment("Operations");
        request.setDesignation("Coordinator");
        request.setOfficeLocation("Colombo");

        when(employeeRegistryRepository.findByEmployeeIdIgnoreCase("EMP001"))
                .thenReturn(Optional.empty());
        when(employeeRegistryRepository.findByEmailIgnoreCase("staff@vfms.com"))
                .thenReturn(Optional.empty());
        when(employeeRegistryRepository.save(any(EmployeeRegistryRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        adminEmployeeRegistryService.createRecord(request);

        ArgumentCaptor<EmployeeRegistryRecord> savedRecord =
                ArgumentCaptor.forClass(EmployeeRegistryRecord.class);
        verify(employeeRegistryRepository).save(savedRecord.capture());
        assertEquals("EMP001", savedRecord.getValue().getEmployeeId());
        assertEquals("staff@vfms.com", savedRecord.getValue().getEmail());
        assertTrue(savedRecord.getValue().isActive());
    }

    @Test
    @DisplayName("createRecord should reject duplicate employee ID")
    void createRecord_shouldRejectDuplicateEmployeeId() {
        CreateEmployeeRegistryRequest request = new CreateEmployeeRegistryRequest();
        request.setEmployeeId("EMP001");
        request.setFullName("Staff User");
        request.setEmail("staff@vfms.com");
        request.setPhone("0771234567");
        request.setNic("200012345678");
        request.setDepartment("Operations");
        request.setDesignation("Coordinator");
        request.setOfficeLocation("Colombo");

        when(employeeRegistryRepository.findByEmployeeIdIgnoreCase("EMP001"))
                .thenReturn(Optional.of(EmployeeRegistryRecord.builder().employeeId("EMP001").build()));

        assertThrows(ValidationException.class, () -> adminEmployeeRegistryService.createRecord(request));
        verify(employeeRegistryRepository, never()).save(any());
    }
}
