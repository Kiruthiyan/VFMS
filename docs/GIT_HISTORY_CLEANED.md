# Git history cleanup notes

## Purpose

Documents that sensitive values must not live in tracked config or docs. Real credentials belong only in local `backend/.env`.

## Safe config pattern

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
application.security.jwt.secret-key=${JWT_SECRET}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

## If secrets appeared in old commits

1. Rotate all exposed credentials in Supabase, Gmail, and JWT.
2. Optionally purge history with `git filter-repo` (requires team agreement and force-push).
3. Verify with: `git log --all -p | grep -i "your-rotated-secret-pattern"` (should return nothing).

## Current branch workflow

- Work on `test3/kiruthiyan`
- Never commit `backend/.env` or local `application.properties` overrides
