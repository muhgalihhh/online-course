#!/bin/bash

# Script untuk membuat package deployment ke shared hosting

PROJECT_NAME="online-course"
DEPLOY_FOLDER="${PROJECT_NAME}-deploy"
ZIP_NAME="${PROJECT_NAME}-shared-hosting.zip"

echo "🚀 Creating deployment package for shared hosting..."

# Clean previous build
if [ -d "$DEPLOY_FOLDER" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$DEPLOY_FOLDER"
fi

if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
fi

# Create deploy folder
echo "📁 Creating deploy folder..."
mkdir -p "$DEPLOY_FOLDER"

# Copy necessary files and folders
echo "📦 Copying files..."
cp -r app "$DEPLOY_FOLDER/"
cp -r bootstrap "$DEPLOY_FOLDER/"
cp -r config "$DEPLOY_FOLDER/"
cp -r database "$DEPLOY_FOLDER/"
cp -r lang "$DEPLOY_FOLDER/"
cp -r public "$DEPLOY_FOLDER/"
cp -r resources "$DEPLOY_FOLDER/"
cp -r routes "$DEPLOY_FOLDER/"
cp -r storage "$DEPLOY_FOLDER/"
cp -r vendor "$DEPLOY_FOLDER/"

# Copy root files
cp artisan "$DEPLOY_FOLDER/"
cp composer.json "$DEPLOY_FOLDER/"
cp composer.lock "$DEPLOY_FOLDER/"
cp package.json "$DEPLOY_FOLDER/"
cp .htaccess "$DEPLOY_FOLDER/"
cp .env.shared-hosting "$DEPLOY_FOLDER/.env.example"

# Copy deployment files
cp deploy-shared-hosting.sh "$DEPLOY_FOLDER/"
cp DEPLOYMENT-SHARED-HOSTING.md "$DEPLOY_FOLDER/"

# Create deployment instructions
echo "Creating deployment instructions..."
cat > "$DEPLOY_FOLDER/README-DEPLOYMENT.md" << 'EOF'
# 🚀 Deployment Instructions

1. Extract this zip file to your shared hosting root directory
2. Rename .env.example to .env and configure your settings
3. Run: ./deploy-shared-hosting.sh or follow manual steps in DEPLOYMENT-SHARED-HOSTING.md
4. Point your domain to the public/ folder

## Quick Setup Commands:
```
chmod +x deploy-shared-hosting.sh
./deploy-shared-hosting.sh
php artisan setup:shared-hosting
php artisan migrate --force
```

For detailed instructions, see DEPLOYMENT-SHARED-HOSTING.md
EOF

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 "$DEPLOY_FOLDER"
chmod -R 775 "$DEPLOY_FOLDER/storage" 2>/dev/null || true
chmod -R 775 "$DEPLOY_FOLDER/bootstrap/cache" 2>/dev/null || true
chmod +x "$DEPLOY_FOLDER/deploy-shared-hosting.sh"

# Create zip file
echo "📦 Creating ZIP package..."
if command -v zip &> /dev/null; then
    cd "$DEPLOY_FOLDER"
    zip -r "../$ZIP_NAME" . > /dev/null
    cd ..
else
    tar -czf "${ZIP_NAME%.zip}.tar.gz" "$DEPLOY_FOLDER"
    echo "⚠️  zip not found, created tar.gz instead"
fi

# Clean up
rm -rf "$DEPLOY_FOLDER"

echo "✅ Deployment package created: $ZIP_NAME"
echo ""
echo "📋 Next steps:"
echo "1. Upload $ZIP_NAME to your shared hosting"
echo "2. Extract it to your hosting root directory"
echo "3. Follow instructions in README-DEPLOYMENT.md"
