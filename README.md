# CRUD API with In-Memory Database

A Node.js/TypeScript RESTful API for user management with in-memory database and horizontal scaling support.

## Features

- **Full CRUD operations** for users (Create, Read, Update, Delete)
- **In-memory database** with IPC synchronization between processes
- Request validation and error handling:
    - UUID validation
    - Required fields check
    - Data type validation
- Horizontal scaling via **Node.js Cluster API**
- Environment support: development/production
- **Full test coverage** (Jest, Supertest)
- Documented REST API
- Configuration via **environment variables**

## Prerequisites

- Node.js v22.14.0 or higher
- npm v9.8.1 or higher
- TypeScript v5.0.0 or higher (installed automatically)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crud-api.git
cd crud-api
```
Install dependencies:

```bash
npm install
```
## Running the Application
Development Mode
```bash
npm run start:dev  # Hot-reload with ts-node-dev
```
Production Mode
```bash
npm run build      # Compile TypeScript
npm run start:prod # Start compiled version
```
Cluster Mode
```bash
npm run start:multi  # Launch N-1 workers (N = CPU cores)
```

## API Endpoints
| Method   | Endpoint                | Description                     | Status Codes            |
|:--------:|:-----------------------:|:-------------------------------:|:-----------------------:|
| GET      | `/api/users`            | Get all users                   | 200 OK                  |
| GET      | `/api/users/{userId}`   | Get user by ID                  | 200 OK, 400, 404        |
| POST     | `/api/users`            | Create new user                 | 201 Created, 400        |
| PUT      | `/api/users/{userId}`   | Update user                     | 200 OK, 400, 404        |
| DELETE   | `/api/users/{userId}`   | Delete user                     | 204 No Content, 404     |

## Request Examples

Create User:
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "age": 30,
    "hobbies": ["reading", "coding"]
  }'
```
Response:
```bash
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "age": 30,
  "hobbies": ["reading", "coding"]
}
```
Update User:
```bash
curl -X PUT http://localhost:4000/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 31,
    "hobbies": ["swimming"]
  }'
```
Error Example:
```bash
{
  "error": "Invalid UUID format"
}
```
## Testing
Run all tests:
```bash
npm test
```
Test Scenarios:

Full CRUD operations flow

Invalid UUID handling

Missing required fields

Data type validation

Non-existing endpoints

