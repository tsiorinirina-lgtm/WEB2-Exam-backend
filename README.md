# ExamHub - Backend

RESTful API for creating and managing exams, conducting real-time online tests for students, and automatically calculating results.

## Tech Stack

* **Framework:** Express.js (TypeScript)
* **Database:** PostgreSQL
* **ORM / Database Driver:** `pg` (`node-postgres`)
* **Authentication:** JWT (JSON Web Tokens)

## Project Structure

```text
backend/
├── database/            # SQL scripts, migrations, or database configurations
├── docs/                # OpenAPI / Swagger documentation
│   ├── components/      # Reusable OpenAPI schemas and components
│   ├── paths/           # Route definitions for API documentation
│   └── openapi.yaml     # Main OpenAPI/Swagger entry file
├── node_modules/        # Node.js dependencies (ignored by Git)
├── src/                 # Main application source code
│   ├── controllers/     # HTTP request handlers
│   ├── errors/          # Custom error classes
│   ├── middlewares/     # Express middlewares (Auth, Error handler, etc.)
│   ├── models/          # Data entities, types, and interfaces
│   ├── repositories/    # Direct database query layer
│   ├── security/        # Security utilities (hashing, JWT handling, etc.)
│   └── services/        # Business logic layer
├── .env.example         # Template for environment variables
├── index.ts             # Express application entry point
├── package-lock.json    
├── package.json   
└── tsconfig.json  
```
## Prerequisites

Before getting started, make sure you have the following installed on your machine:

* **Node.js** (v20+ recommended)
* **PostgreSQL**

## Installation & Setup

### 1. Clone the Repository

Clone the project repository and install all required Node.js dependencies:

``` bash
git clone https://github.com/tsiorinirina-lgtm/WEB2-Exam-backend.git
cd WEB2-Exam-backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file and rename the copy to `.env`:

``` env
# Port number
PORT=3000
FRONTEND_URLS=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=examhub
DB_USER=your_username
DB_PASSWORD=your_password

# JWT configuration
JWT_SECRET=replace_with_long_random_string_min_32_chars
JWT_ACCESS_EXPIRATION=1h

# Bcrypt configuration
SALT_ROUNDS=10
```

### 3. Database Setup & Seed Data

In PostgreSQL, create a new database:

``` bash
psql -U postgres -c "CREATE DATABASE examhub WITH OWNER '<your_username>'"
```

Run the schema and seed files to construct the database structures and insert test data:

``` bash
psql -d examhub -U <your_username> -f database.sql -f seed.sql
```

### 4. Run the Development Server
``` bash
npm run dev
```
