package com.vfms.trip.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
@RequiredArgsConstructor
public class DatabaseMigrationRunner {

    private final DataSource dataSource;

    @PostConstruct
    public void runMigrations() {
        updateTripStatusConstraint();
    }

    private void updateTripStatusConstraint() {
        // Use try-with-resources to automatically close the Connection and Statement, preventing database connection leaks
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // 1. Ensure all columns and types exist (replaces the manual sql migration steps)
            stmt.execute("ALTER TABLE trip_requests ALTER COLUMN destination TYPE TEXT");
            stmt.execute("ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS driver_timeline_reason VARCHAR(1000)");
            stmt.execute("ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS staff_timeline_reason VARCHAR(1000)");
            stmt.execute("ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS stop_arrival_times VARCHAR(2000)");
            stmt.execute("ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS trip_activity_log TEXT");

            // SQL query to remove the existing constraint (if it exists) so we can replace it cleanly
            String dropConstraint = "ALTER TABLE trip_requests DROP CONSTRAINT IF EXISTS trip_requests_status_check";

            // SQL query to define the new constraint with the complete, allowed list of trip statuses
            String addConstraint = """
                    ALTER TABLE trip_requests ADD CONSTRAINT trip_requests_status_check
                    CHECK (status IN (
                        'NEW', 'SUBMITTED', 'APPROVED',
                        'DRIVER_CONFIRMED', 'DRIVER_REJECTED', 'START_PENDING',
                        'REJECTED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'
                    ))
                    """;

            stmt.execute(dropConstraint);
            stmt.execute(addConstraint);

        } catch (SQLException e) {
            // Constraint already up to date — safe to ignore
            if (!e.getMessage().contains("already exists")) {
                throw new RuntimeException("Failed to update trip_requests_status_check constraint", e);
            }
        }
    }
}
