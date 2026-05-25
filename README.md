# Leave Management System

Full-stack leave management app with a Spring Boot backend, PostgreSQL, Keycloak authentication, and a React/Vite frontend.

## Project Structure

```text
leave-management-system/leave-management-system  Spring Boot backend and Docker Compose
leave-frontend                                   React/Vite frontend
```

## Prerequisites

- Java 17
- Docker and Docker Compose
- Node.js and npm

## 1. Start PostgreSQL and Keycloak

Run Docker Compose from the backend project directory:

```bash
cd leave-management-system/leave-management-system
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Keycloak on `http://localhost:9090`

Keycloak admin login:

```text
Username: admin
Password: password
```

The compose setup imports this Keycloak configuration on first startup:

- Realm: `leave-management-system`
- Client ID: `leave-management-web`
- Client secret: `emanbfVfDLqtnkmRchIoLriPDYzd7tYz`
- Client roles: `role_admin`, `role_user`
- Frontend origin: `http://localhost:5173`

If you already started Keycloak before this realm import was added, reset the local Docker volumes and start again:

```bash
docker compose down -v
docker compose up -d
```

Create users in Keycloak after startup:

1. Open `http://localhost:9090/admin`.
2. Select the `leave-management-system` realm.
3. Create a user and set a password in the Credentials tab.
4. Assign one client role from `leave-management-web`: `role_admin` or `role_user`.

## 2. Run the Backend

From the backend directory:

```bash
cd leave-management-system/leave-management-system
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd leave-management-system\leave-management-system
.\mvnw.cmd spring-boot:run
```

The backend runs on `http://localhost:8080`.

Important backend config is in `src/main/resources/application.yml`:

- Keycloak issuer: `http://localhost:9090/realms/leave-management-system`
- PostgreSQL URL: `jdbc:postgresql://localhost:5432/leave-management`
- API CORS origin: `http://localhost:5173`

## 3. Run the Frontend

From the frontend directory:

```bash
cd leave-frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Authentication

All application API endpoints require a Bearer token. The frontend logs in through Keycloak using the password grant.

Token endpoint:

```text
POST http://localhost:9090/realms/leave-management-system/protocol/openid-connect/token
```

Form fields:

```text
grant_type=password
client_id=leave-management-web
client_secret=emanbfVfDLqtnkmRchIoLriPDYzd7tYz
username=<keycloak-username>
password=<keycloak-password>
```

Use the returned `access_token` as:

```text
Authorization: Bearer <access_token>
```

## API Endpoints

Base URL:

```text
http://localhost:8080/api
```

### Users

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Authenticated | Gets the current user from the JWT. Creates the user record on first login. |
| `GET` | `/users/admin/all-users` | `role_admin` | Lists users with the employee role. |

### Leave Requests

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/leaves/apply` | `role_user` | Applies for leave. New requests are created as `PENDING`. |
| `GET` | `/leaves/my` | Authenticated | Lists the current user's leave requests. Optional `status` query filter. |
| `GET` | `/leaves/my/statistics` | Authenticated | Returns leave counts for the current user. |
| `GET` | `/leaves/colleagues/upcoming-approved` | Authenticated | Lists upcoming approved leaves for colleagues. |
| `GET` | `/leaves/admin/all` | `role_admin` | Lists all leave requests. Optional `status` and `username` query filters. |
| `GET` | `/leaves/admin/statistics` | `role_admin` | Returns total, pending, approved, and rejected leave counts. |
| `PUT` | `/leaves/admin/{requestId}/review` | `role_admin` | Approves or rejects a pending leave request. |

### Request Bodies

Apply for leave:

```json
{
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "leaveType": "CASUAL",
  "reason": "Family event"
}
```

Review leave:

```json
{
  "status": "APPROVED"
}
```

Reject leave:

```json
{
  "status": "REJECTED",
  "rejectionReason": "Insufficient leave balance"
}
```

### Query Parameters

`GET /leaves/my`

```text
status=PENDING|APPROVED|REJECTED
```

`GET /leaves/admin/all`

```text
status=PENDING|APPROVED|REJECTED
username=<partial username>
```

### Enums

Leave statuses:

```text
PENDING, APPROVED, REJECTED
```

Leave types:

```text
CASUAL, SICK, VACATION, UNPAID
```

Keycloak client roles:

```text
role_admin, role_user
```

Backend stored roles:

```text
ROLE_ADMIN, ROLE_USER
```
