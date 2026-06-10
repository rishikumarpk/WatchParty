# 🎥 WatchTogether

<div align="center">
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com/)
  <br/>
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

  <p align="center">
    <strong>A high-performance, self-hosted co-watching platform that allows friends to enjoy perfectly synchronized local video playback with low latency, secure authentication, and real-time chat.</strong>
  </p>

  <h4>
    <a href="#-key-features">Key Features</a> • 
    <a href="#%EF%B8%8F-how-it-works">How It Works</a> • 
    <a href="#%EF%B8%8F-architecture">Architecture</a> • 
    <a href="#%EF%B8%8F-setup--installation">Setup Guide</a> • 
    <a href="#-drift-correction-details">Drift Correction</a> • 
    <a href="#-database-schema">Database Schema</a>
  </h4>

</div>

---

## 🌟 Key Features

*   **🔒 Cryptographic Video Matching (Zero-Cloud Storage)**: Videos remain completely on users' local machines. WatchTogether computes a client-side SHA-256 hash of the selected video file to guarantee everyone in the room has the identical video, preserving bandwidth and privacy.
*   **🔄 Sub-Second Real-Time Playback Synchronization**: Socket.IO-powered playback triggers (play, pause, seek) broadcast immediately across the room.
*   **📈 Adaptive Drift Correction**: The system continuously monitors timeline deviation. Small sync differences are subtly fixed by modifying the playback rate (speeding up or slowing down by 5%) rather than using jarring media jumps.
*   **📨 Secure OAuth2 Email Authentication**: Supports user registration and password recovery using short-lived 6-digit OTP verification codes generated securely and sent via the Gmail API with OAuth2.
*   **💬 Interactive Room Chat**: Integrated text chat showcasing participant activity logs (e.g., when a user pauses, skips, or joins) along with unique DiceBear bots avatars.
*   **💅 Sleek, Futuristic Dark-Theme UI**: High-fidelity dark mode designed using Tailwind CSS, backdrop blurs, glassmorphic surfaces, and micro-interactions.

---

## ⚙️ How It Works

Traditional watch party platforms either require massive cloud bandwidth to stream video files to all participants or require everyone to install fragile extensions. **WatchTogether** solves this with a **local hybrid syncing strategy**:

```
+-----------------------------------------------------------------------+
|                              HOW IT WORKS                             |
|                                                                       |
|   1. Host selects local video   -----> Generates SHA-256 Hash         |
|   2. Host creates room code     -----> Server registers Room          |
|   3. Peer joins room with file  -----> Hashing verified by client     |
|   4. Play / Pause / Seek        -----> Broadcasted via Socket.io      |
|   5. Every 10 seconds           -----> Periodic server-drift check     |
+-----------------------------------------------------------------------+
```

1.  **File Hashing**: The Host selects a video file. The Web Crypto API computes its SHA-256 hash.
2.  **Room Creation**: The Host's browser requests room creation on the server, saving the room code and video hash in the PostgreSQL database.
3.  **Peer Verification**: When a peer enters the room code and selects a file, the client checks if their file's SHA-256 matches the registered hash. If there is a mismatch, the client blocks entry, preventing desynchronization.
4.  **Real-Time Syncing**: Socket.IO handles events. Host controls are sent to the server and broadcasted immediately to peers.

---

## 🗺️ Architecture

### 1. Verification & Room Joining Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Peer)
    participant Front as Frontend (React)
    participant Back as Backend (Express)
    participant DB as Neon Database (PostgreSQL)

    User->>Front: Selects local video file & Enters Room Code
    Front->>Front: Computes SHA-256 hash of file locally
    Front->>Back: GET /api/rooms/:code
    Back->>DB: Query Room by code
    DB-->>Back: Return Room (Host ID, video_hash)
    
    alt Hash Matches
        Back-->>Front: Return Room Object
        Front->>Front: Initialize Socket connection
        Front->>Back: Socket.emit("JOIN_ROOM", { roomId, user })
        Back-->>Front: Socket.on("ROOM_STATE", currentState)
    else Hash Mismatches
        Back-->>Front: Return Room Object
        Front-->>User: Block entry ("Video files do not match")
    end
```

### 2. Video Playback & Adaptive Drift Sync

```mermaid
sequenceDiagram
    autonumber
    actor Host as Room Host
    participant Server as Socket.io Server
    actor Guest as Room Guest

    Host->>Host: User clicks Play/Pause/Seek
    Host->>Server: Socket.emit("VIDEO_PLAY", { roomId, time, timestamp })
    Server->>Guest: Broadcast "VIDEO_PLAY" { time, serverTimestamp }
    Guest->>Guest: Adjust local playback currentTime with network delay offset
    
    Note over Host, Guest: Periodic Drift Check (Every 10 Seconds)
    loop Every 10s Server Sync
        Server->>Server: Calculate current timeline position
        Server->>Host: Broadcast "VIDEO_SYNC" { playing, currentTime, serverTimestamp }
        Server->>Guest: Broadcast "VIDEO_SYNC" { playing, currentTime, serverTimestamp }
        
        alt Guest Drift < 0.3s
            Guest->>Guest: Keep playbackRate = 1.0
        else Guest Drift 0.3s - 2.0s
            Guest->>Guest: Adjust playbackRate (1.05 or 0.95) for smooth speedup/slowdown
        else Guest Drift > 2.0s
            Guest->>Guest: Hard seek video.currentTime = serverTime (ignoring user seek event loop)
        end
    end
