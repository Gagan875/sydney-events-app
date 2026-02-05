# Sydney Events - MERN Stack Application

A full-stack web application that automatically scrapes events from Sydney event websites and displays them with Google OAuth authentication and admin dashboard.

## 🚀 Features

- **Event Scraping**: Automatically scrapes TimeOut Sydney events
- **Auto Updates**: Scheduled scraping every 6 hours with change detection
- **Public Website**: Clean event listing with filtering and ticket collection
- **Admin Dashboard**: Google OAuth protected dashboard with event management
- **Status Tracking**: Events tagged as new/updated/inactive/imported

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, MongoDB, Passport.js
- **Scraping**: Cheerio, Axios, Node-cron

## 📋 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation

```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Access
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Demo Login**: Use "Demo Login" button for immediate access

## 🌐 Live Demo

Deploy to get live URLs:
- **Netlify** (Frontend): Drag `frontend/build` folder
- **Render** (Backend): Connect GitHub repo

## 📊 Assignment Requirements ✅

- ✅ Event scraping from multiple sources
- ✅ Automatic updates with change detection  
- ✅ Database storage with all required fields
- ✅ Minimalistic UI with event cards
- ✅ Email collection with consent tracking
- ✅ Google OAuth authentication
- ✅ Admin dashboard with filters and preview
- ✅ Import functionality with status tracking
- ✅ Full pipeline: scrape → store → display → review → import

## 📁 Project Structure

```
├── backend/                 # Node.js API
│   ├── models/             # MongoDB schemas
│   ├── scraper/            # Web scraping logic
│   └── server.js           # Express server
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── context/        # Auth context
│   └── public/
└── README.md
```