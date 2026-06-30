# 🎵 LeeDonTen

A full-stack web application that allows users to support musicians through donation requests with simulated payment processing.

## 📌 Overview

LeeDonTen is a web application where musicians can create personalized donation pages and receive support from fans. Donors can submit donation request, complete payment through a simulated payment, and musician can withdraw their earnings.

the project focus on building a real-world web application architechture using RESTASIs, Authentication, role-based authorization, and payment workflow simulation

## ✨ Features
User
- Register / Login with JWT Authentication
- Browse musician profiles
- Send donation requests
- View donation history
- Payment status tracking

Musician
- receive donation requests
- view transaction history
- request withdrawals

Admin
- Review withdrawal requests
- Approve / Reject withdrawals

## 🛠 Tech Stack

Frontend
- React
- React Router
- TailwindCSS

Backend
- ASP.NET Core Web API
- Enitiy Framework Core
- JWT Authentication
- Docker

Database
- PostgreSQL

Deployment
- Backend: Render
- Frontend: Vercel
- Database: Neon

#🔐 Authentication
- JWT Authentication
- Role-based Authorization

Roles
- Musician
- Admin
