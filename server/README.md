# MediLink Server

The backend API and signaling server for the MediLink Doctor Consultation Platform. This Node.js application manages user authentication, appointment scheduling, doctor verification, payment processing via Stripe, and real-time WebRTC signaling for secure video consultations.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure stateless authentication with role-based access control (Admin, Doctor, Patient).
- **Secure Password Storage**: Bcrypt hashing for user credentials.
- **Account Management**: Functionality to block/unblock users and manage access.

### 👩‍⚕️ Doctor & Patient Management
- **Doctor Onboarding**: sophisticated registration flow accepting medical details and **PDF License Uploads** (via Multer).
- **Verification Workflow**: Admin APIs to review, approve, or reject doctor applications.
- **Advanced Search**: Filter doctors by specialization, fee range, experience, and rating.
- **Availability**: Logic to handle specific day/time slots and prevent double-booking.

### 💳 Payments (Stripe)
- **Checkout Sessions**: Generate Stripe Checkout links for completed appointments.
- **Webhooks**: Securely handle `checkout.session.completed` events to update appointment payment status in the database.
- **Direct Transfers**: Configuration to route funds to connected doctor Stripe accounts (scalable architecture).

### 📹 Real-Time Communication
- **Integrated Signaling**: Socket.IO server runs alongside Express to handle WebRTC handshakes (`offer`, `answer`, `ice-candidates`).
- **Secure Rooms**: Server-side validation ensures only the specific doctor and patient linked to an appointment can join the video room.
- **Chat**: Persistent chat events within the consultation room.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.IO
- **Payments**: Stripe API
- **File Handling**: Multer (Local storage for licenses)
- **Security**: Helmet, CORS, JWT

## 📂 Project Structure

```bash
src/
├── config/
│   ├── db.js             # MongoDB connection
│   └── stripe.js         # Stripe SDK configuration
├── controllers/          # Business logic
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── doctor.controller.js
│   ├── patient.controller.js
│   └── stripe.controller.js
├── middlewares/
│   ├── auth.middleware.js   # JWT verification & Role checks
│   └── multer.middleware.js # File upload config
├── models/               # Mongoose Schemas (User, Doctor, Appointment, etc.)
├── routes/               # API Route definitions
├── app.js                # Express App & Socket.IO setup
└── server.js             # Entry point

```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/medilink

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# Frontend & CORS
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

```

## 📥 Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/aks-1904/doctor-marketplace.git
cd doctor-marketplace
```


2. **Install dependencies**
```bash
npm install
```


3. **Create Upload Directory**
Ensure the local directory exists for storing uploaded licenses:
```bash
mkdir -p uploads/licenses
```


4. **Run the Server**
```bash
# Development (using nodemon)
npm run dev

# Production
npm start

```



## 📡 API Endpoints

### 🔐 Auth (`/api/v1/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register User (Multipart form-data for Doctors). |
| POST | `/login` | Authenticate and receive JWT. |
| GET | `/logout` | Clear cookie/token. |

### 👤 Patient (`/api/v1/patient`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Browse verified doctors with filters. |
| POST | `/book` | Book a new appointment. |
| GET | `/appointments` | Get patient's appointment history. |

### 👨‍⚕️ Doctor (`/api/v1/doctor`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/appointments` | Get doctor's schedule. |
| PUT | `/` | Update appointment status (confirm/complete/cancel). |

### 🛡️ Admin (`/api/v1/admin`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/get-unverified-doctors` | View pending applications. |
| POST | `/update-verification-status` | Approve or Reject doctor licenses. |
| POST | `/block` / `/unblock` | Manage user access. |

### 💳 Payments (`/api/v1/payments`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/create-checkout-session` | Initialize Stripe payment for an appointment. |
| POST | `/webhook` | Stripe listener for payment confirmation. |

## 🔌 Socket.IO & WebRTC Logic

The Socket server is integrated directly into the HTTP server (`src/app.js`).

**Room Security (`room:join` event):**
When a user attempts to join a room, the server:

1. Looks up the `Appointment` by `roomId`.
2. Verifies the appointment status is not "cancelled".
3. **Authorization**: Checks if the connecting `socket.id` (via user ID) belongs to either the **Doctor** or **Patient** associated with that specific appointment.

**Signaling Events:**

* `user:call` / `incoming:call`: Initial SDP Offer.
* `call:accepted`: SDP Answer.
* `peer:nego:needed` / `peer:nego:final`: Renegotiation for stream updates.
* `peer:ice`: ICE Candidate exchange.
* `media:toggle`: Syncs camera/mic status between peers.
* `chat:message`: Real-time text chat in the room.
