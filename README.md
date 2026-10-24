# Secure Note-Taking Application API

A production-ready RESTful backend built with Node.js, Express, TypeScript, and MongoDB (Mongoose), implementing role-based access control, strictly optimized database indexing, and MongoDB aggregation pipelines.

---

## 🛠️ Tech Stack & Standards

- **Runtime & Language:** Node.js (v24+), TypeScript
- **Framework:** Express.js 5
- **Database & ODM:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens) with Bearer token authentication
- **Password Security:** Salted hashing with `bcrypt` (12 rounds)
- **Validation:** Type-safe schema validation with `zod`

---

## 🚀 Quick Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your MongoDB connection string and JWT secret:
```bash
cp .env.example .env
```

Required variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/secure_note_app
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
```

### 3. Seed Default Admin Account
```bash
npm run seed:admin
```

### 4. Run Development Server
```bash
npm run dev
```

Server starts at `http://localhost:5000`.

---

## 🔐 Roles & Permissions

| Role | Permissions & Access Scope |
| :--- | :--- |
| **User** | Create, view, update, delete their own notes; create and view posts. |
| **Admin** | Inherits all User capabilities; full user management (create, read, update, delete any user); view notes across all users (`/api/notes/all`); view users grouped by interests. |

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### User Management (`/api/users` - Admin Only)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Admin | Create user directly with role & interests |
| `GET` | `/api/users` | Admin | Paginated list of all users |
| `GET` | `/api/users/grouped-by-interests` | Admin | **Scenario 1:** Users grouped by interests |
| `GET` | `/api/users/:id` | Admin | Retrieve single user details by ID |
| `PATCH` | `/api/users/:id` | Admin | Update user information (role, name, interests) |
| `DELETE` | `/api/users/:id` | Admin | Delete user and cascade delete their notes and posts |

### Notes (`/api/notes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/notes` | Authenticated | Create a note for the authenticated user |
| `GET` | `/api/notes/my-notes` | Authenticated | Paginated list of user's own notes |
| `GET` | `/api/notes/all` | Admin | Paginated list of notes from all users |
| `GET` | `/api/notes/:id` | Authenticated | Get single note (owner or admin) |
| `PATCH` | `/api/notes/:id` | Authenticated | Update note content/title (owner only) |
| `DELETE` | `/api/notes/:id` | Authenticated | Delete note (owner only) |

### Posts (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Authenticated | Create a new post |
| `GET` | `/api/posts/user/:userId` | Public | **Scenario 2:** Retrieve all posts for a user via `$lookup` |

---

## ⚡ Database Indexing Strategy

Per interview requirements, all indexes are explicitly defined using the `schema.index()` method in Mongoose schemas. Unnecessary indexes are strictly avoided.

| Collection | Defined Index | Supported Query & Optimization Rationale |
| :--- | :--- | :--- |
| **`users`** | `{ email: 1 }` (unique) | Enforces uniqueness and optimizes login lookup queries (`findOne({ email })`). |
| **`users`** | `{ createdAt: -1 }` | Supports pagination & reverse-chronological sorting in admin list view (`find().sort({ createdAt: -1 })`). |
| **`users`** | `{ interests: 1 }` | Supports the `$match` filter in Scenario 1 aggregation when filtering by interest. |
| **`notes`** | `{ userId: 1, createdAt: -1 }` | Compound index optimized for `getMyNotes` (`find({ userId }).sort({ createdAt: -1 })`). Also serves index prefix for cascade delete by `userId`. |
| **`notes`** | `{ createdAt: -1 }` | Supports admin list view (`getAllNotes`) sorted by `createdAt: -1`. |
| **`posts`** | `{ userId: 1, createdAt: -1 }` | Compound index optimized for Scenario 2 aggregation (`$lookup` equality matching on `userId` and sorting by `createdAt: -1`). |

*Note: Single-document lookups by ID (`/users/:id`, `/notes/:id`, `/auth/me`) are automatically supported by MongoDB's default `_id: 1` primary index.*

### Intentional Index Exclusions:
- **`users.role`**: No queries filter exclusively by role.
- **Standalone `notes.userId`**: Fully satisfied by the compound index `{ userId: 1, createdAt: -1 }` as an index prefix.
- **`title` / `content`**: No full-text search or sort operations are performed on text fields.

---

## 🧩 Aggregation Pipelines

### Scenario 1: Group Users by Interests
- **Constraint:** Exactly one `collection.aggregate()` call.
- **Implementation:**
  1. Optional `$match` on `{ interests: interest }` (supported by index).
  2. `$unwind: "$interests"` to deconstruct the interests array.
  3. Optional second `$match` to isolate the filtered interest.
  4. `$group` by `_id: "$interests"` with `$count: { $sum: 1 }` and `$push` for users.
  5. `$sort: { count: -1, _id: 1 }`.
  6. Single-call `$facet` to perform pagination (`$skip`, `$limit`) and total record counting within the single pipeline.

### Scenario 2: User Posts ($lookup)
- **Constraint:** Single aggregation pipeline using a `$lookup` stage.
- **Implementation:**
  1. `$match` on target user `{ _id: objectId }`.
  2. `$lookup` joining the `posts` collection on `userId` with sub-pipeline sorting (`createdAt: -1`), pagination, and field projection.
  3. Field projection ensuring clean output without sensitive credentials.
