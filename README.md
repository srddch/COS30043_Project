# Student Hub – Canvas‑like Communication Platform

A web application built with **Vue 3**, **Bootstrap**that provides a collaborative environment for students. The platform combines course management, interactive discussions, and personal scheduling.

## Key Features

- **User authentication** – Register, login, and role‑based content visibility.
- **Course & activity browsing** – View available courses with search, sorting, and pagination.
- **Course details** – Each course has its own detailed page.
- **Discussion / Help forum** – Create, edit, delete posts; search and sort threads.
- **Social interaction** – Like posts to show appreciation.
- **Personal timetable** – Display your enrolled courses in a weekly schedule.
- **Fully responsive** – Mobile‑first design using Bootstrap grid system.
- **Persistent data** – Backed by a database and RESTful API.

This project meets all functional and technical requirements of the assignment (at least 10 interconnected pages, search/sort, user‑generated content, social features, etc.).

## Installation

- Requirements: Node.js (LTS) + npm
- Frontend dependencies: vue@3, vue-router@4, bootstrap@5, @popperjs/core, axios, chart.js, vue-chartjs
- Frontend dev tools: vite, @vitejs/plugin-vue, concurrently
- Backend dependencies (in /backend): express, cors, dotenv, @supabase/supabase-js

```bash
# Install all dependencies (recommended)
npm install
cd backend && npm install
```

```bash
# Install plugins/packages individually (optional)
# Frontend (run at project root)
npm install vue vue-router bootstrap @popperjs/core axios chart.js vue-chartjs concurrently

# Backend (run in /backend)
cd backend
npm install express cors dotenv @supabase/supabase-js
```

```bash
# Start (run at project root)
npm run dev
```

- Backend env: create `backend/.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PORT`
