package com.vfms.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time schema fix: fuel_records.driver_id must reference users(id), not legacy drivers(id).
 * Runs automatically when the old PostgreSQL constraint is still present.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FuelRecordsDriverFkMigration implements ApplicationRunner {

    private static final String OLD_CONSTRAINT = "fk_fuel_records_driver_id";
    private static final String NEW_CONSTRAINT = "fk_fuel_records_driver_user_id";

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        if (!isPostgreSQL()) {
            return;
        }

        try {
            if (constraintExists(NEW_CONSTRAINT)) {
                log.debug("Fuel records driver FK already references users.");
                return;
            }

            if (constraintExists(OLD_CONSTRAINT)) {
                log.info("Migrating fuel_records.driver_id FK from drivers to users...");
                jdbcTemplate.execute(
                        "ALTER TABLE fuel_records DROP CONSTRAINT " + OLD_CONSTRAINT);
            }

            jdbcTemplate.update("""
                    DELETE FROM fuel_records fr
                    WHERE fr.driver_id IS NOT NULL
                      AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = fr.driver_id)
                    """);

            if (!constraintExists(NEW_CONSTRAINT)) {
                jdbcTemplate.execute("""
                        ALTER TABLE fuel_records
                            ADD CONSTRAINT fk_fuel_records_driver_user_id
                            FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
                        """);
            }

            log.info("fuel_records.driver_id now references users(id).");
        } catch (Exception ex) {
            log.warn("Could not migrate fuel_records driver FK: {}", ex.getMessage());
        }
    }

    private boolean isPostgreSQL() {
        try (var connection = jdbcTemplate.getDataSource().getConnection()) {
            String product = connection.getMetaData().getDatabaseProductName();
            return product != null && product.toLowerCase().contains("postgresql");
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean constraintExists(String constraintName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(*)
                        FROM pg_constraint
                        WHERE conname = ?
                        """,
                Integer.class,
                constraintName);
        return count != null && count > 0;
    }
}
