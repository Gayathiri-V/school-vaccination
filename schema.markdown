# School Vaccination Portal - Database Schema

## Overview
The School Vaccination Portal uses a **MongoDB** database (`school-vaccination`) with four main collections: `Students`, `Vaccines`, `Drives`, and `Vaccinations`. Schemas are defined using Mongoose in the backend (`Student.js`, `Vaccine.js`, `Drive.js`, `Vaccination.js`).

## Schema Diagram

![schema](schema.png)

## Collections

### 1. Students
- **Schema**: `Student.js`
- **Fields**:
  - `_id`: ObjectId (auto-generated)
  - `id`: String (required, unique student ID, e.g., "1")
  - `name`: String (required, e.g., "Gayathiri")
  - `studentClass`: String (required, e.g., "5")
- **Example**:
  ```json
  {
    "_id": "681d9ab3269f03575cfbd937",
    "id": "1",
    "name": "Gayathiri",
    "studentClass": "5"
  }
  ```

### 2. Vaccines
- **Schema**: `Vaccine.js`
- **Fields**:
  - `_id`: ObjectId (auto-generated)
  - `name`: String (required, e.g., "Sample Vax")
  - `description`: String (optional, e.g., "Test vaccine")
- **Example**:
  ```json
  {
    "_id": "681df8ccb636a5c82216bbe3",
    "name": "Sample Vax",
    "description": "Test vaccine"
  }
  ```

### 3. Drives
- **Schema**: `Drive.js`
- **Fields**:
  - `_id`: ObjectId (auto-generated)
  - `name`: String (required, e.g., "Drive 2025")
  - `date`: Date (required, e.g., "2025-05-15T00:00:00.000Z")
  - `vaccineId`: ObjectId (required, references `Vaccines`)
  - `totalDoses`: Number (required, e.g., 100)
  - `availableDoses`: Number (optional, computed or stored, e.g., 90)
  - `applicableClasses`: String (required, comma-separated, e.g., "5,6,7")
  - `enabled`: Boolean (required, default: true)
- **Example**:
  ```json
  {
    "_id": "681e0d7eb636a5c82216bbe4",
    "name": "Drive 2025",
    "date": "2025-05-15T00:00:00.000Z",
    "vaccineId": "681df8ccb636a5c82216bbe3",
    "totalDoses": 100,
    "availableDoses": 90,
    "applicableClasses": "5,6,7",
    "enabled": true
  }
  ```

### 4. Vaccinations
- **Schema**: `Vaccination.js`
- **Fields**:
  - `_id`: ObjectId (auto-generated)
  - `studentId`: ObjectId (required, references `Students`)
  - `driveId`: ObjectId (required, references `Drives`)
- **Example**:
  ```json
  {
    "_id": "681e0e2fb636a5c82216bbe5",
    "studentId": "681d9ab3269f03575cfbd937",
    "driveId": "681e0d7eb636a5c82216bbe4"
  }
  ```

## Notes
- `applicableClasses` in `Drives` is stored as a comma-separated string (e.g., "5,6,7") and formatted as "5, 6, 7" in the frontend.
- `availableDoses` in `Drives` is computed in `DashboardPage.jsx` (`totalDoses - vaccinationCount`) but may be stored in the database.
- MongoDB is hosted locally at `mongodb://localhost:27017/school-vaccination`.