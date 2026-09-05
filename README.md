# YouTube Watch Party

A real-time YouTube Watch Party application that allows multiple users to watch the same YouTube video together while keeping playback synchronized across all participants.

Users can create or join rooms, control synchronized playback based on their role, manage participants, and promote participants to moderators.

## Live Application

**Frontend:** https://youtube-watch-party-one.vercel.app/

**Backend:** https://youtube-watch-party-backend-ik95.onrender.com/

**GitHub:** https://github.com/satviktyagi12/youtube-watch-party

## Features

### Room Management

- Create a unique watch-party room
- Join an existing room using a room code or room URL
- Room creator automatically becomes the Host
- New users join as Participants by default
- Copy a room invite link
- Real-time participant list

### YouTube Watch Party

- YouTube IFrame Player API integration
- Play/pause synchronization
- Seek synchronization
- Change-video synchronization
- Late joiners receive the current video and playback state
- Custom playback controls
- YouTube URLs and video IDs are supported

### Role-Based Access Control

#### Host

- Play
- Pause
- Seek
- Change video
- Promote participants to Moderator
- Change Moderator back to Participant
- Remove participants

#### Moderator

- Play
- Pause
- Seek
- Change video

Moderators cannot assign roles or remove participants.

#### Participant

- Watch the synchronized video
- Cannot control playback
- Cannot seek
- Cannot change the video
- Cannot manage other participants

Playback and management permissions are validated on the backend. Frontend controls are only a UI restriction.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Socket.IO Client
- YouTube IFrame Player API

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- Mongoose
- MongoDB Atlas

### Deployment

- Vercel - Frontend
- Render - Backend and WebSocket server
- MongoDB Atlas - Database

## Architecture

The application uses a client-server architecture with Socket.IO for real-time communication.


                       Browser
               React + YouTube Player
                       |
                HTTP / Socket.IO
                       |
                       v
             Node.js + Express Server
                       |
              +--------+--------+
              |                 |
              v                 v
        RoomManager        MongoDB / Mongoose
        Room / Users       Database Layer
              |
              v
       Active Room State

Active room state is maintained in memory by RoomManager for fast realtime operations.

MongoDB is configured through Mongoose and provides the database layer/model foundation. Persistent active-room storage is not implemented in the MVP.

# Real-Time Synchronization Flow
User clicks Play / Pause / Seek / Change Video
                     |
                     v
              React component
                     |
                     v
             Socket.IO client
                     |
                     v
              Socket.IO server
                     |
                     v
          Validate room membership
                     |
                     v
           Validate participant role
                     |
                     v
              Update Room state
                     |
                     v
        Broadcast event to the room
                     |
                     v
       All connected clients receive it
                     |
                     v
             YouTube Player updates

The backend acts as the authority for room state and permissions.

# Playback Synchronization

The server maintains:

-->Current YouTube video ID
-->Playing/paused state
-->Current playback position
-->Participant list

When playback is active, the server tracks the playback start time so late joiners can receive an approximate current playback position.

# Role-Based Access Control         
                    Host
                   /    \
                  /      \
     Full control        Role management
                |
                v
            Moderator
                |
                v
          Playback control

          Participant
                |
                v
            Watch only

# WebSocket Events

Client → Server
| Event                | Purpose                           | Permission            |
| -------------------- | --------------------------------- | --------------------- |
| `join_room`          | Join a room                       | Any valid room member |
| `leave_room`         | Leave a room                      | Room member           |
| `play`               | Start playback                    | Host / Moderator      |
| `pause`              | Pause playback                    | Host / Moderator      |
| `seek`               | Change playback position          | Host / Moderator      |
| `change_video`       | Change YouTube video              | Host / Moderator      |
| `assign_role`        | Assign Moderator/Participant role | Host                  |
| `remove_participant` | Remove a participant              | Host                  |

Server → Client     
| Event                 | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `sync_state`          | Send current room state                    |
| `play`                | Synchronize playback start                 |
| `pause`               | Synchronize playback pause                 |
| `seek`                | Synchronize playback position              |
| `change_video`        | Synchronize video changes                  |
| `user_joined`         | Notify room of a new participant           |
| `user_left`           | Notify room of a participant leaving       |
| `role_assigned`       | Notify room of a role change               |
| `participant_removed` | Notify clients about a removed user        |
| `room_closed`         | Notify users when the Host closes the room |
| `error`               | Communicate server-side validation errors  |

