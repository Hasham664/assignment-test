# Project Management Tool

A full-stack MERN application for managing projects and tasks with role-based access control. Admins can create projects, assign tasks to developers, and track progress. Developers can view and update only their assigned tasks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 18, Tailwind CSS 4, SWR, Axios |
| Backend | Express.js, Node.js (ES Modules) |
| Database | MongoDB with Mongoose |
| Auth | JWT (HttpOnly Cookies), bcrypt |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hasham664/assignment-test.git
cd projec...
```

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/project_db?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
EOF

# Start development server
npm run server
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env

# Start development server
npm run dev
```

### Seed Admin User (Optional)

Register the first user via the UI with role "Admin", or use the API:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"123456","role":"admin"}'
```

## Folder Structure

```
project-management-tool/
├── backend/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middlewere/         # Middleware
│   │   ├── auth.js         # JWT authentication + role authorization
│   │   ├── asyncHandler.js # Async error wrapper
│   │   └── errorHandler.js # Global error handler
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/              # Helpers
│   │   ├── db.js           # MongoDB connection
│   │   ├── response.js     # Standardized API responses
│   │   ├── validate.js     # Validation helper
│   │   └── constants.js    # Shared constants
│   └── server.js           # Entry point
├── frontend/
│   └── src/
│       ├── app/            # Next.js pages (server components)
│       │   ├── login/page.js
│       │   ├── register/page.js
│       │   ├── dashboard/page.js
│       │   ├── projects/page.js
│       │   ├── tasks/page.js
│       │   └── users/page.js
│       ├── components/
│       │   ├── auth/       # Auth guards
│       │   ├── features/   # Page-level client components
│       │   ├── layout/     # Sidebar, dashboard layout
│       │   └── ui/         # Reusable UI primitives
│       ├── contexts/       # React context providers
│       └── lib/            # API client, SWR hooks
```

## ER Diagram

```
┌─────────────────────┐       ┌──────────────────────────┐
│       User          │       │        Project            │
├─────────────────────┤       ├──────────────────────────┤
│ _id        ObjectId │       │ _id           ObjectId   │
│ name       String   │       │ title         String     │
│ email      String   │       │ description   String     │
│ password   String   │       │ createdBy     ObjectId ──┼──┐
│ role       String   │       │ startDate     Date       │  │
│            enum:    │       │ dueDate       Date       │  │
│  "admin"   │        │       │ status        String     │  │
│  "developer"        │       │  enum: active │           │  │
│ timestamps          │       │  completed   │           │  │
└─────────────────────┘       │  on-hold     │           │  │
                              │ assignedDevelopers       │  │
                              │  [ObjectId] ──┐          │  │
                              └──────────────────┤────────┘  │
                                                 │           │
                              ┌──────────────────┤           │
                              │                  │           │
                              ▼                  ▼           │
                      ┌──────────────────────────┐          │
                      │         Task              │          │
                      ├──────────────────────────┤          │
                      │ _id           ObjectId   │          │
                      │ title         String     │          │
                      │ description   String     │          │
                      │ project       ObjectId ──┼──┘       │
                      │ assignedTo    ObjectId ──┼── User    │
                      │ createdBy     ObjectId ──┼──────────┘
                      │ status        String     │
                      │  enum: todo, in-progress,│
                      │  review, done           │
                      │ priority      String     │
                      │  enum: low, medium, high │
                      │ dueDate       Date       │
                      │ timestamps              │
                      └──────────────────────────┘
```

### Relationships
- **User → Project**: One-to-Many (admin creates many projects)
- **User → Task**: One-to-Many (developer is assigned many tasks)
- **Project → Task**: One-to-Many (project contains many tasks)
- **Project → User (assignedDevelopers)**: Many-to-Many (developers assigned to projects)

## API Endpoints

### Auth API
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login, sets HttpOnly cookie | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| POST | `/api/v1/auth/logout` | Clear auth cookie | Yes |

### User API (Admin Only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | List all users | Admin |
| GET | `/api/v1/users/developers` | List all developers | Admin |
| PATCH | `/api/v1/users/:id/role` | Update user role | Admin |

### Project API
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/projects` | Create a new project | Admin |
| GET | `/api/v1/projects` | Get all projects | Admin sees all, Dev sees assigned |
| GET | `/api/v1/projects/:id` | Get project by ID | Admin or assigned dev |
| PUT | `/api/v1/projects/:id` | Update a project | Admin |
| DELETE | `/api/v1/projects/:id` | Delete a project | Admin |

### Task API
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/tasks` | Create a new task | Admin |
| GET | `/api/v1/tasks` | Get tasks | Admin sees all, Dev sees own |
| GET | `/api/v1/tasks/project/:projectId` | Get tasks by project | Yes |
| PUT | `/api/v1/tasks/:id` | Update task | Admin edits all, Dev updates status only |
| DELETE | `/api/v1/tasks/:id` | Delete a task | Admin |

### Dashboard API
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/dashboard/admin` | Admin dashboard metrics | Admin |
| GET | `/api/v1/dashboard/dev` | Developer dashboard | Yes |

### Response Format
```json
{
  "success": true,
  "message": "Task fetched successfully",
  "data": { ... }
}
```

## Project Plan

### Module Breakdown

| Module | Description | Priority |
|--------|-------------|----------|
| Authentication | Register, login, JWT via HttpOnly cookies, role-based access | High |
| User Management | Admin can list users and change roles | Medium |
| Project Management | CRUD projects, assign developers | High |
| Task Management | CRUD tasks, status tracking, assignment | High |
| Dashboard | Admin overview, developer task view | Medium |
| Kanban Board | Drag-and-drop task status updates | Bonus |

### User Roles

**Admin:**
- Create/edit/delete projects
- Create/edit/delete tasks
- Assign tasks to developers
- View all projects and tasks
- Manage user roles
- View dashboard with full metrics

**Developer:**
- View assigned projects
- View and update own tasks (status only)
- View personal dashboard

## Team Simulation

This project was simulated as a three-person team:

### Team Member A: Authentication & User Management
- User model with password hashing (bcrypt)
- JWT authentication via HttpOnly cookies (not localStorage)
- Role-based authorization middleware
- Auth API endpoints (register, login, getMe, logout)
- User API endpoints (list, update role, get developers)
- Login/Register pages with PasswordInput (eye icon toggle)

### Team Member B: Project & Task Management
- Project and Task models with Mongoose relationships
- Project CRUD API with developer assignment
- Task CRUD API with role-based permissions
- Dashboard API (admin and developer views)
- Validation with express-validator
- Database aggregation for metrics

### Team Member C: Frontend Integration
- Next.js App Router with server/client component split
- SWR hooks for data fetching with caching
- Axios instance with `withCredentials: true` (cookie-based auth)
- Reusable UI component library (Button, Input, PasswordInput, Select, Card, Modal, Badge)
- Responsive sidebar layout
- Protected routes with role-based access
- Kanban board with drag-and-drop

## License

ISC
