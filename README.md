# CyberShield - Cybersecurity Incident Management System

CyberShield is a complete full-stack web application designed for a college-level cybersecurity/DBMS project. It demonstrates modern web development practices including a React frontend, Python FastAPI backend, and MongoDB database with comprehensive Role-Based Access Control (RBAC).

## Features

- **Authentication & RBAC:** Secure JWT-based auth with `USER` and `ADMIN` roles.
- **Incident Reporting & Management:** Create, view, update, and delete security incidents.
- **Workflow & Audit Trails:** Track status changes and log actions taken.
- **Dashboard Analytics:** Visual charts using Recharts powered by MongoDB aggregations.
- **Advanced Search & Filtering:** Filter incidents by severity, status, or search query.
- **Admin Controls:** User management and system-wide audit logging.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS (v4), React Router, Axios, Recharts, Lucide Icons.
- **Backend:** Python, FastAPI, Motor (Async PyMongo), Pydantic, Passlib (Bcrypt), Python-Jose (JWT).
- **Database:** MongoDB (Local or Atlas compatible).

## Folder Structure
```
cybershield/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── utils/
│   ├── requirements.txt
│   ├── seed.py
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB running locally (port 27017) or a MongoDB Atlas connection string.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` (already provided by default).
5. Seed the database with sample data:
   ```bash
   python seed.py
   ```
6. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   API Docs available at: `http://localhost:8000/docs`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

## Default Seed Credentials
- **Admin User:** `admin` / Password: `admin123`
- **Normal Users:** `alice`, `bob` / Password: `password123`

## Future Enhancements
- Email notifications on status changes.
- WebSocket integration for real-time dashboard updates.
- Exporting incidents to PDF/CSV.
