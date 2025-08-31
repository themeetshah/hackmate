
# Hackmate - Hackathon Teammate Finder

Hackmate is a comprehensive React + Django-based team formation platform that connects hackathon participants for smart team building and seamless collaboration.

It features score-based algorithm, intuitive team management, direct chat messaging, comprehensive user profiles, and multi-hackathon support.

## 🎥 Demo

Video Preview: [▶️ Watch Demo](https://linkedin.com/example-demo-link)

## 🚀 Features

### Score-Based Matching System
- Simple compatibility scoring based on skills and preferences.
- Skill-based filtering.

### Team Management
- Intuitive team creation & role management.
- Join requests and approvals.
- Team discovery and filtering.

### Direct Chat Integration
- HTTP-based messaging.
- Real-time updates (without websockets).

### Hackathon Management
- Multi-event participation.
- Media asset management.

### User Profiles
- Comprehensive profiles.
- Participation tracking.

### Request and Invitation System
- Invitation workflow.
- Request tracking.

### Modern UI
- Responsive design.
- TailwindCSS and Framer Motion.

## Project Structure

```
hackmate/
├── hackmate_backend/
│   ├── hackathons/
│   ├── hackathon_backend/
│   ├── media/
│   ├── teams/
│   └── users/
├── hackmate_frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   └── hooks/
```

## Installation

### Prerequisites
- Node.js >= 16
- Python >= 3.8
- SQLite (default database)

### Setup Steps

1. Clone the repository

```
git clone https://github.com/themeetshah/hackmate.git
cd hackmate
```

2. Setup backend

```
cd hackmate_backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\Activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

3. Setup frontend

```
cd hackmate_frontend
npm install
npm run dev
```

4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Stack
- React 18, TailwindCSS, Framer Motion
- Django, Django REST Framework
- SQLite, JWT auth

## Contribute

Contributions are welcomed! Feel free to contribute by creating [**pull requests**](https://github.com/themeetshah/hackmate/pulls) or [submitting issues](https://github.com/themeetshah/hackmate/issues).

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.