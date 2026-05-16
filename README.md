# 🏥 TeleClinic

A telemedicine platform built with **FastAPI**, **React**, and **PostgreSQL** — doctors schedule appointments, patients track their consultations, all secured with JWT authentication.

> Built as a portfolio project inspired by real healthtech experience developing telemedicine systems used by clinics and medical professionals.

---

## What it does

- Doctors can register, log in, schedule appointments for patients, and manage their status (confirm, complete, cancel)
- Patients can log in and view their consultations
- Everything is protected by JWT — each role only sees what it should
- The entire stack runs with a single `docker-compose up`

---

## Tech Stack

|              |                                      |
| ------------ | ------------------------------------ |
| **Backend**  | Python 3.12, FastAPI, SQLAlchemy 2.0 |
| **Frontend** | React, Vite                          |
| **Database** | PostgreSQL 16                        |
| **Auth**     | JWT (python-jose) + bcrypt           |
| **DevOps**   | Docker, docker-compose               |
| **Testing**  | pytest + httpx                       |

---

## Getting Started

You only need **Docker** installed.

```bash
git clone https://github.com/your-username/teleclinic.git
cd teleclinic

cp .env.example .env

docker-compose up --build
```

That's it. Three services start automatically:

| Service            | URL                        |
| ------------------ | -------------------------- |
| Frontend           | http://localhost:5173      |
| API                | http://localhost:8000      |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Project Structure

```
teleclinic/
├── app/                        # FastAPI backend
│   ├── core/                   # Config & JWT security
│   ├── models/                 # Database models
│   ├── routers/                # API endpoints
│   ├── schemas/                # Request/response validation
│   ├── services/               # Business logic
│   └── main.py
├── frontend/                   # React frontend
│   └── src/
│       └── App.tsx
├── tests/                      # Automated tests
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

| Method | Endpoint                    | Description          | Auth |
| ------ | --------------------------- | -------------------- | ---- |
| POST   | `/auth/login`               | Get JWT token        | —    |
| POST   | `/users/`                   | Register             | —    |
| GET    | `/users/me`                 | Current user         | ✅   |
| GET    | `/users/`                   | List users           | ✅   |
| PATCH  | `/users/{id}`               | Update user          | ✅   |
| DELETE | `/users/{id}`               | Delete user          | ✅   |
| POST   | `/appointments/`            | Schedule appointment | ✅   |
| GET    | `/appointments/my`          | My appointments      | ✅   |
| PATCH  | `/appointments/{id}`        | Update status        | ✅   |
| DELETE | `/appointments/{id}/cancel` | Cancel               | ✅   |

---

## Running Tests

```bash
docker-compose exec api pytest -v
```

---

## User Roles

| Role      | Access                                          |
| --------- | ----------------------------------------------- |
| `doctor`  | Schedule and manage appointments, view patients |
| `patient` | View own appointments                           |

---

## License

MIT
