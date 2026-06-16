package com.vfms.dsm.service;

import com.vfms.dsm.entity.DriverInfraction;
import com.vfms.dsm.repository.DriverInfractionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverInfractionServiceAggregateTest {

    @Mock
    private DriverInfractionRepository infractionRepository;

    @Mock
    private DriverService driverService;

    @InjectMocks
    private DriverInfractionService infractionService;

    @Test
    void getAllInfractions_returnsSortedList() {
        DriverInfraction infraction = DriverInfraction.builder()
                .infractionType(DriverInfraction.InfractionType.TRAFFIC_VIOLATION)
                .severity(DriverInfraction.Severity.HIGH)
                .build();

        when(infractionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")))
                .thenReturn(List.of(infraction));

        List<DriverInfraction> result = infractionService.getAllInfractions();

        assertThat(result).hasSize(1);
        verify(infractionRepository).findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
