
# Chat Application (Full Stack)

This is a **full-stack chat application** built for learning and practice.

The project contains:
- **Frontend** (UI / client side)
- **Backend** (API / server side)

I built this project step by step while learning, sometimes with help from online resources and AI.
This README is written so that you can understand what is where and how things work.

---

LIVE DEMO
https://chat-app-phi-ruddy-92.vercel.app

## Project Structure

```
chatapp/
│
├── frontend/        # Frontend code (React / UI)
├── backend/         # Backend code (Django API)
├── README.md        # Project documentation (this file)
```

---

## Frontend (Client Side)

### Tech Used
- React
- JavaScript
- HTML & CSS
- Fetch (for API calls)

### What Frontend Does
- Shows the user interface
- Handles user interaction (chat UI, forms, buttons)
- Sends requests to backend APIs
- Displays responses from the server

### Frontend Folder Structure (example)
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── api/            # API call logic
│   ├── appFeatures/    # App features
│   ├── config/         # App configuration
│   ├── store/          # App store
│   ├── App.js
│   └── index.js
├── public/
└── package.json
```

### How to Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend usually runs on:
```
http://localhost:5173
```

---

## Backend (Server Side)

### Tech Used
- Python
- Django
- Django REST Framework
- SQLite (default, for development)
- PostgreSQL (for production)

### What Backend Does
- Handles API requests from frontend
- Manages business logic
- Handles authentication (login/signup if enabled)
- Stores and retrieves data from database

### Backend Folder Structure (example)
```
backend/
├── backend/
│   ├── settings.py     # Django settings
│   ├── prod_settings.py     # Django  for production
│   ├── urls.py         # URL routing
│   ├── wsgi.py
│   └── asgi.py
├── chatapp/                # Main Django app
├── manage.py
└── requirements.txt
```

### How to Run Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver # for normal run
daphne -b 127.0.0.1 -p 8000 chatapp.asgi:application # for websocket run 
```

Backend usually runs on:
```
http://localhost:8000
```

---

## Connecting Frontend & Backend

- Frontend makes API requests to backend URLs
- Backend must allow CORS (Cross-Origin requests)
- API base URL example:
```
http://localhost:8000/api/
```

Make sure:
- Backend is running first
- API URLs are correct in frontend code

---

## Environment Variables

Some values should NOT be hardcoded.

Example:
- Secret keys
- API keys
- Debug flags

Use:
- `.env` file
- Django settings environment variables

Never push secrets to GitHub.

---

## Common Problems I Faced

- Django settings not loading correctly
- CORS issues between frontend and backend
- Chrome security warnings on deployment
- Login/signup triggering browser warnings on new domains

These are **normal learning issues**, not failures.

---

## Deployment Notes

- Frontend deployed separately (Vercel)
- Backend deployed separately (Render)
- Custom domain is recommended for production
- New domains may get browser warnings initially

---

## Future Improvements
These features are intentionally listed to reflect backend progress and learning goals:

- Better authentication flow
- Better UI design
- Error handling
- Security improvements
- User presence (online / offline)
- Typing indicator shown in UI
- Password change functionality
- Global chat room

---

## Final Note (for future me)

This project is part of my learning journey.
The code may not be perfect, but it shows progress.
Understand it, improve it, and rebuild it better next time.
