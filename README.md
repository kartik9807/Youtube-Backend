# YouTube Backend API

A production-oriented backend for a YouTube-like video-sharing platform built with **Node.js, Express.js, MongoDB, and Mongoose**.

The project provides REST APIs for user authentication, video management, comments, likes, subscriptions, playlists, and other core features required by a video-sharing platform.

This project was built to understand how a scalable backend is structured using **Express.js, MongoDB aggregation pipelines, Mongoose, JWT authentication, middleware, file uploads, and REST API design**.

---

---

## 🛠️ Tech Stack

| Technology    | Purpose               |
| ------------- | --------------------- |
| Node.js       | JavaScript runtime    |
| Express.js    | Backend framework     |
| MongoDB       | Database              |
| Mongoose      | MongoDB ODM           |
| JWT           | Authentication        |
| bcrypt        | Password hashing      |
| Cloudinary    | Media storage         |
| Multer        | File upload handling  |
| dotenv        | Environment variables |
| cookie-parser | Cookie handling       |
| CORS          | Cross-origin requests |

---

## 🏗️ Project Architecture

The backend follows a modular MVC-style structure.

```text
src/
│
├── controllers/
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── subscription.controller.js
│   └── playlist.controller.js
│
├── models/
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── subscription.model.js
│   └── playlist.model.js
│
├── routes/
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── subscription.routes.js
│   └── playlist.routes.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│   └── ...
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── ...
│
├── db/
│   └── index.js
│
├── app.js
└── index.js
```

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

```bash
cd <PROJECT_FOLDER>
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start the development server

```bash
npm run dev
```

The server should start on:

```text
http://localhost:8000
```

---

# 🔐 Environment Variables

| Variable                | Description                   |
| ----------------------- | ----------------------------- |
| `PORT`                  | Port on which the server runs |
| `MONGODB_URI`           | MongoDB connection string     |
| `ACCESS_TOKEN_SECRET`   | Secret used for access JWT    |
| `ACCESS_TOKEN_EXPIRY`   | Access token expiration       |
| `REFRESH_TOKEN_SECRET`  | Secret used for refresh JWT   |
| `REFRESH_TOKEN_EXPIRY`  | Refresh token expiration      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name         |
| `CLOUDINARY_API_KEY`    | Cloudinary API key            |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret         |
| `CORS_ORIGIN`           | Allowed frontend origin       |

---

# 📡 API Overview

## Authentication

```text
POST   /api/v1/users/register
POST   /api/v1/users/login
POST   /api/v1/users/logout
POST   /api/v1/users/refresh-token
PATCH  /api/v1/users/change-password
GET    /api/v1/users/current-user
PATCH  /api/v1/users/update-account
PATCH  /api/v1/users/avatar
PATCH  /api/v1/users/cover-image
```

## Videos

```text
POST   /api/v1/videos
GET    /api/v1/videos
GET    /api/v1/videos/:videoId
PATCH  /api/v1/videos/:videoId
DELETE /api/v1/videos/:videoId
PATCH  /api/v1/videos/toggle/publish/:videoId
```

## Comments

```text
POST   /api/v1/comments/:videoId
GET    /api/v1/comments/:videoId
PATCH  /api/v1/comments/c/:commentId
DELETE /api/v1/comments/c/:commentId
```

## Likes

```text
POST   /api/v1/likes/toggle/v/:videoId
GET    /api/v1/likes/videos
GET    /api/v1/likes/check/:videoId
```

## Subscriptions

```text
POST   /api/v1/subscriptions/c/:channelId
GET    /api/v1/subscriptions/c/:channelId
GET    /api/v1/subscriptions/u/:subscriberId
```

## Playlists

```text
POST   /api/v1/playlist
GET    /api/v1/playlist/:playlistId
PATCH  /api/v1/playlist/:playlistId
DELETE /api/v1/playlist/:playlistId
PATCH  /api/v1/playlist/add/:videoId/:playlistId
DELETE /api/v1/playlist/remove/:videoId/:playlistId
```

> Update these routes if your actual route structure differs.

---

# 🧪 API Testing

The APIs can be tested using tools such as:

* Postman
* Thunder Client
* Insomnia

A typical development flow is:

```text
Register User
     ↓
Login
     ↓
Receive Access/Refresh Tokens
     ↓
Create Video
     ↓
Upload Thumbnail/Video
     ↓
Comment / Like / Subscribe
     ↓
Fetch Videos
     ↓
Test Pagination & Aggregation
```

---




Built while learning and exploring backend development with:

**Node.js · Express.js · MongoDB · Mongoose · JWT · REST APIs · MongoDB Aggregation**

---

⭐ If you found this project useful, consider giving the repository a star.
