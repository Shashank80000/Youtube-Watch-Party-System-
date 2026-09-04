# YouTube Watch Party

A full-stack app for watching YouTube videos together in synchronized rooms. Users can create or join a room, select a YouTube video, and see playback and participant changes in real time.

## Features

- Account registration and login using JWTs
- Six-character room codes and shareable room URLs
- Host, moderator, and participant roles
- Synchronized video selection, play, pause, and seeking through Socket.IO
- Participant join/leave updates
- Host controls to promote/demote moderators and remove participants
- Embedded YouTube player using the YouTube IFrame API

## Tech stack

| Area | Technology |
| --- | --- |
| Client | React 19, Vite, React Router, Tailwind CSS, Axios |
| Realtime | Socket.IO client and server |
| Server | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens and bcryptjs |

## Project layout

```text
client/                 React single-page application
  src/pages/            Login, registration, room, and watch-party views
  src/components/       Player, controls, participant list, and navigation
  src/services/         HTTP API client
  src/socket/           Socket.IO client
server/                 Express and Socket.IO API
  src/controllers/      Authentication and room request handlers
  src/models/           MongoDB User and Room schemas
  src/routes/           REST endpoints
  src/socket/           Realtime room and playback event handlers
```

## Prerequisites

- Node.js 20+ (recommended)
- A MongoDB database, local or hosted

## Getting started

1. Install the server dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create `server/.env`:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/youtube-watch-party
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=5000
   ```

3. Start the API and Socket.IO server:

   ```bash
   npm run dev
   ```

4. In a second terminal, install and start the client:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`), register an account, then create or join a room.

The browser client currently expects the server at `http://localhost:5000`. Update both `client/src/services/api.js` and `client/src/socket/socket.js` when deploying to another URL.

## How rooms work

1. An authenticated user creates a room and becomes its host.
2. Others join using its room code or `/room/:roomId` invite URL.
3. The host or a moderator pastes a supported YouTube URL to choose the video.
4. Playback commands are stored with the room and broadcast to everyone currently connected.
5. The host can manage participant roles and remove participants.

Participants can view the player but cannot control playback or change the video. Moderators can control playback and change videos; only the host can assign roles or remove people.

## REST API

Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| POST | `/api/rooms/create` | Create a room (authenticated) |
| POST | `/api/rooms/:roomId/join` | Join a room (authenticated) |
| GET | `/api/rooms/:roomId` | Fetch a room (authenticated) |
| PATCH | `/api/rooms/:roomId/participants/:userId/role` | Change a participant role (host only) |
| DELETE | `/api/rooms/:roomId/participants/:userId` | Remove a participant (host only) |

## Socket events

The client joins with `join_room`. The server persists and broadcasts `sync_state` for playback (`playing`/`paused`), seeking, and video changes. It also emits participant events: `user_joined`, `user_left`, `role_assigned`, `participant_removed`, and `removed_from_room`.

## Scripts

| Directory | Command | Description |
| --- | --- | --- |
| `server` | `npm run dev` | Run the server with Nodemon |
| `server` | `npm start` | Run the server with Node.js |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Create a production client build |
| `client` | `npm run lint` | Run Oxlint |

## Current implementation notes

- YouTube videos must allow iframe embedding; unavailable videos show an in-app error.
- There are no automated tests yet.
- CORS is currently open and Socket.IO connections are not authenticated. Before a public deployment, restrict allowed origins and authenticate socket connections server-side rather than trusting the `userId` provided by the browser.
- Room IDs are randomly generated but creation does not retry on a collision; production code should handle the database uniqueness error.
