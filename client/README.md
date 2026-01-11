# MediLink - Doctor Consultation Platform

MediLink is a comprehensive healthcare marketplace application that connects patients with verified doctors for seamless video consultations. Built with a modern React tech stack, it features role-based access, real-time WebRTC video/chat, appointment management, and secure Stripe payment integration.

## 🚀 Features

### 🔐 Authentication & Onboarding
- **Role-Based Access**: Distinct flows for **Patients**, **Doctors**, and **Admins**.
- **Doctor Registration**: Detailed onboarding collecting specialization, qualifications, consultation fees, and **Medical License (PDF)** uploads.
- **Availability Management**: Doctors set specific available days and time slots during registration.

### 👤 Patient Portal
- **Treatment Paths**: Choose between **Ayurvedic** and **Allopathic** care.
- **Doctor Discovery**: Search and browse doctors by specialization and rating.
- **Appointment Booking**: Book slots based on real-time doctor availability.
- **Payments**: Secure checkout for completed consultations using **Stripe**.
- **Dashboard**: Track appointment status (Confirmed, Pending, Completed, Cancelled).

### 👨‍⚕️ Doctor Dashboard
- **Appointment Requests**: Accept or reject incoming booking requests.
- **Schedule Management**: View upcoming confirmed meetings.
- **Patient History**: Access records of past consultations.
- **Consultation Tools**: One-click join for video rooms and ability to mark appointments as completed.

### 🛡️ Admin Dashboard
- **Verification System**: Review doctor applications and license documents to Approve/Reject accounts.
- **User Management**: Monitor platform users and Block/Unblock accounts as needed.

### 📹 Real-Time Consultation (WebRTC)
- **Secure Video Calls**: Custom peer-to-peer connection using `RTCPeerConnection`.
- **In-Call Chat**: Real-time text messaging within the video room.
- **Media Controls**: Toggle toggle microphone/camera and handle device permissions.
- **Connection Health**: Visual indicators for connection security and ICE states.

## 🛠️ Tech Stack

- **Frontend Framework**: React (Vite)
- **State Management**: Redux Toolkit + Redux Persist
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **Routing**: React Router DOM
- **API Integration**: Axios
- **Real-time Communication**: Socket.io-client
- **Video/Audio**: Native WebRTC APIs (with Google & Twilio STUN servers)
- **Payments**: Stripe (@stripe/stripe-js)
- **Notifications**: React Hot Toast

## 📂 Project Structure

```bash
src/
├── context/            # SocketProvider (Global socket connection)
├── hooks/              # Custom hooks (useAuth, usePatient, useDoctor, useAdmin, useStripe)
├── pages/
│   ├── auth/           # Combined Login/Register Interface
│   ├── screens/        # Video Room logic (Room.jsx)
│   ├── AdminDash.jsx   # Administrator controls
│   ├── DoctorDash.jsx  # Doctor schedule & requests
│   ├── HomePage.jsx    # Landing page with treatment paths
│   └── UserDash.jsx    # Patient booking & history
├── service/            # peer.js (WebRTC signaling & negotiation)
├── store/              # Redux Store setup
│   └── slices/         # Feature slices (auth, patient, doctor, admin)
└── App.jsx             # Route definitions and Layouts

```

## ⚙️ Environment Variables

Create a `.env` file in the root directory to configure the backend connection and external services.

```env
# Server Configurations
VITE_BACKEND_URL=http://localhost:8080
VITE_BACKEND_SOCKET_URL=http://localhost:8080

# Payment Gateway (Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

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

3. **Configure Environment**
Configure the `.env`
``` env
VITE_BACKEND_URL=http://localhost:8080
NODE_ENV=development
VITE_BACKEND_SOCKET_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=<Your_Stripe_Publishable_Key>
```

4. **Run the Development Server**
```bash
npm run dev
```


5. **Build for Production**
```bash
npm run build
```

## 🔌 WebRTC & Socket Implementation

This project implements a custom WebRTC service (`src/service/peer.js`) rather than using a library wrapper.

* **Signaling**: Handled via `Socket.io` events (`user:call`, `call:accepted`, `peer:nego:needed`).
* **ICE Traversal**: Configured with multiple STUN servers (Google and Twilio) to ensure connectivity across different networks.
* **Negotiation**: Automatic SDP renegotiation handles stream additions/removals (e.g., toggling video).
* **Security**: Connection state monitoring ensures calls are established securely before media flows.

## 💳 Payment Flow

1. Appointments are marked as "Completed" by the doctor after the consultation.
2. The "Make Payment" button becomes active in the Patient Dashboard.
3. Clicking proceeds to a Stripe Checkout session managed via `useStripe.js`.
