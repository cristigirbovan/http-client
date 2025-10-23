#!/bin/bash

# ClaraCore Java Sidecar Launcher
# This script builds and runs the Java sidecar service

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 Starting ClaraCore Java Sidecar..."
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java is not installed"
    echo "Please install Java 17 or higher and try again"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F. '{print $1}')
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Error: Java 17 or higher is required"
    echo "Current version: $JAVA_VERSION"
    exit 1
fi

# Check if JAR exists
JAR_FILE="target/claracore-java-sidecar-1.0.0.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "📦 JAR file not found. Building..."
    echo ""

    # Check if Maven is installed
    if ! command -v mvn &> /dev/null; then
        echo "❌ Error: Maven is not installed"
        echo "Please install Maven 3.8+ and try again"
        echo "Or build manually with: mvn clean package"
        exit 1
    fi

    # Build the project
    echo "Building with Maven..."
    mvn clean package -DskipTests

    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi

    echo "✅ Build successful"
    echo ""
fi

# Run the JAR
echo "🎯 Starting Java Sidecar on port 9090..."
echo "Press Ctrl+C to stop"
echo ""

java -jar "$JAR_FILE"
