# Interim Presentation Setup Guide

**Save this file or take a screenshot so you know exactly what to do tomorrow.**

## 1. Start Backend (Java 21)
The backend needs a specific Java version, so use the special script we created.
1. Open a terminal in `d:\interim\backend`
2. Run this command:
   ```powershell
   .\mvnw21.cmd spring-boot:run
   ```
3. Wait until you see: `Tomcat started on port 8080`.

## 2. Start Frontend
The frontend works best in **Development Mode**.
1. Open a *new* terminal in `d:\interim\frontend`
2. Run this command:
   ```powershell
   npm run dev
   ```
3. Once ready, open your browser to [http://localhost:3000](http://localhost:3000).

---
**Important Notes:**
- ❌ Do NOT run `npm run build` (it will fail).
- ✅ ALWAYS use `.\mvnw21.cmd` for the backend, not `.\mvnw`.
