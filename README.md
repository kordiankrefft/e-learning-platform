# 🎓 E-Learning Platform

## 💡 Project Overview

This project is a full-stack e-learning platform designed to support online learning through structured courses, lessons, and quizzes.

The system follows a client-server architecture. The backend is built with ASP.NET Core Web API and handles business logic, authentication, and data management using SQL Server (Database First approach).

The frontend is implemented in React, while a mobile application was developed using .NET MAUI. Both clients communicate with the backend via REST API.

## 🚀 Features

- JWT authentication
- Role-based access control
- Courses, modules, and lessons
- Quiz system with scoring and attempts
- Progress tracking
- Certificate generation
- CMS (dynamic content)
- Support tickets and notifications

## 🧱 Tech Stack

- ASP.NET Core
- Entity Framework Core
- SQL Server
- React
- .NET MAUI
- FluentValidation
- JWT

## 📸 Screenshots

### Home page

![Homepage](screenshots/homepage.png)

### Home page 2

![Homepage 2](screenshots/homepage2.png)

### Course list

![Courses](screenshots/mycourses.png)

### Lesson view

![Lesson](screenshots/lesson.png)

### Quiz

![Quiz](screenshots/quiz.png)

### Login

![Login](screenshots/login.png)

### Register

![Register](screenshots/register.png)

### Admin panel

![Admin](screenshots/admin.png)

### Admin panel 2

![Admin 2](screenshots/admin2.png)

### Admin panel 3

![Admin 3](screenshots/admin_edit.png)

### Support ticket

![Support ticket](screenshots/support_ticket.png)

## ⚙️ How to run

### Database

- Open `database/schema.sql` in SQL Server Management Studio
- Run the script (F5)

### Backend

- Open solution in Visual Studio
- Configure connection string in `appsettings.json`
- Run API

### Frontend

- Navigate to `frontend` folder
- Run:

```bash
npm install
npm run dev
```

## 📖 Setup

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🏗️ Project Structure

- `backend/` – ASP.NET Core Web API
- `frontend/` – React application
- `mobile/` – .NET MAUI application
