package trip_service.config;

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
        // SQL query to remove the existing constraint (if it exists) so we can replace it cleanly
        String dropConstraint = "ALTER TABLE trip_requests DROP CONSTRAINT IF EXISTS trip_requests_status_check";

        // SQL query to define the new constraint with the complete, allowed list of trip statuses
        String addConstraint = """
                ALTER TABLE trip_requests ADD CONSTRAINT trip_requests_status_check
                CHECK (status IN (
                    'NEW', 'SUBMITTED', 'APPROVED',
                    'DRIVER_CONFIRMED', 'DRIVER_REJECTED',
                    'REJECTED', 'ONGOING', 'COMPLETED', 'CANCELLED'
                ))
                """;

        // Use try-with-resources to automatically close the Connection and Statement, preventing database connection leaks
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

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
