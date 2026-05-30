package com.vfms.tools;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * One-off CLI: reset Supabase public schema using backend/.env credentials.
 * Usage from backend/: mvn -q exec:java -Dexec.mainClass=com.vfms.tools.SupabaseSchemaReset
 */
public final class SupabaseSchemaReset {

    private static final Pattern JDBC =
            Pattern.compile("^jdbc:postgresql://([^:/]+):(\\d+)/([^?]+)");

    private static final String[] RESET_STATEMENTS = {
        "DROP SCHEMA IF EXISTS public CASCADE",
        "CREATE SCHEMA public",
        "GRANT ALL ON SCHEMA public TO postgres",
        "GRANT ALL ON SCHEMA public TO public",
        "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\" WITH SCHEMA public",
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\" WITH SCHEMA public"
    };

    private SupabaseSchemaReset() {}

    public static void main(String[] args) throws Exception {
        Path envPath = Path.of(".env");
        if (!Files.exists(envPath)) {
            System.err.println("Run from backend/ with a .env file present.");
            System.exit(1);
        }

        Map<String, String> env = loadEnv(envPath);
        String url = required(env, "DB_URL");
        String user = required(env, "DB_USER");
        String password = required(env, "DB_PASSWORD");

        Matcher m = JDBC.matcher(url);
        if (!m.find()) {
            System.err.println("DB_URL must be a PostgreSQL JDBC URL.");
            System.exit(1);
        }

        System.out.println("Resetting Supabase public schema on " + m.group(1) + "/" + m.group(3) + " ...");

        try (Connection conn = DriverManager.getConnection(url, user, password);
                Statement st = conn.createStatement()) {
            for (String sql : RESET_STATEMENTS) {
                st.execute(sql);
            }
        }

        System.out.println("Done. Start the backend to recreate tables and seed admin.");
    }

    private static Map<String, String> loadEnv(Path path) throws Exception {
        Map<String, String> map = new HashMap<>();
        for (String line : Files.readAllLines(path)) {
            if (line.isBlank() || line.trim().startsWith("#")) {
                continue;
            }
            int eq = line.indexOf('=');
            if (eq > 0) {
                map.put(line.substring(0, eq).trim(), line.substring(eq + 1).trim());
            }
        }
        return map;
    }

    private static String required(Map<String, String> env, String key) {
        String value = env.get(key);
        if (value == null || value.isBlank()) {
            System.err.println("Missing " + key + " in .env");
            System.exit(1);
        }
        return value;
    }
}
