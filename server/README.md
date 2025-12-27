# Doctor Marketplace Server

This is the backend server for the Doctor Marketplace application. It provides a RESTful API for user management, doctor verification, and appointment booking, as well as a standalone Socket.IO server to handle WebRTC signaling for real-time video consultations.

## 🚀 Features

* **Authentication & Authorization**:
    * JWT-based authentication.
    * Role-based access control (Admin, Doctor, Patient).
    * Secure password hashing with Bcrypt.
* **Doctor Management**:
    * Detailed profile creation (specialization, experience, fees).
    * Availability scheduling.
    * License document upload for verification.
    * Admin approval workflow (Pending -> Approved/Rejected).
* **Patient Services**:
    * Advanced doctor search and filtering (Specialization, Fee, Rating, Experience).
    * Appointment booking with slot validation and conflict detection.
* **Admin Dashboard**:
    * View unverified doctors.
    * Approve or reject doctor profiles.
    * Block/Unblock users.
* **Real-time Video Call (WebRTC)**:
    * Dedicated Socket.IO server for signaling.
    * Room joining and peer negotiation handling.

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Real-time**: Socket.IO (Signaling for WebRTC)
* **Authentication**: JSON Web Tokens (JWT)
* **File Uploads**: Multer
* **Security**: Helmet, CORS, Rate Limiting (in production)

## 📂 Project Structure

```bash
├── index.js                  # Entry point for Socket.IO (Video Call Signaling)
├── src/
│   ├── app.js                # Express App configuration
│   ├── server.js             # Entry point for REST API Server
│   ├── config/
│   │   └── db.js             # MongoDB connection logic
│   ├── controllers/          # Request handlers (Auth, Admin, Doctor, Patient)
│   ├── middlewares/          # Auth checks, File uploads (Multer)
│   ├── models/               # Mongoose Schemas
│   └── routes/               # API Route definitions
└── uploads/                  # Directory for uploaded documents

```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/doctor-marketplace

# Authentication
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Client Configuration (Check for X) (CORS)
CLIENT_URL=http://192.168.1.X:5173
```

## 📥 Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/aks-1904/doctor-marketplace.git
cd doctor-marketplace/server

```


2. **Install dependencies**
```bash
npm install
```


3. **Create Upload Directory**
Ensure the uploads directory exists for license files:
```bash
mkdir -p uploads/licenses
```


4. **Run the Servers**
```bash
npm run start
```

*To run development server*
```bash
npm run dev
```



## 📡 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register new user (Patient/Doctor). Expects `multipart/form-data` for doctors (license upload). |
| POST | `/login` | Login user. |
| GET | `/logout` | Logout user. |

### Patient (`/api/v1/patient`)

*Requires Role: Patient*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get list of approved doctors. Supports query params: `specialization`, `minFee`, `maxFee`, `rating`, `search`. |
| POST | `/book` | Book an appointment. |

### Doctor (`/api/v1/doctor`)

*Requires Role: Doctor*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| PUT | `/` | Update appointment status (confirm/complete/cancel). |

### Admin (`/api/v1/admin`)

*Requires Role: Admin*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/get-unverified-doctors` | List doctors pending verification. |
| POST | `/update-verification-status` | Approve or Reject doctor verification. |
| POST | `/block` | Block a user access. |
| POST | `/unblock` | Unblock a user. |

## 📹 Socket.IO Events (WebRTC)

The Socket server runs on `SOCKET_PORT` (default: 8000).

**Connection Events:**

* `room:join`: Client requests to join a room.
* `user:joined`: Server notifies room that a user joined.

**Call Signaling:**

* `user:call`: Initiator sends an offer.
* `incoming:call`: Receiver gets the offer.
* `call:accepted`: Receiver sends answer back to initiator.
* `peer:nego:needed`: Renegotiation needed.
* `peer:ice`: Exchange ICE candidates.
