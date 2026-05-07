# TaskFlow - Project & Task Management App

### 🎯 Project Goal
TaskFlow is a full-stack project management application designed to help teams organize projects, assign tasks, and track progress in real-time. It features role-based access control, a dynamic Kanban board, and a comprehensive dashboard for productivity tracking.

---

### 🚀 Getting Started

Follow these steps to run the project locally.

#### 1. Prerequisites
- **Node.js** (v20.19.0 or higher)
- **MongoDB** (Local instance or Atlas URI)

#### 2. Installation
Install all dependencies for the entire project (root, server, and client):
```bash
npm run install-all
```

#### 3. Configuration
Create a `.env` file in the `server/` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_string
NODE_ENV=development
```

#### 4. Seed Data (Optional)
To populate the database with test users and projects:
```bash
cd server
npm run seed
```

#### 5. Running the Application
You can start both the backend and frontend simultaneously from the root directory:

**Start Backend:**
```bash
npm run server
```

**Start Frontend:**
```bash
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

### 📦 Deployment
This project is configured for **Railway** deployment. It uses a single service to serve both the API and the built frontend files.

**Build Command:** `npm run railway-build`  
**Start Command:** `npm start`
