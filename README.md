# Doctor Marketplace

Welcome to the Doctor Marketplace repository. This project is a comprehensive telemedicine platform that connects patients with verified doctors for appointments and real-time video consultations.

## 👥 Team Details

* **Team Name**: A²
* **Team Members**:
    1.  Akshay Sharma
    2.  Archita Babbar

## 🛠️ Tech Stack Overview

This project is built using the **MERN Stack** with additional real-time capabilities.

* **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Real-time Communication**: Socket.IO, WebRTC (Peer-to-Peer Video)

## 📂 Project Structure

The project is divided into two main applications:

```bash
doctor-marketplace/
├── client/     # Frontend React Application
└── server/     # Backend Node.js/Express API & Socket Server

```

## 🚀 Getting Started

To run this project locally, you will need to set up and run both the client and the server. Please refer to the specific documentation for each part of the application below for detailed installation instructions, environment setup, and usage guides.

### 📘 [Client Documentation](./client/)

Navigate to the **Client** directory to set up the frontend user interface.

* **Location**: [`./client`](./client/)

### 📗 [Server Documentation](./server/)

Navigate to the **Server** directory to set up the backend API and signaling server.

* **Location**: [`./server`](./server/)

## ⚡ Quick Setup Summary

1. **Clone the repository**:
```bash
git clone https://github.com/aks-1904/doctor-marketplace.git
```


2. **Setup Server**:
```bash
cd server
npm install
# Configure .env (see server/README.md)
npm start
```


3. **Setup Client** (Open a new terminal):
```bash
cd client
npm install
# Configure .env (see client/README.md)
npm run dev
```