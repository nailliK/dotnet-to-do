# Task Management App

Full-stack to-do app with .NET 8 API, Next.js frontend, JWT auth, and SQLite.

## Features

- JWT authentication (register/login)
- Nested tasks (sub-tasks)
- Task completion dependencies (blocked by sibling)
- Drag and drop sorting
- Filtering by status
- Soft deletes with cascading

## Setup

### API

```bash
cd ToDos
dotnet user-secrets set "Jwt:Key" "YourSecretKeyThatIsAtLeast32Characters!"
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

Runs at `http://localhost:5169`. Swagger at `/swagger`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Runs at `http://localhost:3000`.

### Tests

```bash
# Backend
dotnet test

# Frontend
cd frontend && npm test
```

### Docker

```bash
docker compose build --no-cache && docker compose up -d
```

## Assumptions

- Single user per session
- One blocker per task for simple for MVP
- API supports infinite sub-task depth; front-end displays only parent → sub-task
- Blocked-by enforcement is client-side only for simplicity
- Sort order gaps after deletion

## Future Considerations

- Enhance the front-end with smoother state/loading changes
- Create join table for multiple blocking tasks
- Token refreshes
- Front and back-end pagination
- Use raw SQL for querying children during soft-delete cascades
- Rate limiting on auth endpoints
- Backend validation for blocked-by status enforcement    
