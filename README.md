# Society Maintenance Tracker 🏢🔧

A production-quality, evaluation-friendly apartment society complaint management platform built with **React (Vite), Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, and Resend**.

## Deployment Guide

This repository is ready to be deployed instantly on Vercel and Render.

### 1. Backend on Render.com
Render uses the `render.yaml` blueprint included in the root to automate deployment.
1. Sign in to [Render.com](https://render.com).
2. Go to your Dashboard and click **New+ -> Blueprint**.
3. Connect your GitHub account and select the `society-maintenance` repository.
4. Render will automatically detect the settings and start building the API.
5. In the Render Dashboard for your Web Service, set the following Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string for authentication.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary credentials.
6. Once deployed, copy your Render URL (e.g., `https://society-maintenance-api.onrender.com`).

### 2. Frontend on Vercel
Vercel is optimized for Vite + React applications.
1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New -> Project**.
3. Import the `society-maintenance` repository from GitHub.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `client`.
6. Add the following Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://society-maintenance-api.onrender.com/api`).
7. Click **Deploy**. Vercel will build your frontend and auto-configure React Router using the `vercel.json` file.

You're done! Your full-stack Society Maintenance Tracker is live.

---

## 🔑 DEMO ACCESS FOR EVALUATORS

The database seed script populates sample complaints with complete status histories, photo uploads, overdue items, and notices.

### 🛡️ Admin Account
- **Email:** `admin@society.com`
- **Password:** `admin123`
- **Capabilities:** Full Operations Dashboard, update complaint status & priority, change overdue threshold days, post pinned notices.

### 👤 Resident Account
- **Email:** `resident1@society.com` (or `resident2@society.com`)
- **Password:** `resident123`
- **Capabilities:** Raise maintenance complaints with Cloudinary photos, track real-time audit history timeline, view notice board.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/society_maintenance` or a MongoDB Atlas URI.

### 1. Install All Dependencies
```bash
npm run install:all
```
*(Or run `npm install` inside both `/server` and `/client` directories)*

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/society_maintenance
JWT_SECRET=super_secret_jwt_key_society_2026

# Cloudinary Configuration (Photo uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Configuration (Email Notifications)
RESEND_API_KEY=re_123456789
EMAIL_FROM=Society Maintenance <onboarding@resend.dev>
```

### 3. Seed Database with Realistic Demo Data
```bash
npm run seed
```

### 4. Run Application
Run Backend Server:
```bash
npm run server
```
*(Runs backend API at `http://localhost:5000`)*

In a separate terminal, run Frontend Client:
```bash
npm run client
```
*(Runs Vite React app at `http://localhost:5173`)*

---

## 📚 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register resident user (Forces `resident` role) |
| `POST` | `/api/auth/login` | Public | Authenticate resident or admin |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Resident | Create complaint (with Cloudinary photo upload & initial history) |
| `GET` | `/api/complaints` | Private | List complaints (Supports `status`, `category`, `priority`, `overdue`, `from`, `to`, `search` filters) |
| `GET` | `/api/complaints/:id` | Private | Get complaint details with full `statusHistory` audit trail |
| `PATCH` | `/api/complaints/:id/status` | Admin | Update status (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`), appends history, emails resident |
| `PATCH` | `/api/complaints/:id/priority` | Admin | Update priority (`Low`, `Medium`, `High`) |

### Notice Board (`/api/notices`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Private | List notices (Pinned important notices first) |
| `POST` | `/api/notices` | Admin | Create notice (If `isImportant: true`, triggers broadcast email) |
| `DELETE` | `/api/notices/:id` | Admin | Delete notice |

### Admin Dashboard (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Aggregate dashboard KPIs, breakdown charts, and overdue list |
| `GET` | `/api/admin/settings` | Admin | Get current overdue threshold days setting |
| `PUT` | `/api/admin/settings` | Admin | Update overdue threshold days setting |

---

## 🗄️ Database Schemas Overview

### 1. `User`
- `name`, `email`, `password` (hashed with bcrypt), `role` (`resident` | `admin`), `flatNumber`, `phoneNumber`, `createdAt`.

### 2. `Complaint`
- `complaintNumber` (`CMP-2026-0001`), `title`, `category`, `description`, `photoUrl`, `photoPublicId`, `status` (`Open`, `In Progress`, `Resolved`), `priority` (`Low`, `Medium`, `High`), `resident` (User Ref), `statusHistory` (Array of `{ status, changedBy, changedByName, changedByRole, note, timestamp }`), `resolvedAt`, `createdAt`, `updatedAt`.

### 3. `Notice`
- `title`, `content`, `category`, `isImportant` (Boolean), `createdBy` (User Ref), `createdAt`.

### 4. `SystemSetting`
- `key` (`overdueThresholdDays`), `value` (Number), `updatedAt`.

---

## 📄 Deliverables Checklist
- [x] Complete source code zip package
- [x] Detailed `README.md` with setup guide & API docs
- [x] System Design write-up (`SYSTEM_DESIGN.md`)
- [x] Complaint lifecycle with complete audit trail
- [x] Dynamic overdue calculation & threshold adjustment
- [x] Cloudinary photo upload & Resend email integration
