# Mediprior — Smart Health Portal

> A role-based healthcare platform that connects **patients** and **doctors**: medical records, appointments, real-time chat, a vitals dashboard, and an AI mental-health companion, all in one place.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django_5.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-A30000)
![Channels](https://img.shields.io/badge/Django_Channels-WebSockets-44B78B)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?logo=bootstrap&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)

---

## ✨ Features

### 👤 Accounts & Security
- Separate **Patient** and **Doctor** roles on a custom user model (email login)
- **JWT authentication** (SimpleJWT) with access and refresh tokens
- Password reset by email (request link → set new password)

### 🧑‍⚕️ For Patients
- **Health profile:** DOB, blood group, height/weight, medical history, profile photo
- **Vitals dashboard:** log health metrics with BMI, vitals and heart-rate charts (Chart.js)
- **Medical reports (EMR):** upload, view and delete reports, which connected doctors can access
- **Find doctors:** browse verified doctors and send connection requests
- **Book appointments** from a doctor's available slots

### 🩺 For Doctors
- Professional profile with registration number, council, qualification, specialization, experience, clinic/hospital details, and degree/registration certificate uploads
- **Verification workflow:** `Pending → Verified / Rejected` (only verified doctors appear in search)
- Manage **work hours**, consultation type (online / in-person / both) and chat availability (available / busy / offline)
- Accept or reject patient connection requests
- **Calendar** (FullCalendar) to publish slots, view today's schedule, and add notes and prescriptions to appointments

### 💬 Real-time Chat
- Doctor–patient messaging over **WebSockets** (Django Channels + Daphne)
- JWT-authenticated socket connections via custom middleware
- File and image attachments in chat

### 🤖 AI Mental-Health Companion
- Intent-based chatbot using **TF-IDF + cosine similarity** (scikit-learn), trained on conversational intents and a mental-health FAQ dataset
- **Hard-coded crisis detection:** messages containing self-harm keywords always return emergency resources instead of a model response
- Built-in coping tools: box breathing, 5-4-3-2-1 grounding, affirmations

### 🎨 UI
- Responsive React + React-Bootstrap interface with **light/dark theme**
- Separate dashboards for patients and doctors

---

## 🏗️ Architecture

```
┌─────────────────────────┐   REST (JWT)    ┌──────────────────────────────┐
│  React frontend  :3000  │ ──────────────▶ │  Django + DRF backend  :8000 │
│  React-Bootstrap,       │                 │  core app: users, profiles,  │
│  Chart.js, FullCalendar │ ◀─────────────▶ │  reports, connections,       │
└─────────────────────────┘   WebSocket     │  appointments, AI chat       │
                              ws/chat/<id>/ │  Channels (ASGI / Daphne)    │
                                            └──────────────┬───────────────┘
                                                           ▼
                                               SQLite  ·  media/ (uploads)
```

---

## 📁 Project Structure

```
mediprior_V0/
├── manage.py
├── requirements.txt
├── mediprior_backend/        # Django project: settings, urls, asgi (Channels)
├── core/                     # Main app
│   ├── models.py             # User, PatientProfile, DoctorProfile, MedicalReport,
│   │                         # DoctorPatientConnection, Appointment, Conversation,
│   │                         # Message, PatientHealthMetric
│   ├── views.py              # REST API views
│   ├── consumers.py          # WebSocket chat consumer
│   ├── middleware.py         # JWT auth for WebSockets
│   ├── ai_utils.py           # Mental-health chatbot (TF-IDF + crisis detection)
│   ├── generate_intents.py   # Builds intents.json from Mental_Health_FAQ.csv
│   └── intents.json
└── mediprior_frontend/       # React app (Create React App)
    └── src/
        ├── pages/            # Landing, Login, Signup, Dashboard, FindDoctors,
        │                     # Connections, Reports, Chat, Calendar
        ├── components/       # Dashboard cards, chat, chatbot widget, forms
        ├── context/          # AuthContext, ThemeContext
        └── config.js         # Backend API / WebSocket base URLs
```

---

## 🚀 Getting Started

### Prerequisites
- Python **3.10+**
- Node.js **18+**

### 1. Clone

```bash
git clone https://github.com/KeertanaGupta/mediprior_V0.git
cd mediprior_V0
```

### 2. Backend (port 8000)

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # to verify doctors from /admin
python manage.py runserver
```

`runserver` uses Daphne/Channels, so WebSocket chat works out of the box.

### 3. Frontend (port 3000)

```bash
cd mediprior_frontend
npm install
npm start
```

Open **http://localhost:3000**.

### 4. Try it out
1. Sign up as a **Doctor** and complete the profile.
2. Log in to **/admin** and set the doctor's verification status to **Verified**.
3. Sign up as a **Patient**, find the doctor, and send a connection request.
4. Accept it as the doctor, then chat, share reports and book appointments.

### Configuration

**Frontend API URL:** the frontend reads the backend address from `src/config.js`. It defaults to `http://127.0.0.1:8000`; to point it somewhere else, create `mediprior_frontend/.env`:

```env
REACT_APP_API_URL=https://your-backend.example.com
```

The WebSocket URL is derived automatically (`http` → `ws`, `https` → `wss`).

**Password-reset emails:** add an SMTP password (for example, a Gmail app password) as `EMAIL_HOST_PASSWORD` in `mediprior_backend/settings.py`, ideally loaded from an environment variable. Never commit it.

---

## 🔌 API Reference

Base URL: `http://127.0.0.1:8000/api/`

| Method | Endpoint | Description |
|---|---|---|
| POST | `register/` | Create a patient or doctor account |
| POST | `token/` · `token/refresh/` | Log in (JWT) and refresh token |
| POST | `request-reset-email/` · `password-reset-complete/` | Password reset |
| GET/POST | `profile/` | View or update the current user's profile |
| GET/POST | `reports/` | List or upload medical reports |
| DELETE | `reports/<id>/` | Delete a report |
| GET | `doctors/` | List verified doctors |
| POST | `connections/send/` | Send a connection request to a doctor |
| GET/POST | `connections/` | List connections; doctors accept or reject requests |
| DELETE | `connections/<doctor_id>/` | Remove a connection |
| GET/POST | `health-metrics/` | Log and fetch patient vitals |
| GET/POST | `appointments/` · `appointments/<id>/` | Slots, bookings, notes, prescriptions |
| POST | `ai-chat/` | Talk to the mental-health companion |
| WS | `ws/chat/<connection_id>/` | Real-time doctor–patient chat |

---

## 🖼️ Screenshots

<!-- Add screenshots of the patient dashboard, doctor calendar and chat here -->

---

## 🗺️ Roadmap

- [ ] PostgreSQL and a Redis channel layer for production
- [ ] Video consultations
- [ ] Real smartwatch / Google Fit integration (currently simulated)
- [x] Centralise API URLs in one config file
- [ ] Deploy (frontend + backend)
- [ ] Settings page (currently a placeholder)

---

## ⚠️ Disclaimer

Mediprior is a student project and is **not a medical device**. The AI companion offers general wellbeing support only and is not a substitute for professional care. In an emergency, contact local emergency services.

---

## 👩‍💻 Author

**Keertana Gupta** — [GitHub](https://github.com/KeertanaGupta) · [LinkedIn](https://www.linkedin.com/in/keertanagupta/)

If you find this project useful, consider giving it a ⭐!
