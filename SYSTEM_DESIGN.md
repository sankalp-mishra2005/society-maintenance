# System Design Document - Society Maintenance Tracker

## 1. Executive Summary
The **Society Maintenance Tracker** is an evaluation-focused, full-stack complaint management platform designed for apartment societies. It enables residents to raise maintenance requests with photo attachments and track their progress through a transparent audit trail. Society administrators manage complaints across priorities, configure overdue detection thresholds, broadcast society notices, and monitor operational analytics.

---

## 2. Complaint History & Audit Trail Architecture

### Design Philosophy
To ensure full accountability and total visibility for both residents and evaluators, the complaint lifecycle uses an **append-only embedded history sub-document array** embedded directly within the Mongoose `Complaint` schema.

### Schema Definition
```json
{
  "statusHistory": [
    {
      "status": "Open | In Progress | Resolved",
      "changedBy": "ObjectId(User)",
      "changedByName": "String",
      "changedByRole": "resident | admin",
      "note": "String",
      "timestamp": "Date"
    }
  ]
}
```

### Lifecycle Enforcements & State Transitions
1. **Creation**: When a resident submits a complaint, the initial status is set to `Open`, and the first history record (`status: 'Open'`, `changedByRole: 'resident'`) is created automatically.
2. **Progress & Resolution**: Admins transition complaints: `Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`. Every transition requires/supports an admin note detailing actions taken (e.g. *"Technician dispatched"*).
3. **Immutability of Resolved Complaints**: Once marked `Resolved`, a complaint is permanently closed. The backend API enforces immutability by rejecting any subsequent status change or priority update attempts with a `400 Bad Request` error.

---

## 3. Dynamic Overdue Detection System

### Non-Persisted Dynamic State
To avoid stale database flags and state synchronization bugs, overdue status is **computed dynamically on query execution** based on real-time elapsed time against a system-wide threshold setting.

### Mathematical Model
Given current timestamp $T_{\text{now}}$, complaint creation timestamp $T_{\text{created}}$, and configurable threshold $D_{\text{threshold}}$ (default = 3 days):

$$\text{DAY\_MS} = 86,400,000\text{ ms}$$

$$\text{daysOpen} = \lfloor \frac{T_{\text{now}} - T_{\text{created}}}{\text{DAY\_MS}} \rfloor$$

$$\text{isOverdue} = (\text{status} \neq \text{'Resolved'}) \land (\text{daysOpen} > D_{\text{threshold}})$$

$$\text{daysOverdue} = \begin{cases} \text{daysOpen} - D_{\text{threshold}} & \text{if } \text{isOverdue} \\ 0 & \text{otherwise} \end{cases}$$

### Admin Dashboard Surface Strategy
- Overdue complaints are auto-sorted to the top of the admin registry.
- A dedicated **⚠ OVERDUE COMPLAINTS** filter tab (`All | Open | In Progress | Resolved | Overdue`) and quick-action panel allow evaluators to inspect overdue items instantly.

---

## 4. Cloudinary Photo Upload Architecture

### Stream Upload Pipeline
1. **Multipart Handling**: Image files (JPG, PNG, WEBP $\le$ 5MB) are captured via `multer.memoryStorage()`.
2. **Cloudinary Direct Stream**: The image buffer is streamed to Cloudinary using `cloudinary.uploader.upload_stream`.
3. **Strict Credential Validation**: Per technical requirements, Cloudinary is the exclusive photo storage engine. If Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are missing or invalid, the upload middleware returns an explicit HTTP 400 configuration error.
4. **Url Persistence**: On successful upload, Cloudinary returns a secure `photoUrl` and `photoPublicId`, which are stored in the complaint document.

---

## 5. Email Notification & Resend Integration Flow

### Triggers & Dispatch Strategy
The platform integrates **Resend** for transactional email communication:
1. **Status Update Trigger**: When an admin updates a complaint status (`Open` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`), an email notification is dispatched to the resident's registered email address detailing the complaint number (`CMP-2026-XXXX`), new status, and admin notes.
2. **Important Notice Broadcast**: When an admin posts a notice with `isImportant: true`, a broadcast email is dispatched to all registered resident emails in the society.

### Fail-Safe Console Audit Fallback
If `RESEND_API_KEY` is omitted from `.env`, the email service gracefully falls back to structured console audit logging (`[EMAIL NOTIFICATION AUDIT]`), ensuring zero application crashes during review.
