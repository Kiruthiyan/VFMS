@echo off
set "JAVA_HOME=C:\Users\DELL\.gemini\openjdk-21\jdk-21.0.2+13"
set "Path=%JAVA_HOME%\bin;%Path%"
call mvnw.cmd %*
