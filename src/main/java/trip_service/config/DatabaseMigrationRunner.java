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
        String dropConstraint = "ALTER TABLE trip_requests DROP CONSTRAINT IF EXISTS trip_requests_status_check";

        String addConstraint = """
                ALTER TABLE trip_requests ADD CONSTRAINT trip_requests_status_check
                CHECK (status IN (
                    'NEW', 'SUBMITTED', 'APPROVED',
                    'DRIVER_CONFIRMED', 'DRIVER_REJECTED',
                    'REJECTED', 'ONGOING', 'COMPLETED', 'CANCELLED'
                ))
                """;

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