```

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A running PostgreSQL instance (or Neon DB account)
*   Google Developer Console account (for Gmail API OAuth2 tokens)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/WatchParty.git
cd WatchParty/watch-together
```

### 2. Backend Configuration
Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and supply the following variables:
```env
# Database Credentials (PostgreSQL / Neon)
DATABASE_URL="postgresql://username:password@hostname:5432/dbname?sslmode=require"

# JSON Web Token Secret
JWT_SECRET="your_secure_jwt_secret"

# SMTP & Google OAuth credentials for Gmail API OTP
EMAIL="your-gmail-address@gmail.com"
PORT=5001
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REFRESH_TOKEN="your_google_refresh_token"
```

#### Database Migration & Initialization
Apply the Prisma schema migrations to your database:
```bash
npx prisma db push
npx prisma generate
```

#### How to Generate Gmail OAuth2 Credentials
WatchTogether uses Google OAuth2 credentials to send verified registration and password recovery emails via the official Gmail API.
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and search for **Gmail API**, then click **Enable**.
3.  Navigate to **OAuth Consent Screen**:
    *   Set user type to **External**.
    *   Add your developer email and add the scope `https://mail.google.com/`.
    *   Add your own email as a **Test User** (critical while in "Testing" mode).
4.  Navigate to **Credentials**:
    *   Create Credentials -> **OAuth Client ID**.
    *   Application type: **Web Application**.
    *   Authorized Redirect URI: `https://developers.google.com/oauthplayground`.
    *   Copy the generated `Client ID` and `Client Secret` to your backend `.env`.
5.  Get the `Refresh Token`:
    *   Go to [OAuth2 Playground](https://developers.google.com/oauthplayground).
    *   Click the gear icon (top right), check **Use your own OAuth credentials**, and input your Client ID and Client Secret.
    *   In the Left Pane, type `https://mail.google.com/` in the scopes box and click **Authorize APIs**.
    *   Authorize using your Test User Google Account.
    *   Exchange the authorization code for tokens, copy the `Refresh Token`, and paste it into your backend `.env`.

### 3. Frontend Configuration
Navigate to the `frontend` directory:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
# Override backend URL (defaults to http://localhost:5001)
VITE_API_URL="http://localhost:5001"
```

---

## 🚀 Running Locally

To start the local development environment:

### Run Backend
In the `backend` directory:
```bash
npm run dev
```
The server will boot up and listen on port `5001`.

### Run Frontend
In the `frontend` directory:
```bash
npm run dev
```
The client dashboard will open at `http://localhost:5173` (or the next available port).

---

## 📈 Drift Correction Details

To minimize jarring jumps, WatchTogether implements a **dual-tier sync algorithm** inside [VideoPlayer.tsx](file:///Users/rishi/Documents/WatchParty/watch-together/frontend/src/components/VideoPlayer.tsx#L70-L90):

```typescript
const handleSync = (data: any) => {
  if (!video || video.paused !== !data.playing) return;

  const delay = (Date.now() - data.serverTimestamp) / 1000;
  const serverTime = data.currentTime + delay;
  const diff = Math.abs(video.currentTime - serverTime);

  if (diff > 2) {
    // 1. Hard seek: Playback is more than 2 seconds out of sync
    isRemoteUpdateRef.current = true;
    ignoreSeekUntilRef.current = Date.now() + 1000;
    video.currentTime = serverTime;
    setTimeout(() => { isRemoteUpdateRef.current = false; }, 100);
  } else if (diff > 0.3) {
    // 2. Smooth acceleration: Playback is slightly out of sync (0.3s - 2.0s)
    // Adjust speed by ±5% to catch up or slow down gradually without audio distortion
    video.playbackRate = video.currentTime < serverTime ? 1.05 : 0.95;
  } else {
    // 3. Normalized speed: Playback is perfectly synchronized
    video.playbackRate = 1.0;
  }
};
```

---

## 🗄️ Database Schema

WatchTogether utilizes a PostgreSQL database. Below is the relational mapping of the database models structured in `Prisma`:

```
+------------------------------------+
|                User                |
+------------------------------------+
| id (UUID) [PK]                     |
| email (String) [Unique]            |
| password_hash (String)             |
| display_name (String)              |
| avatar_id (String)                 |
| created_at (DateTime)              |
+------------------------------------+
       |                     |
       | 1                   | 1
       |                     |
       | * (Host)            | * (Author)
+------------------+   +--------------------+
|       Room       |   |      Message       |
+------------------+   +--------------------+
| id (UUID) [PK]   |---| id (UUID) [PK]     |
| room_code [UQ]   | 1 | room_id (UUID) [FK]|
| host_id [FK]     |   | user_id (UUID) [FK]|
| video_hash       |   | message (String)   |
| created_at       |   | timestamp          |
+------------------+   +--------------------+

+------------------------------------+
|          VerificationCode          |
+------------------------------------+
| id (UUID) [PK]                     |
| email (String) [Unique]            |
| code (String)                      |
| data (String) [Nullable json]      |
| expiresAt (DateTime)               |
| createdAt (DateTime)               |
+------------------------------------+
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by WatchTogether Team</sub>
</div>
