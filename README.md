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

## Prerequisites

Before getting started, make sure you have the following installed on your machine:

* **Node.js** (v20+ recommended)
* **PostgreSQL**

## Installation & Setup

### 1. Clone the Repository

Clone the project repository and install all required Node.js dependencies:

```bash
git clone https://github.com/tsiorinirina-lgtm/WEB2-Exam-backend.git
cd WEB2-Exam-backend
npm install
```