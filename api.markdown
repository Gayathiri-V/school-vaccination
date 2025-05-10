# School Vaccination Portal - Backend API Documentation

## Base URL
`http://localhost:5000`

## Overview
The School Vaccination Portal’s backend is built with **Node.js**, **Express**, and **Mongoose**, providing RESTful API endpoints to manage vaccination data. The API serves the React frontend (`DashboardPage.jsx`, `DrivesPage.jsx`) and interacts with a MongoDB database (`school-vaccination`). Routes are organized by resource: `dashboard`, `drives`, `vaccines`, `students`, `vaccinations`, and `reports`. Each resource (except `dashboard` and `reports`) supports standard CRUD operations plus a "get all" endpoint:

- **GET /:resource/get-all**: Retrieve all records.
- **GET /:resource/:id**: Retrieve a record by ID.
- **POST /:resource/create**: Create a new record.
- **PUT /:resource/update/:id**: Update a record by ID.
- **DELETE /:resource/delete/:id**: Delete a record by ID.

The `dashboard` module provides aggregated data, and `reports` generates vaccination reports, so they deviate from the full CRUD pattern.

## Authentication
- Assumed to be handled by middleware (e.g., JWT or session-based) in `server.js`.
- All endpoints require coordinator access (e.g., `admin@school.com`, `admin123`).
- No explicit authentication logic in provided routes.

## Error Handling
- **Success**: 
  - 200 OK (GET, PUT)
  - 201 Created (POST)
  - 200 OK with message (DELETE)
- **Errors**:
  - **400 Bad Request**: Invalid input or missing required fields.
  - **404 Not Found**: Resource not found.
  - **500 Internal Server Error**: Database or server errors.
  - Response: `{ "message": "<error description>" }`

## Routes

### 1. Dashboard
Provides aggregated data for the dashboard.

#### GET /api/dashboard
- **Description**: Retrieves aggregated data for the dashboard, including students, vaccinations, vaccines, drives, and all vaccination records.
- **Backend Logic**:
  - Aggregates `Students` collection using Mongoose `$lookup` to join:
    - `vaccinations`: Vaccinations for each student (`studentId`).
    - `vaccines`: All vaccines (projected to `_id`, `name`).
    - `drives`: All drives (projected to `_id`, `name`, `date`, `vaccineId`, `totalDoses`, `availableDoses`, `applicableClasses`, `enabled`).
    - `allVaccinations`: All vaccinations (projected to `driveId`).
  - Adds `allVaccinationsCount` field.
  - Logs data for debugging.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "_id": "<student_id>",
        "id": "1",
        "name": "Nandha",
        "studentClass": "5",
        "vaccinations": [
          { "_id": "<vaccination_id>", "studentId": "<student_id>", "driveId": "<drive_id>" }
        ],
        "vaccines": [
          { "_id": "<vaccine_id>", "name": "Sample Vax" }
        ],
        "drives": [
          {
            "_id": "<drive_id>",
            "name": "Drive 2025",
            "date": "2025-05-15T00:00:00.000Z",
            "vaccineId": "<vaccine_id>",
            "totalDoses": 100,
            "availableDoses": 90,
            "applicableClasses": "5,6,7",
            "enabled": true
          }
        ],
        "allVaccinations": [
          { "_id": "<vaccination_id>", "driveId": "<drive_id>" }
        ],
        "allVaccinationsCount": 10
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Server error" }` (e.g., database connection failure)
- **File**: `routes/dashboard.js`

### 2. Drives
Manages vaccination drives.

#### GET /api/drives/get-all
- **Description**: Retrieves all drives.
- **Backend Logic**:
  - Queries `Drive.find({})`.
  - Returns all drive documents.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "_id": "<drive_id>",
        "name": "Drive 2025",
        "date": "2025-05-15T00:00:00.000Z",
        "vaccineId": "<vaccine_id>",
        "totalDoses": 100,
        "availableDoses": 90,
        "applicableClasses": "5,6,7",
        "enabled": true
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Failed to fetch drives" }`
- **File**: `routes/drive.js`

