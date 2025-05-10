# School Vaccination Portal - Setup Instructions

## Overview
This guide provides step-by-step instructions to run the School Vaccination Portal’s frontend and backend locally. The application consists of a React frontend (`http://localhost:3000`) and a Node.js + Express backend (`http://localhost:5000`), with MongoDB as the database.

## Prerequisites
- **Node.js**: v16 or later (v23 preferred).
- **MongoDB**: v5 or later, running locally / MongoDB Atlas Cloud service.
- **Git**: For cloning the repository (if applicable).
- **OS**: Windows, macOS, or Linux.

## Project Structure
```
school-vaccination-portal/
├── server/
│   ├── routes/
│   │   ├── dashboard.js
│   │   ├── drive.js
│   │   ├── vaccination.js
│   │   ├── student.js
│   │   ├── vaccine.js
│   │   ├── reports.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Vaccine.js
│   │   ├── Drive.js
│   │   ├── Vaccination.js
│   ├── server.js
│   ├── .env
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DrivesPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── StudentsPage.jsx
│   │   │   ├── VaccinationsModal.jsx
│   │   │   ├── VaccinesPAge.jsx
│   │   ├── components/
│   │   │   ├── AppBar.jsx
│   ├── .env
```

## Setup Steps

### 1. Clone the Repository (if applicable)
```bash
git clone <repository-url>
cd school-vaccination
```

### 2. Set Up MongoDB
1. **Install MongoDB** (if not installed):
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community).
   - Follow OS-specific installation instructions.
2. **Start MongoDB**:
   ```bash
   mongod
   ```
   - Ensure it runs on `mongodb://localhost:27017`.
3. **Create Database**:
   ```bash
   mongo
   use school-vaccination
   ```

### 3. Set Up Backend
1. **Navigate to Backend**:
   ```bash
   cd server
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Create `.env` File**:
   ```bash
   echo "MONGODB_URI=mongodb://localhost:27017/school-vaccination" > .env
   ```
4. **Run Backend**:
   ```bash
   npm start
   ```
   - Runs on `http://localhost:5000`.

### 4. Set Up Frontend
1. **Navigate to Frontend**:
   ```bash
   cd ../client
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Frontend**:
   ```bash
   npm start
   ```
   - Runs on `http://localhost:3000`.
   - Open `http://localhost:3000` in a browser.

## Architecture Diagram

![alt text](architecture.png)



## Default user credentials

email: `admin@school.com`

password: `admin123`