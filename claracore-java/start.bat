@echo off
REM ClaraCore Java Sidecar Launcher for Windows
REM This script builds and runs the Java sidecar service

setlocal enabledelayedexpansion

echo Starting ClaraCore Java Sidecar...
echo.

REM Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Java is not installed
    echo Please install Java 17 or higher and try again
    pause
    exit /b 1
)

REM Check if JAR exists
set JAR_FILE=target\claracore-java-sidecar-1.0.0.jar

if not exist "%JAR_FILE%" (
    echo JAR file not found. Building...
    echo.

    REM Check if Maven is installed
    where mvn >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Maven is not installed
        echo Please install Maven 3.8+ and try again
        echo Or build manually with: mvn clean package
        pause
        exit /b 1
    )

    REM Build the project
    echo Building with Maven...
    call mvn clean package -DskipTests

    if %ERRORLEVEL% NEQ 0 (
        echo Build failed
        pause
        exit /b 1
    )

    echo Build successful
    echo.
)

REM Run the JAR
echo Starting Java Sidecar on port 9090...
echo Press Ctrl+C to stop
echo.

java -jar "%JAR_FILE%"

pause
