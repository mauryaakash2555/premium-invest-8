# Premium Invest 8 - Complete Project Archive

## 📦 Project Zip File

This repository includes a complete project archive for easy distribution and setup.

### Zip File Details

- **File Name**: `premium-invest-8-complete-[timestamp].zip`
- **Size**: ~5.7 MB
- **Total Files**: 160 files
- **Format**: Standard ZIP archive

### Contents Included

The zip file contains the complete BM Wealth project with all necessary files:

#### Source Code
- ✅ **Frontend** - React application with UI components
  - `/frontend/src/` - React components and pages
  - `/frontend/public/` - Public assets
  - `/frontend/components.json` - Component configurations
  - Tailwind CSS and CRACO configurations

- ✅ **Backend** - Python Flask server
  - `/backend/server.py` - Main server file
  - `/backend/requirements.txt` - Python dependencies

- ✅ **Additional Source** - API routes
  - `/src/app/api/` - API endpoints

#### Documentation
- ✅ `README.md` - Main project documentation
- ✅ `QUICK_START.md` - Quick start guide
- ✅ `DEPLOYMENT_*.md` - Deployment guides
- ✅ `GITHUB_PAGES_SETUP.md` - GitHub Pages setup
- ✅ `TASK_COMPLETE.md` - Task completion details
- ✅ `CHANGES.md` - Change log

#### Configuration Files
- ✅ `.gitignore` - Git ignore rules
- ✅ `.gitconfig` - Git configuration
- ✅ `.npmrc` - NPM configuration
- ✅ `netlify.toml` - Netlify deployment config
- ✅ `package.json` - Node.js dependencies (frontend)
- ✅ `craco.config.js` - Create React App Configuration
- ✅ `tailwind.config.js` - Tailwind CSS configuration
- ✅ `postcss.config.js` - PostCSS configuration

#### Build Files
- ✅ `/build/` - Production build files
- ✅ `/docs/` - GitHub Pages documentation build
- ✅ `index.html` - Main HTML file

#### Additional Files
- ✅ `robots.txt` - Search engine directives
- ✅ `sitemap.xml` - Site structure for SEO
- ✅ `/tests/` - Test files
- ✅ Google verification file

### Files Excluded

To keep the archive size manageable and focused on source code, the following are excluded:

- ❌ `.git/` - Git repository history
- ❌ `node_modules/` - NPM packages (install using `npm install`)
- ❌ `package-lock.json` - Auto-generated lock file
- ❌ `__pycache__/`, `*.pyc` - Python cache files
- ❌ `venv/`, `.venv/` - Python virtual environments
- ❌ `.next/`, `out/` - Next.js build artifacts
- ❌ `coverage/` - Test coverage reports
- ❌ `*.log` - Log files
- ❌ `.cache/` - Cache directories

## 🚀 How to Use the Zip File

### 1. Extract the Archive

```bash
# Extract the zip file
unzip premium-invest-8-complete-[timestamp].zip

# Navigate to the project directory
cd premium-invest-8
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Or build for production
npm run build
```

### 3. Backend Setup (Optional)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

### 4. View the Website

Once extracted, you can simply open `index.html` in a web browser to view the static site, or follow the frontend setup steps for the full React application.

## 📋 Quick Start Options

### Option 1: Static Site (Instant)
Simply open `index.html` in your browser - no setup required!

### Option 2: React Development (Full Features)
1. Extract zip file
2. `cd frontend && npm install`
3. `npm start`
4. Open http://localhost:3000

### Option 3: Full Stack Development
1. Extract zip file
2. Setup frontend (as above)
3. Setup backend: `cd backend && pip install -r requirements.txt && python server.py`

## 🔄 Recreating the Zip File

To create a new zip file with the latest changes, run:

```bash
./create-project-zip.sh
```

This script automatically:
- Excludes unnecessary files (.git, node_modules, etc.)
- Includes all source code and documentation
- Creates a timestamped zip file
- Reports the size and location

## 📞 Support

For questions or support:
- **Phone**: +91 88509 77259
- **Email**: mauryaakash2555@gmail.com
- **Instagram**: https://www.instagram.com/bmwealth.official/

## 📄 License

© 2025 BM Wealth. All rights reserved. ARN 90008.

---

**SEBI Disclaimer**: Investments are subject to market risks. Past performance is not a guarantee of future results. Please read all scheme documents carefully before investing.
