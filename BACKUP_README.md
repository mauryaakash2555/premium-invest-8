# BM Wealth - Complete Backup

## Backup Date
December 5, 2025

## Contents

### 1. Website Files
- `/backend/` - FastAPI backend application
- `/frontend/` - React frontend application
- All dependencies and configurations

### 2. Database Backup
- `/database_backup/` - MongoDB dump
- Database: test_database
- Collections: All application data

## Restore Instructions

### Database Restore
```bash
# Restore MongoDB database
mongorestore --uri="mongodb://localhost:27017/test_database" database_backup/test_database/
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## Changes in This Version
1. ✅ Removed ARN 90008 from all visible areas (only in footer)
2. ✅ Changed SEBI to AMFI Registered
3. ✅ Removed Akash Maurya references
4. ✅ Navigation cleaned (no ARN)
5. ✅ Footer optimized with ARN hidden at bottom

## Important Notes
- Backend runs on port 8001
- Frontend runs on port 3000
- MongoDB connection: mongodb://localhost:27017
- Database name: test_database

## Contact
- Email: mauryaakash2555@gmail.com
- Phone: +91 8850977259
