#!/bin/bash

# Simple build script for VPN Project
# This compiles all Java source files and puts them in the out directory

echo "Building VPN Project..."

# Create out directory if it doesn't exist
mkdir -p out

# Compile all Java files from src to out directory
find src -name "*.java" | xargs javac -d out -cp out

if [ $? -eq 0 ]; then
    echo "Build successful! Compiled classes are in the 'out' directory."
    echo "You can now run the GUI or use the Java classes directly."
else
    echo "Build failed! Please check for compilation errors."
    exit 1
fi
