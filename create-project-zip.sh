#!/bin/bash

# Script to create a complete project zip file
# This includes all source code, documentation, and configuration files
# Excludes: .git, node_modules, and other build artifacts

echo "Creating complete project zip file..."

# Define the output zip file name with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="premium-invest-8-complete-${TIMESTAMP}.zip"

# Create temporary directory for organizing files
TEMP_DIR=$(mktemp -d)
PROJECT_NAME="premium-invest-8"
DEST_DIR="${TEMP_DIR}/${PROJECT_NAME}"

# Create destination directory
mkdir -p "${DEST_DIR}"

echo "Copying project files..."

# Copy all files while excluding specific directories and files
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='coverage' \
  --exclude='dist' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='venv' \
  --exclude='.venv' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='package-lock.json' \
  --exclude='yarn.lock' \
  --exclude='.cache' \
  --exclude='*.zip' \
  --exclude='*.tar.gz' \
  --exclude='create-project-zip.sh' \
  ./ "${DEST_DIR}/"

# Create the zip file
echo "Creating zip archive..."
cd "${TEMP_DIR}"
zip -r "${ZIP_NAME}" "${PROJECT_NAME}" -x "*.DS_Store" > /dev/null

# Move zip file to project root
mv "${ZIP_NAME}" "/home/runner/work/premium-invest-8/premium-invest-8/${ZIP_NAME}"

# Clean up temporary directory
rm -rf "${TEMP_DIR}"

echo "✓ Complete project zip file created: ${ZIP_NAME}"
echo ""
echo "Contents included:"
echo "  - All source code (frontend, backend, src)"
echo "  - Documentation (README, deployment guides)"
echo "  - Configuration files"
echo "  - Build files (docs, build directories)"
echo "  - Tests"
echo ""
echo "Excluded:"
echo "  - .git directory"
echo "  - node_modules"
echo "  - Build artifacts and caches"
echo "  - Log files"
echo ""

# Display zip file size
ZIP_SIZE=$(du -h "/home/runner/work/premium-invest-8/premium-invest-8/${ZIP_NAME}" | cut -f1)
echo "Zip file size: ${ZIP_SIZE}"
echo ""
echo "Location: /home/runner/work/premium-invest-8/premium-invest-8/${ZIP_NAME}"