#### GET /api/drives/:id
- **Description**: Retrieves a single drive by ID.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Queries `Drive.findById(id)`.
  - Returns drive document or 404 if not found.
- **Request**:
  - **Method**: GET
  - **Params**: `id` (drive ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<drive_id>",
      "name": "Drive 2025",
      "date": "2025-05-15T00:00:00.000Z",
      "vaccineId": "<vaccine_id>",
      "totalDoses": 100,
      "availableDoses": 90,
      "applicableClasses": "5,6,7",
      "enabled": true
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid drive ID" }`
  - **404**: `{ "message": "Drive not found" }`
  - **500**: `{ "message": "Failed to fetch drive" }`
- **File**: `routes/drive.js`

#### POST /api/drives/create
- **Description**: Creates a new drive.
- **Backend Logic**:
  - Validates required fields: `name`, `date`, `vaccineId`, `totalDoses`, `applicableClasses`, `enabled`.
  - Verifies `vaccineId` exists in `Vaccines`.
  - Ensures `date` is a valid ISO date (assumed ≥ 15 days ahead).
  - Creates new `Drive` document with `availableDoses` initialized (e.g., equal to `totalDoses`).
  - Saves to `Drives` collection.
- **Request**:
  - **Method**: POST
  - **Params**: None
  - **Body**:
    ```json
    {
      "name": "Drive 2025",
      "date": "2025-05-15",
      "vaccineId": "<vaccine_id>",
      "totalDoses": 100,
      "applicableClasses": "5,6,7",
      "enabled": true
    }
    ```
- **Response**:
  - **Status**: 201 Created
  - **Body**:
    ```json
    {
      "_id": "<drive_id>",
      "name": "Drive 2025",
      "date": "2025-05-15T00:00:00.000Z",
      "vaccineId": "<vaccine_id>",
      "totalDoses": 100,
      "availableDoses": 100,
      "applicableClasses": "5,6,7",
      "enabled": true
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input: missing required fields" }`
  - **400**: `{ "message": "Invalid vaccineId" }`
  - **500**: `{ "message": "Failed to create drive" }`
- **File**: `routes/drive.js`

#### PUT /api/drives/update/:id
- **Description**: Updates an existing drive.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Validates input fields (same as POST).
  - Verifies `vaccineId` exists.
  - Updates `Drive` document using `findByIdAndUpdate`.
  - May adjust `availableDoses` if `totalDoses` changes (assumed).
- **Request**:
  - **Method**: PUT
  - **Params**: `id` (drive ObjectId)
  - **Body**:
    ```json
    {
      "name": "Drive 2025 Updated",
      "date": "2025-05-16",
      "vaccineId": "<vaccine_id>",
      "totalDoses": 120,
      "applicableClasses": "5,6",
      "enabled": false
    }
    ```
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<drive_id>",
      "name": "Drive 2025 Updated",
      "date": "2025-05-16T00:00:00.000Z",
      "vaccineId": "<vaccine_id>",
      "totalDoses": 120,
      "availableDoses": 110,
      "applicableClasses": "5,6",
      "enabled": false
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input" }`
  - **404**: `{ "message": "Drive not found" }`
  - **500**: `{ "message": "Failed to update drive" }`
- **File**: `routes/drive.js`

#### DELETE /api/drives/delete/:id
- **Description**: Deletes a drive.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Deletes `Drive` document using `findByIdAndDelete`.
  - Deletes related `Vaccination` documents (assumed for data integrity).
- **Request**:
  - **Method**: DELETE
  - **Params**: `id` (drive ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    { "message": "Drive deleted" }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid drive ID" }`
  - **404**: `{ "message": "Drive not found" }`
  - **500**: `{ "message": "Failed to delete drive" }`
- **File**: `routes/drive.js`

### 3. Vaccines
Manages vaccine data.

#### GET /api/vaccines/get-all
- **Description**: Retrieves all vaccines.
- **Backend Logic**:
  - Queries `Vaccine.find({})`.
  - Returns all vaccine documents.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "_id": "<vaccine_id>",
        "name": "Sample Vax",
        "description": "Test vaccine"
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Failed to fetch vaccines" }`
- **File**: `routes/vaccine.js`

#### GET /api/vaccines/:id
- **Description**: Retrieves a single vaccine by ID.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Queries `Vaccine.findById(id)`.
  - Returns vaccine document or 404 if not found.
- **Request**:
  - **Method**: GET
  - **Params**: `id` (vaccine ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<vaccine_id>",
      "name": "Sample Vax",
      "description": "Test vaccine"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid vaccine ID" }`
  - **404**: `{ "message": "Vaccine not found" }`
  - **500**: `{ "message": "Failed to fetch vaccine" }`
- **File**: `routes/vaccine.js`

#### POST /api/vaccines/create
- **Description**: Creates a new vaccine.
- **Backend Logic**:
  - Validates `name` (required), `description` (optional).
  - Creates new `Vaccine` document.
  - Saves to `Vaccines` collection.
- **Request**:
  - **Method**: POST
  - **Params**: None
  - **Body**:
    ```json
    {
      "name": "Sample Vax",
      "description": "Test vaccine"
    }
    ```
- **Response**:
  - **Status**: 201 Created
  - **Body**:
    ```json
    {
      "_id": "<vaccine_id>",
      "name": "Sample Vax",
      "description": "Test vaccine"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input: name required" }`
  - **500**: `{ "message": "Failed to create vaccine" }`
- **File**: `routes/vaccine.js`

#### PUT /api/vaccines/update/:id
- **Description**: Updates an existing vaccine.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Validates input fields (`name`, `description`).
  - Updates `Vaccine` document using `findByIdAndUpdate`.
- **Request**:
  - **Method**: PUT
  - **Params**: `id` (vaccine ObjectId)
  - **Body**:
    ```json
    {
      "name": "Sample Vax Updated",
      "description": "Updated test vaccine"
    }
    ```
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<vaccine_id>",
      "name": "Sample Vax Updated",
      "description": "Updated test vaccine"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input" }`
  - **404**: `{ "message": "Vaccine not found" }`
  - **500**: `{ "message": "Failed to update vaccine" }`
- **File**: `routes/vaccine.js`

#### DELETE /api/vaccines/delete/:id
- **Description**: Deletes a vaccine.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Checks if vaccine is referenced by `Drives` (prevent deletion if used).
  - Deletes `Vaccine` document using `findByIdAndDelete`.
- **Request**:
  - **Method**: DELETE
  - **Params**: `id` (vaccine ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    { "message": "Vaccine deleted" }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid vaccine ID" }`
  - **404**: `{ "message": "Vaccine not found" }`
  - **400**: `{ "message": "Vaccine is used in drives" }`
  - **500**: `{ "message": "Failed to delete vaccine" }`
- **File**: `routes/vaccine.js`

### 4. Students
Manages student data.

#### GET /api/students/get-all
- **Description**: Retrieves all students.
- **Backend Logic**:
  - Queries `Student.find({})`.
  - Returns all student documents.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "_id": "<student_id>",
        "id": "1",
        "name": "Nandha",
        "studentClass": "5"
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Failed to fetch students" }`
- **File**: `routes/student.js`

#### GET /api/students/:id
- **Description**: Retrieves a single student by ID.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Queries `Student.findById(id)`.
  - Returns student document or 404 if not found.
- **Request**:
  - **Method**: GET
  - **Params**: `id` (student ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<student_id>",
      "id": "1",
      "name": "Nandha",
      "studentClass": "5"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid student ID" }`
  - **404**: `{ "message": "Student not found" }`
  - **500**: `{ "message": "Failed to fetch student" }`
- **File**: `routes/student.js`

#### POST /api/students/create
- **Description**: Creates a new student.
- **Backend Logic**:
  - Validates `id` (unique), `name`, `studentClass` (required).
  - Creates new `Student` document.
  - Saves to `Students` collection.
- **Request**:
  - **Method**: POST
  - **Params**: None
  - **Body**:
    ```json
    {
      "id": "1",
      "name": "Nandha",
      "studentClass": "5"
    }
    ```
- **Response**:
  - **Status**: 201 Created
  - **Body**:
    ```json
    {
      "_id": "<student_id>",
      "id": "1",
      "name": "Nandha",
      "studentClass": "5"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input: id already exists" }`
  - **400**: `{ "message": "Invalid input: missing required fields" }`
  - **500**: `{ "message": "Failed to create student" }`
- **File**: `routes/student.js`

#### PUT /api/students/update/:id
- **Description**: Updates an existing student.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Validates input fields (`id`, `name`, `studentClass`).
  - Ensures `id` remains unique if changed.
  - Updates `Student` document using `findByIdAndUpdate`.
- **Request**:
  - **Method**: PUT
  - **Params**: `id` (student ObjectId)
  - **Body**:
    ```json
    {
      "id": "1",
      "name": "Nandha Kumar",
      "studentClass": "6"
    }
    ```
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<student_id>",
      "id": "1",
      "name": "Nandha Kumar",
      "studentClass": "6"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input" }`
  - **404**: `{ "message": "Student not found" }`
  - **400**: `{ "message": "Student ID already exists" }`
  - **500**: `{ "message": "Failed to update student" }`
- **File**: `routes/student.js`

#### DELETE /api/students/delete/:id
- **Description**: Deletes a student.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Checks if student is referenced by `Vaccinations` (prevent deletion if used).
  - Deletes `Student` document using `findByIdAndDelete`.
- **Request**:
  - **Method**: DELETE
  - **Params**: `id` (student ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    { "message": "Student deleted" }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid student ID" }`
  - **404**: `{ "message": "Student not found" }`
  - **400**: `{ "message": "Student has vaccination records" }`
  - **500**: `{ "message": "Failed to delete student" }`
- **File**: `routes/student.js`

### 5. Vaccinations
Manages vaccination records.

#### GET /api/vaccinations/get-all
- **Description**: Retrieves all vaccination records.
- **Backend Logic**:
  - Queries `Vaccination.find({})`.
  - Returns all vaccination documents.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "_id": "<vaccination_id>",
        "studentId": "<student_id>",
        "driveId": "<drive_id>"
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Failed to fetch vaccinations" }`
- **File**: `routes/vaccination.js`

#### GET /api/vaccinations/:id
- **Description**: Retrieves a single vaccination record by ID.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Queries `Vaccination.findById(id)`.
  - Returns vaccination document or 404 if not found.
- **Request**:
  - **Method**: GET
  - **Params**: `id` (vaccination ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<vaccination_id>",
      "studentId": "<student_id>",
      "driveId": "<drive_id>"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid vaccination ID" }`
  - **404**: `{ "message": "Vaccination not found" }`
  - **500**: `{ "message": "Failed to fetch vaccination" }`
- **File**: `routes/vaccination.js`

#### POST /api/vaccinations/create
- **Description**: Creates a new vaccination record.
- **Backend Logic**:
  - Validates `studentId`, `driveId` (required, must exist).
  - Checks if student is eligible (`studentClass` in `Drive.applicableClasses`).
  - Verifies `Drive.enabled` and `availableDoses > 0`.
  - Creates new `Vaccination` document.
  - Decrements `Drive.availableDoses`.
  - Saves to `Vaccinations` and updates `Drives`.
- **Request**:
  - **Method**: POST
  - **Params**: None
  - **Body**:
    ```json
    {
      "studentId": "<student_id>",
      "driveId": "<drive_id>"
    }
    ```
- **Response**:
  - **Status**: 201 Created
  - **Body**:
    ```json
    {
      "_id": "<vaccination_id>",
      "studentId": "<student_id>",
      "driveId": "<drive_id>"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid studentId or driveId" }`
  - **400**: `{ "message": "Student not eligible for drive" }`
  - **400**: `{ "message": "Drive disabled or no doses available" }`
  - **500**: `{ "message": "Failed to create vaccination" }`
- **File**: `routes/vaccination.js`

#### PUT /api/vaccinations/update/:id
- **Description**: Updates an existing vaccination record.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Validates `studentId`, `driveId` (must exist).
  - Checks eligibility and `Drive` status (as in POST).
  - Updates `Vaccination` document using `findByIdAndUpdate`.
  - Adjusts `availableDoses` in old and new `Drive` if `driveId` changes.
- **Request**:
  - **Method**: PUT
  - **Params**: `id` (vaccination ObjectId)
  - **Body**:
    ```json
    {
      "studentId": "<student_id>",
      "driveId": "<new_drive_id>"
    }
    ```
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    {
      "_id": "<vaccination_id>",
      "studentId": "<student_id>",
      "driveId": "<new_drive_id>"
    }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid input" }`
  - **404**: `{ "message": "Vaccination not found" }`
  - **400**: `{ "message": "Student not eligible for drive" }`
  - **500**: `{ "message": "Failed to update vaccination" }`
- **File**: `routes/vaccination.js`

#### DELETE /api/vaccinations/delete/:id
- **Description**: Deletes a vaccination record.
- **Backend Logic**:
  - Validates `id` (ObjectId).
  - Deletes `Vaccination` document using `findByIdAndDelete`.
  - Increments `Drive.availableDoses` for the associated drive.
- **Request**:
  - **Method**: DELETE
  - **Params**: `id` (vaccination ObjectId)
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    { "message": "Vaccination deleted" }
    ```
- **Errors**:
  - **400**: `{ "message": "Invalid vaccination ID" }`
  - **404**: `{ "message": "Vaccination not found" }`
  - **500**: `{ "message": "Failed to delete vaccination" }`
- **File**: `routes/vaccination.js`

### 6. Reports
Generates vaccination reports.

#### GET /api/reports/vaccination-status
- **Description**: Retrieves a report on vaccination status by vaccine and class.
- **Backend Logic**:
  - Aggregates `Vaccinations` with `$lookup` to join `Students`, `Drives`, `Vaccines`.
  - Groups by `vaccineId` and `studentClass`.
  - Calculates `vaccinatedCount` and `totalStudents` (from `Students`).
  - Projects `vaccineName`, `class`, `vaccinatedCount`, `totalStudents`.
- **Request**:
  - **Method**: GET
  - **Params**: None
  - **Body**: None
- **Response**:
  - **Status**: 200 OK
  - **Body**:
    ```json
    [
      {
        "vaccineName": "Sample Vax",
        "class": "5",
        "vaccinatedCount": 50,
        "totalStudents": 100
      }
    ]
    ```
- **Errors**:
  - **500**: `{ "message": "Failed to generate report" }`
- **File**: `routes/reports.js`

## Notes
- **Route Consistency**:
  - `drives`, `vaccines`, `students`, `vaccinations` follow the pattern: `GET /get-all`, `GET /:id`, `POST /create`, `PUT /update/:id`, `DELETE /delete/:id`.
  - `dashboard` has only `GET /api/dashboard` for aggregated data.
  - `reports` has only `GET /api/reports/vaccination-status` for reporting.
- **Inferred Routes**:
  - `drive.js`, `student.js`, `vaccine.js` routes are inferred from `DrivesPage.jsx` usage and test data commands.
  - `GET /:id`, `PUT /update/:id`, `DELETE /delete/:id` for `vaccines`, `students` are assumed for completeness, though not explicitly used in frontend.
- **Validation**:
  - ObjectId validation for `id`, `vaccineId`, `studentId`, `driveId`.
  - Eligibility checks for vaccinations (e.g., `studentClass` in `applicableClasses`).
  - Date validation for drives (assumed ≥ 15 days ahead).
- **Logging**:
  - Implemented in `dashboard.js` (e.g., `console.log('Dashboard data generated', ...)`).
  - Assumed in other routes for debugging.
- **MongoDB**:
  - Connection: `MONGODB_URI=mongodb://localhost:27017/school-vaccination` (in `server.js`).
  - Collections: `Students`, `Vaccines`, `Drives`, `Vaccinations`.
- **Frontend Usage**:
  - `DashboardPage.jsx` uses `GET /api/dashboard`.
  - `DrivesPage.jsx` uses `GET /api/drives/get-all`, `POST /api/drives/create`, `PUT /api/drives/update/:id`, `DELETE /api/drives/delete/:id`, `GET /api/vaccines/get-all`, `GET /api/students/get-all`, `POST /api/vaccinations/create`.

#