# REST API

Health Check
GET /api/health

Response:

{
  "success": true,
  "message": "Server is running"
}
Create Room
POST /api/rooms

Request:

{
  "username": "Satvik"
}

Response:

{
  "success": true,
  "message": "Room created successfully",
  "roomId": "ABC123",
  "hostUserId": "..."
}

Get Room
GET /api/rooms/:roomId

Returns the current room state for a valid room.

# Project Structure
youtube-watch-party/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── home/
│   │   │   └── room/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── classes/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

# Local Development

Requirements-
Node.js 20+
npm
MongoDB Atlas account or MongoDB deployment
Git

Clone the repository-
git clone https://github.com/satviktyagi12/youtube-watch-party.git
cd youtube-watch-party

Frontend Setup-
cd client
npm install

Create client/.env:

VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

Start the frontend:

npm run dev

Frontend:

http://localhost:5173
Backend Setup
cd ../server
npm install

Create server/.env:

PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string

Start the backend:

npm run dev

Backend:

http://localhost:5000
Production Build

Frontend:

cd client
npm run build

Backend:

cd server
npm run build

# Environment Variables
Frontend
VITE_API_URL=
VITE_SOCKET_URL=

These are public client-side configuration values used by the frontend.

Backend
PORT=
CLIENT_URL=
MONGODB_URI=

The MongoDB connection string must never be committed to Git.

Real .env files are ignored by Git. .env.example files contain only placeholders.

# Deployment

Frontend - Vercel

Root directory:

client

Production environment variables:

VITE_API_URL=https://youtube-watch-party-backend-ik95.onrender.com
VITE_SOCKET_URL=https://youtube-watch-party-backend-ik95.onrender.com


Backend - Render

Root directory:

server

Build command:

npm install && npm run build

Start command:

npm start

Production environment variables:

CLIENT_URL=https://youtube-watch-party-one.vercel.app
MONGODB_URI=your_mongodb_connection_string
PORT=5000

# Testing

The application was tested locally and in production with multiple browser sessions.

Tested scenarios include:

Room creation
Room joining
Host and Participant roles
Moderator promotion
Moderator permissions
Participant restrictions
Play synchronization
Pause synchronization
Seek synchronization
Video-change synchronization
Three-user synchronization
Late participant synchronization
Participant leaving
Participant removal
Moderator removal
Host refresh and reconnect
Host leaving and room closure
Invalid room code
Invalid YouTube URL
Production Vercel → Render communication

# Design Decisions and Trade-offs

In-memory Active Room State--

Active room state is maintained through the RoomManager class.

This keeps realtime operations simple and fast for the MVP.

The trade-off is that active rooms are not horizontally scalable across multiple backend instances and active room state is lost if the server process restarts.

A production-scale implementation could use Redis for shared state and pub/sub.

Host Leaving--

Host transfer is optional in the assignment and is not implemented in this MVP.

When the Host explicitly leaves:
Host leaves
     |
     v
Room closes
     |
     v
Remaining participants are notified
     |
     v
Users are redirected to the home page

# Authentication

Authentication was intentionally omitted because it is listed as a bonus feature. Users are identified using generated participant IDs and Socket.IO sessions.

# Future Improvements
Persistent room state using MongoDB
Authentication
Host transfer
Redis adapter for multi-instance Socket.IO
Horizontal scaling
Persistent chat
Emoji reactions
Connection recovery
More advanced playback drift correction
Automated integration tests
# AI Assistance
ChatGPT was used during development for:
Project structure planning
TypeScript and React scaffolding
Socket.IO architecture
Debugging and error resolution
RBAC implementation guidance
Deployment configuration
README and documentation preparation

Application behavior was manually tested in both local and production environments.

# Assignment Scope

The implemented MVP focuses on the assignment's required functionality:
Room creation and joining
        +
YouTube playback
        +
Real-time synchronization
        +
Role-based access control
        +
Backend permission enforcement
        +
Participant management
        +
Production deployment

--Optional bonus features were intentionally left out where they would add complexity without improving the core assignment requirements.