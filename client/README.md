# Doctor Marketplace Client

This is the frontend client for the Doctor Marketplace application. It is a modern React application built with Vite, featuring role-based dashboards, real-time video consultations via WebRTC, and a robust state management system using Redux Toolkit.

## 🚀 Features

- **Authentication & Onboarding**:
  - Role-based registration (Patient/Doctor) with secure file handling for medical licenses.
  - Login system with JWT token management.
- **Patient Portal**:
  - Browse and search for doctors by specialty and availability.
  - Book appointments and view chat history.
  - Select between Allopathic and Ayurvedic treatment paths.
- **Doctor Dashboard**:
  - View upcoming meetings and patient statistics.
  - Manage availability and patient communication.
- **Admin Dashboard**:
  - Verify doctor credentials (approve/reject based on license).
  - User management (block/unblock users).
- **Video Consultation (WebRTC)**:
  - Custom WebRTC implementation using `RTCPeerConnection`.
  - Real-time signaling via Socket.IO.
  - Secure room-based video calls with camera/mic controls.
  - Connection status indicators (Secure P2P, Ice Gathering, etc.).

## 🛠️ Tech Stack

- **Framework**: React (Vite)
- **State Management**: Redux Toolkit + Redux Persist
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io-client
- **Video/Audio**: Native WebRTC APIs
- **Notifications**: React Hot Toast

## 📂 Project Structure

```bash
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/
│   ├── context/            # Socket Context Provider
│   ├── controllers/
│   ├── hooks/              # Custom hooks (useAuth, useAdmin)
│   ├── pages/              # Main route pages
│   │   ├── auth/           # Login/Register screens
│   │   ├── AdminDash.jsx   # Admin Dashboard
│   │   ├── DoctorDash.jsx  # Doctor Dashboard
│   │   ├── HomePage.jsx    # Landing Page
│   │   └── UserDash.jsx    # Patient Dashboard
│   ├── screens/            # Video Call screens (Lobby, Room)
│   ├── service/            # WebRTC Peer Service logic
│   ├── store/              # Redux setup
│   │   ├── slices/         # Redux slices (auth, user, admin, doctor)
│   │   └── store.js        # Store configuration
│   ├── App.jsx             # Route definitions
│   └── main.jsx            # Entry point

```

## ⚙️ Environment Variables

Create a `.env` file in the root directory. You must configure the backend API URL and the Socket Server URL.

```env
# URL for the REST API (Express Server)
VITE_BACKEND_URL=http://localhost:5000

# URL for the Socket.IO Server (Signaling Server)
# Note: Ensure this matches the port defined in your socket server
BACKEND_SOCKET_URL=http://localhost:8000

```

_Note: The application uses `import.meta.env.VITE_BACKEND_URL` for API calls and `import.meta.env.BACKEND_SOCKET_URL` for the socket connection._

## 📥 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/aks-1904/doctor-marketplace.git
cd doctor-marketplace/client
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the Development Server**

```bash
npm run dev
```

4. **Build for Production**

```bash
npm run build
```

## 🔌 Socket & WebRTC Logic

The application uses a custom WebRTC implementation rather than a library like PeerJS.

1. **Signaling**: controlled by `SocketProvider.jsx`. Events include `room:join`, `user:call`, and `peer:ice`.
2. **Peer Connection**: Managed in `src/service/peer.js`. It utilizes Google and Twilio STUN servers to handle NAT traversal.
3. **Negotiation**: Handles SDP offer/answer exchanges automatically when new tracks are added to the stream.

## 🛡️ Admin & Permissions

- **Patient**: Default role upon registration.
- **Doctor**: Requires registration with additional details (Specialization, License PDF). Account remains "pending" until verified by an Admin.
- **Admin**: Access is granted via backend role assignment. Can approve doctors and block malicious users via `AdminDash`.

## 🎨 Styling

Styling is handled via Tailwind CSS. Ensure your `index.css` includes the Tailwind directives:

```css
@import "tailwindcss";
```
