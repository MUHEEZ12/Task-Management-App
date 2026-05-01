# TaskFlow

**Modern Kanban Task Management App** built for portfolio showcase with advanced UI, analytics, real-time updates, and productivity tools.

## ?? What This App Does

TaskFlow is a full-stack task management platform that lets users:
- Create and manage **Kanban boards** with multiple columns
- Add, edit, prioritize, and assign tasks
- Drag and drop tasks between columns
- Track progress with a **real-time analytics dashboard**
- Search and filter tasks quickly
- Use a **Pomodoro productivity timer**
- Toggle **dark mode** for a modern SaaS experience
- See interactive **task activity** and notifications
- Authenticate with **JWT login** and manage user settings

## ? Key Features

- **Kanban boards** with task creation and column workflows
- **Drag & drop** task movement with animations
- **Advanced search and filtering** by keyword, priority, status, tags, and dates
- **Analytics dashboard** with completion rates, priority breakdown, and task trends
- **Dark mode** and responsive UI for mobile and desktop
- **Pomodoro timer** for focused work sessions
- **Task templates** for fast task creation
- **User authentication** with persistent login state
- **Toast notifications** and polished UI feedback

## ?? Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **State:** Zustand
- **Real-time:** Socket.IO
- **API:** Axios
- **Icons:** Lucide React

## ?? Project Structure

```
task-management-app/
+-- client/                 # React frontend
¦   +-- src/
¦   ¦   +-- components/    # Reusable UI components
¦   ¦   +-- pages/         # Page views
¦   ¦   +-- hooks/         # Custom hooks
¦   ¦   +-- context/       # Zustand stores
¦   ¦   +-- services/      # API and socket clients
¦   ¦   +-- utils/         # Helper functions
¦   ¦   +-- App.jsx
¦   ¦   +-- main.jsx
¦   +-- package.json
¦   +-- vite.config.js
+-- server/                 # Express backend
    +-- src/
    ¦   +-- controllers/   # Route handlers
    ¦   +-- models/        # MongoDB schemas
    ¦   +-- routes/        # API endpoints
    ¦   +-- middleware/    # Auth and error handling
    ¦   +-- utils/         # Utility functions
    ¦   +-- index.js       # Server entry
    +-- package.json
    +-- .env.example
```

## ?? Local Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm start
```

Server should run on `http://localhost:5000`

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend should run on `http://localhost:5173`

## ?? Demo Credentials

Use this demo login to test the app quickly:

- **Email:** `test@taskflow.com`
- **Password:** `password123`

## ?? Deployment

For production, deploy the backend and frontend separately.

### Recommended Flow

1. Deploy backend to **Railway** or **Render**
2. Deploy frontend to **Vercel**
3. Set `VITE_API_URL` to your backend URL in Vercel
4. Set `CORS_ORIGIN` in the backend to your frontend domain

## ?? Notes

- This project is built as a **portfolio-ready SaaS clone**
- Great for demonstrating full-stack skills, modern UI, and real-time app development
- Includes **mobile responsiveness**, **dark mode**, and polished interaction design

## ????? Author

Built by **BerryTech** — full-stack developer with a focus on modern React experiences.
