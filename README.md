# Real-Time Chat Backend & Frontend

A minimal in-memory real-time chat application using WebSockets and a React frontend.

---

## Functional Requirements

1. **Real-Time Messaging**  
   - Users connect via WebSocket.  
   - Messages are delivered instantly if both are online.

2. **Offline Message Handling**  
   - Messages to offline users are buffered in-memory.  
   - Upon reconnect, buffered messages are flushed in order.

3. **Message Acknowledgment**  
   - Every message sent receives a `{ type: 'ack' }` response.

4. **Chat History Retrieval**  
   - `GET /messages?user1=A&user2=B` returns full history (in-memory).

---

## Tech Stack

- **Backend:** Node.js, Express, `ws` (WebSocket)
- **Frontend:** React (Vite)

---

## Getting Started

### Prerequisites

- Node.js v14+
- npm

### Install & Run

```bash
# Clone
git clone https://github.com/your-repo/chat-app.git

# Install backend deps & start server
npm install
node server.js
# Server listens on http://localhost:3000

# In a new terminal: start frontend
cd ./chat-app
npm install
npm run dev
# Opens at http://localhost:5173



Usage & Demo
1. Real-time Chat
Open two browser tabs at http://localhost:5173.

Log in as Alice in tab A and Bob in tab B.

In Alice’s sidebar, Write “Bob” on top left input → Click chat button 
Then Type a message(on the bottom text area provided) → Send.

In Bob's tab, Write “Alice” on top left input → Click chat button , Bob see's message instantly.

2. Offline Buffering
In Bob’s tab, click the Offline toggle (turns red).

Alice sends 2–3 messages.

Bob goes Online again.

Bob immediately receives all buffered messages in order.

3. Fetching Chat History
Click the “Chat with {user}” button in the sidebar.

Frontend calls
GET http://localhost:3000/messages?user1=Alice&user2=Bob
Full history is loaded into the chat window.
