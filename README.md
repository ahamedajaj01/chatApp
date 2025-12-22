# Full-Stack Chat Application

A real-time chat application built for learning and practice, featuring a React frontend and a Django backend.

**Live Demo:** [https://my-chat-app-demo.vercel.app](https://my-chat-app-demo.vercel.app)

---

## 📂 Project Structure

```
chatapp/
├── backend/                # Django Backend
│   ├── chatapp/            # Main App Logic (Views, Models, Serializers, url)
│   ├── chatproject/        # Project Settings (ASGI, WSGI, URLs)
│   ├── manage.py           # Django Management Script
│   └── requirements.txt    # Python Dependencies
│
├── frontend/               # React Frontend
│   └── chatApp/
│       ├── public/         # Static Assets
│       ├── src/
│       │   ├── api/        # API Services (Auth, Client)
│       │   ├── appFeatures/# Redux Slices (Auth, Chat)
│       │   ├── components/ # UI Components
│       │   ├── config/     # App Config
│       │   ├── pages/      # Route Pages (Login, Chat, etc.)
│       │   ├── store/      # Redux Store
│       │   ├── App.jsx     # Main App Component
│       │   └── main.jsx    # Entry Point
│       ├── package.json    # Node Dependencies
│       └── vite.config.js  # Vite Configuration
│
└── README.md               # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+

### 1. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
# OR for WebSockets:
# daphne -b 127.0.0.1 -p 8000 chatproject.asgi:application
```
*Backend runs on: `http://localhost:8000`*

### 2. Frontend Setup (React)

```bash
cd frontend/chatApp

# Install dependencies
npm install

# Start development server
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🛠️ Tech Stack

### Frontend
- **React**: UI Library
- **Redux Toolkit**: State Management
- **Vite**: Build Tool
- **Axios**: API Requests
- **Bootstrap**: Styling

### Backend
- **Django**: Web Framework
- **Django REST Framework**: API
- **Django Channels**: WebSockets (Real-time features)
- **SQLite**: Database (Dev) / **PostgreSQL** (Prod)

---

## ✨ Features
- **User Authentication**: Login, Signup, Logout (JWT).
- **Real-time Messaging**: Instant updates using WebSockets.
- **Private Chats**: One-on-one conversations.
- **Message History**: Persistent chat history.
- **Responsive UI**: Works on desktop and mobile.

---

## 🔮 Future Improvements
These features are intentionally listed to reflect backend progress and learning goals:

- Better authentication flow
- Better UI design
- Error handling
- Security improvements
-User presence (online / offline)
- Typing indicator shown in UI
- Password change functionality
- Global chat room

---

## 🌍 Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com).
- **Backend**: Deployed on [Render](https://render.com).

---

## 📝 Environment Variables

Create a `.env` file in your backend and frontend directories to manage secrets.

**Backend (.env)**
```
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

---

*This project is part of a learning journey. It demonstrates full-stack development concepts including REST APIs, WebSockets, and Authentication.*
